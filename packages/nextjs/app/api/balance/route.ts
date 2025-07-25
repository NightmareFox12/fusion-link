export async function GET(request: Request) {
  console.log(request);
  const url = "https://api.1inch.dev/balance/v1.2/10/balances/0xD2692F9df925D18D527ABe8b3d99EE9E9C8d75AE";

  try {
    const req = await fetch(url, {
      headers: {
        Authorization: "Bearer e6ep176Ne0qBeeAlSNoZQDbGuu3nVl0m",
      },
    });

    const res = await req.json();
    return Response.json(res);
  } catch (err) {
    console.log(err);
    return Response.json(err, { status: 400 });
  }
}
