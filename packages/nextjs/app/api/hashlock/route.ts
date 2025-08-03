import { randomBytes } from "crypto";
import { keccak256 } from "viem";

export async function GET() {
  try {
    const secretBytes = randomBytes(32);

    const hashlock = keccak256(secretBytes);

    return Response.json({
      secret: "0x" + secretBytes.toString("hex"),
      hashlock: hashlock,
    });
  } catch (err) {
    console.log(err);
    return Response.json({ err: "Error when creating the hashlock" }, { status: 400 });
  }
}
