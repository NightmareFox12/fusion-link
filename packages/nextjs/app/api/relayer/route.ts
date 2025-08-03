import { createWalletClient, http, parseAbi, parseUnits } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { etherlinkTestnet, optimismSepolia } from "viem/chains";

const RELAYER_PRIVATE_KEY = process.env.MY_PRIVATE_KEY as `0x${string}`;
const ETHERLINK_RPC = "https://node.ghostnet.etherlink.com";
const OPTIMISM_RPC = "https://sepolia.optimism.io";

const abi = parseAbi([
  "function executeSwap(bytes32 secret, uint256 fromChainId, uint256 toChainId, address fromToken, address toToken, bytes signature)",
  "function revealSecret(bytes32 _secret)",
  "function getSwapStatus() view returns (string)",
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

    console.log(body);

    const {
      contractAddress,
      fromTokenAddress,
      toTokenAddress,
      fromAmount,
      fromChainId,
      toChainId,
      signature,
      secret,
      receiverAddress,
      tokenDecimal,
    } = body;

    if (
      !contractAddress ||
      !fromTokenAddress ||
      !toTokenAddress ||
      !fromAmount ||
      !fromChainId ||
      !toChainId ||
      !signature ||
      !secret ||
      !receiverAddress ||
      tokenDecimal === undefined
    ) {
      return new Response(JSON.stringify({ error: "Missing required parameters." }), {
        status: 400,
      });
    }

    const account = privateKeyToAccount(RELAYER_PRIVATE_KEY);

    // Clients de viem for Etherlink y Optimism
    const etherlinkWalletClient = createWalletClient({
      account,
      chain: etherlinkTestnet,
      transport: http(ETHERLINK_RPC),
    });
    const optimismWalletClient = createWalletClient({ account, chain: optimismSepolia, transport: http(OPTIMISM_RPC) });

    console.log("Starting cross-chain swap process based on frontend request...");

    try {
      const parsedAmount = parseUnits(fromAmount, tokenDecimal);
      const txHashOptimism = await optimismWalletClient.writeContract({
        address: toTokenAddress,
        abi: tokenAbi,
        functionName: "transfer",
        args: [receiverAddress, parsedAmount],
      });
      console.log(`🚀 Transaction sent on Optimism. TX Hash: ${txHashOptimism}`);
    } catch (err) {
      console.error("❌ Error transferring tokens on Optimism:", err);
      return new Response(JSON.stringify({ error: "Error transferring tokens on Optimism." }), { status: 500 });
    }

    try {
      const revealTxHash = await etherlinkWalletClient.writeContract({
        address: contractAddress,
        abi: abi,
        functionName: "revealSecret",
        args: [secret],
      });
      console.log(`🔓 Secret revealed on Etherlink. TX Hash: ${revealTxHash}`);
    } catch (err) {
      console.error("❌ Error revealing secret on Etherlink:", err);
      return new Response(JSON.stringify({ error: "Error revealing secret on Etherlink." }), { status: 500 });
    }

    // 4. Ejecutar el swap en la cadena de origen (Etherlink)
    // La transacción final que libera los fondos bloqueados.
    try {
      const executeTxHash = await etherlinkWalletClient.writeContract({
        address: contractAddress, // Contrato FusionSwapIntentERC20 en Etherlink
        abi: abi,
        functionName: "executeSwap",
        args: [secret, BigInt(fromChainId), BigInt(toChainId), fromTokenAddress, toTokenAddress, signature],
      });
      console.log(`✅ Swap executed on Etherlink. TX Hash: ${executeTxHash}`);
    } catch (err) {
      console.error("❌ Error executing swap on Etherlink:", err);
      return new Response(JSON.stringify({ error: "Error executing swap on Etherlink." }), { status: 500 });
    }

    // Devolver una respuesta exitosa
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
