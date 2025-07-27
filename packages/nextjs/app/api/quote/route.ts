import { HashLock, NetworkEnum, PresetEnum } from "@1inch/cross-chain-sdk";
import { randomBytes } from "node:crypto";
import { fusionSdk } from "~~/utils/customFusionSdk";

const sdk = fusionSdk;

const walletAddress = "0xD2692F9df925D18D527ABe8b3d99EE9E9C8d75AE";

export async function GET() {
  try {
    // 10 USDT (Polygon) -> BNB (BSC)

    // estimate
    const quote = await sdk.getQuote({
      amount: "10000000",
      srcChainId: NetworkEnum.POLYGON,
      dstChainId: NetworkEnum.BINANCE,
      enableEstimate: true,
      srcTokenAddress: "0xc2132d05d31c914a87c6611c10748aeb04b58e8f", // USDT
      dstTokenAddress: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", // BNB
      walletAddress,
    });

    const preset = PresetEnum.fast;

    // generate secrets
    const secrets = Array.from({
      length: quote.presets[preset].secretsCount,
    }).map(() => "0x" + randomBytes(32).toString("hex"));

    const hashLock =
      secrets.length === 1
        ? HashLock.forSingleFill(secrets[0])
        : HashLock.forMultipleFills(HashLock.getMerkleLeaves(secrets));

    const secretHashes = secrets.map(s => HashLock.hashSecret(s));

    // create order
    const { hash, quoteId, order } = await sdk.createOrder(quote, {
      walletAddress,
      hashLock,
      preset,
      source: "pay-fusion",
      secretHashes,
    });
    console.log(hash, "order created");
    console.log(quoteId, "quote id");
    console.log(order, "order ");

    const orderClear = JSON.parse(JSON.stringify(order));

    return Response.json({
      srcChainId: quote.srcChainId,
      hash: hash.toString(),
      order: orderClear,
      quoteId,
      secretHashes,
    });
  } catch (err) {
    console.log(err);
    return Response.json({ err: err }, { status: 400 });
  }
}
