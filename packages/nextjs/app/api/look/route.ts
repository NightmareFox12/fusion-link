const ONENCH_KEY = process.env.ONENCH_KEY;

export async function POST(request: Request) {
  const {
    hashlock,
    signature,
    fromTokenAddress,
    toTokenAddress,
    fromAddress,
    toAddress,
    fromAmount,
    toAmount,
    srcChainId,
  } = await request.json();

  // [Usuario inicia swap de USDC en Etherlink]
  //         ↓
  // [AtomicSwapIntent asegura la operación con hashlock]
  //         ↓
  // [Fusion+ detecta la liberación del secreto]
  //         ↓
  // [Relayer ejecuta swap USDC → USDT en Optimism]
  //         ↓
  // [Usuario recibe USDT en red destino]
  //Con fusion+ en ehterlink cross-chain. Como fusion es chimbin y aun no tiene etherlink tambien hay que hacer un tal Atomic Swap with Hashlock/Timelock for Intent-Based Execution

  const payload = {
    order: {
      salt: BigInt(Date.now()).toString(),
      makerAsset: fromTokenAddress,
      takerAsset: toTokenAddress,
      maker: fromAddress,
      receiver: toAddress,
      makingAmount: fromAmount,
      takingAmount: toAmount,
      makerTraits: "0x" + BigInt(0).toString(16).padStart(64, "0"),
    },
    srcChainId: srcChainId,
    signature,
    extension: "0x" + "00".repeat(32),
    postInteraction:
      "0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000001",
    quoteId: "2",
    secretHashes: [hashlock],
  };

  console.log(payload);

  try {
    const response = await fetch("https://api.1inch.dev/fusion-plus/relayer/v1.0/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ONENCH_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.json();
      throw new Error(`Relayer error: ${JSON.stringify(errorBody)}`);
    }

    const data = await response.json();
    console.log("✅ Orden enviada correctamente:", data);
    return Response.json({ response: "ok" });
  } catch (err: any) {
    console.error("❌ Error al enviar la orden:", err.message);
    return Response.json({ err });
  }
}
