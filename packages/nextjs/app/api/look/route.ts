// const ONENCH_KEY = process.env.ONENCH_KEY;

export async function POST(request: Request) {
  const body = await request.body;

  console.log(body);

  // const payload = {
  //   order: {
  //     salt: "42",
  //     makerAsset: fromChainId,
  //     takerAsset: "0x0000000000000000000000000000000000000001",
  //     maker: "0x0000000000000000000000000000000000000001",
  //     receiver: "0x0000000000000000000000000000000000000001",
  //     makingAmount: "100000000000000000000",
  //     takingAmount: "100000000000000000000",
  //     makerTraits: "0",
  //   },
  //   srcChainId: 128123,
  //   signature,
  //   extension: "0x0",
  //   quoteId: "string",
  //   secretHashes: [hashlock],
  // };

  // console.log(payload);

  try {
    // const response = await fetch("https://api.1inch.dev/fusion-plus/relayer/v1.0/submit", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //     Authorization: `Bearer ${ONENCH_KEY}`,
    //   },
    //   body: JSON.stringify(payload),
    // });

    // if (!response.ok) {
    //   const errorBody = await response.json();
    //   throw new Error(`Relayer error: ${JSON.stringify(errorBody)}`);
    // }

    // const data = await response.json();
    // console.log("✅ Orden enviada correctamente:", data);
    return Response.json({ response: "ok" });
  } catch (err: any) {
    console.error("❌ Error al enviar la orden:", err.message);
    return Response.json({ err });
  }
}
