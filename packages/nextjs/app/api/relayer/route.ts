import { createPublicClient, createWalletClient, getContract, http, keccak256 } from "viem";
import { parseAbi } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { etherlinkTestnet, optimismSepolia } from "viem/chains";

const RELAYER_PRIVATE_KEY = process.env.MY_PRIVATE_KEY as `0x${string}`;
const ETHERLINK_RPC = "https://node.ghostnet.etherlink.com";
const OPTIMISM_RPC = "https://sepolia.optimism.io";

// ABI corregido para el contrato de swap en Etherlink.
// La función executeSwap ahora coincide con la firma del contrato.
const abi = parseAbi([
  "function executeSwap(bytes32 secret, uint256 fromChainId, uint256 toChainId, address fromToken, address toToken, bytes signature)",
  "function revealSecret(bytes32 _secret)",
  "function getSwapStatus() view returns (string)",
  "function amount() view returns (uint256)",
  "function timelockExpiration() view returns (uint256)",
  "function timelockSeconds() view returns (uint256)", // Usamos esta para la verificación
  "function hashlock() view returns (bytes32)",
  "function sender() view returns (address)",
  "function receiver() view returns (address)",
  "function token() view returns (address)",
]);

const tokenAbi = parseAbi(["function transfer(address to, uint256 amount) returns (bool)"]);

export async function POST(request: Request) {
  if (!RELAYER_PRIVATE_KEY) {
    return new Response(JSON.stringify({ error: "Relayer private key not configured." }), {
      status: 500,
    });
  }

  try {
    const body = await request.json();

    const {
      contractAddress,
      fromTokenAddress,
      toTokenAddress,
      fromChainId,
      toChainId,
      signature,
      secret,
      receiverAddress,
      fromAmount,
      tokenDecimal,
    } = body;

    // Validación de parámetros.
    if (
      !contractAddress ||
      !fromTokenAddress ||
      !toTokenAddress ||
      !fromChainId ||
      !toChainId ||
      !signature ||
      !secret ||
      !receiverAddress ||
      !fromAmount ||
      !tokenDecimal
    ) {
      return new Response(JSON.stringify({ error: "Missing required parameters." }), {
        status: 400,
      });
    }

    const account = privateKeyToAccount(RELAYER_PRIVATE_KEY);

    // Clientes de viem para Etherlink y Optimism.
    const etherlinkWalletClient = createWalletClient({
      account,
      chain: etherlinkTestnet,
      transport: http(ETHERLINK_RPC),
    });

    const etherlinkPublicClient = createPublicClient({
      chain: etherlinkTestnet,
      transport: http(ETHERLINK_RPC),
    });

    const optimismWalletClient = createWalletClient({
      account,
      chain: optimismSepolia,
      transport: http(OPTIMISM_RPC),
    });

    console.log("Starting cross-chain swap process based on frontend request...");

    // 1. VERIFICAR LA DIRECCIÓN Y OBTENER LOS DATOS DEL CONTRATO EN ETHERLINK.
    try {
      const contractCode = await etherlinkPublicClient.getBytecode({ address: contractAddress });
      if (contractCode === "0x") {
        throw new Error("Provided address is not a contract.");
      }
    } catch (err) {
      console.log(err);
      console.error(`❌ La dirección ${contractAddress} no contiene código de contrato o no es válida.`);
      return new Response(JSON.stringify({ error: "Invalid contract address." }), { status: 400 });
    }

    const swapContract = getContract({
      address: contractAddress,
      abi: abi,
      client: etherlinkPublicClient,
    });

    // Leemos el hashlock del contrato para verificar el secreto
    const contractHashlock = await swapContract.read.hashlock();

    // 2. VERIFICAR QUE EL SECRETO CORRESPONDA AL HASHLOCK DEL CONTRATO.
    if (keccak256(secret) !== contractHashlock) {
      console.error("❌ El secreto revelado no coincide con el hashlock del contrato.");
      return new Response(JSON.stringify({ error: "Secret does not match hashlock." }), { status: 400 });
    }

    // 3. TRANSFERIR TOKENS EN OPTIMISM (Cadena de destino).
    try {
      // El relayer debe tener los tokens para transferirlos al destinatario.
      // Aquí se usaría el fromAmount del frontend.
      const txHashOptimism = await optimismWalletClient.writeContract({
        address: toTokenAddress, // El contrato del token
        abi: tokenAbi,
        functionName: "transfer",
        args: [receiverAddress, BigInt(fromAmount)],
      });
      console.log(`🚀 Transaction sent on Optimism. TX Hash: ${txHashOptimism}`);
    } catch (err) {
      console.error("❌ Error transferring tokens on Optimism:", err);
      return new Response(JSON.stringify({ error: "Error transferring tokens on Optimism." }), { status: 500 });
    }

    // 4. EJECUTAR EL SWAP EN LA CADENA DE ORIGEN (Etherlink) PARA LIBERAR LOS FONDOS.
    // El relayer ahora tiene el secreto y puede reclamar los tokens.
    try {
      const executeTxHash = await etherlinkWalletClient.writeContract({
        address: contractAddress,
        abi: abi,
        functionName: "executeSwap",
        args: [secret, BigInt(fromChainId), BigInt(toChainId), fromTokenAddress, toTokenAddress, signature],
      });
      console.log(`✅ Swap executed on Etherlink. TX Hash: ${executeTxHash}`);
    } catch (err) {
      console.error("❌ Error executing swap on Etherlink:", err);
      return new Response(JSON.stringify({ error: "Error executing swap on Etherlink." }), { status: 500 });
    }

    // La función revealSecret no es necesaria si el relayer ejecuta el swap.
    // El 'executeSwap' del contrato corregido ya hace la verificación y transfiere.

    return new Response(JSON.stringify({ message: "Swap process completed successfully." }), {
      status: 200,
    });
  } catch (err) {
    console.error("❌ General error in relayer:", err);
    return new Response(JSON.stringify({ error: "Internal server error." }), {
      status: 500,
    });
  }
}
