const ONENCH_KEY = process.env.ONENCH_KEY;

export async function GET(request: Request) {
  try {
    console.log(request);

    const req = await fetch(
      "https://api.1inch.dev/fusion/quoter/v2.0/10/quote/receive?chain=10&fromTokenAddress=0x7f5c764cbc14f9669b88837ca1490cca17c31607&toTokenAddress=0x94b008aa00579c1307b0ef2c499ad98a8ce58e58&amount=100000000000000&walletAddress=0xD2692F9df925D18D527ABe8b3d99EE9E9C8d75AE&enableEstimate=false",
      {
        headers: {
          Authorization: `Bearer ${ONENCH_KEY}`,
        },
      },
    );

    const res = await req.json();

    console.log(res);

    return Response.json({ higado: "si" });
  } catch (err) {
    console.log(err);
    return Response.json({ err: err }, { status: 400 });
  }
}
