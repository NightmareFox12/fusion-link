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

  const payload = {
    order: {
      salt: "42",
      makerAsset: fromTokenAddress,
      takerAsset: toTokenAddress,
      maker: fromAddress,
      receiver: toAddress,
      makingAmount: fromAmount,
      takingAmount: toAmount,
      makerTraits: "0",
    },
    srcChainId: JSON.parse(srcChainId),
    signature,
    extension: "0x0",
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
