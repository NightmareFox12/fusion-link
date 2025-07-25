// import { NetworkEnum, QuoteParams, SDK } from "@1inch/cross-chain-sdk";

const ONENCH_KEY = process.env.ONENCH_KEY;

// export async function GET(request: Request) {
export async function GET() {
  const url = "https://api.1inch.dev/fusion-plus/quoter/v1.0/quote/build";

  const body = {
    srcChainId: 10, // Optimism
    dstChainId: 42793, // Etherlink
    srcTokenAddress: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85", // USDC
    dstTokenAddress: "0xfc24f770F94edBca6D6f885E12d4317320BcB401", // WETH
    amount: "1000000000000000000", // 1 ?? en wei
    walletAddress: "0xD2692F9df925D18D527ABe8b3d99EE9E9C8d75AE",
  };

  try {
    const req = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ONENCH_KEY}`,
      },
      body: JSON.stringify(body),
    });

    if (!req.ok) throw new Error(`Error HTTP ${req.status}: ${await req.text()}`);

    const res = await req.json();
    console.log("✅ Orden Fusion+ generada:", res);
    return Response.json(res);
  } catch (err: any) {
    console.error("❌ Error al construir la orden Fusion+:", err.message);
    return Response.json(err, { status: 400 });
  }
}

// try {
//   console.log(request);
//   const sdk = new SDK({
//     url: "https://api.1inch.dev/fusion-plus",
//     authKey: ONENCH_KEY,
//   });

//   const params: QuoteParams = {
//     srcChainId: NetworkEnum.ETHEREUM,
//     dstChainId: NetworkEnum.GNOSIS,
//     srcTokenAddress: "0x6b175474e89094c44da98b954eedeac495271d0f",
//     dstTokenAddress: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
//     amount: "1000000000000000000000",
//     walletAddress: "0xD2692F9df925D18D527ABe8b3d99EE9E9C8d75AE",
//   };

//   const quote = await sdk.getQuote(params);
//   console.log(quote);
//   return Response.json({ response: quote });
// } catch (err) {
//   console.log(err);
//   return Response.json(err, { status: 400 });
// }
