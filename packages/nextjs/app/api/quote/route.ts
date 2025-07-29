import { HashLock, NetworkEnum, OrderStatus, PresetEnum } from "@1inch/cross-chain-sdk";
import { randomBytes } from "node:crypto";
import { fusionSdk } from "~~/utils/customFusionSdk";

const sdk = fusionSdk;

const walletAddress = "0xD2692F9df925D18D527ABe8b3d99EE9E9C8d75AE";

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function GET() {
  try {
    // 10 USDT (Polygon) -> BNB (BSC)

    // estimate
    //TODO: buscar la forma de hacer esto pero en la misma chain
    const quote = await sdk.getQuote({
      amount: "100000000000000",
      srcChainId: NetworkEnum.OPTIMISM,
      dstChainId: NetworkEnum.ARBITRUM,
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

    // submit order
    const _orderInfo = await sdk.submitOrder(quote.srcChainId, order, quoteId, secretHashes);
    console.log(_orderInfo);
    console.log({ hash }, "order submitted");
    // submit secrets for deployed escrows

    while (true) {
      const secretsToShare = await sdk.getReadyToAcceptSecretFills(hash);
      if (secretsToShare.fills.length) {
        for (const { idx } of secretsToShare.fills) {
          await sdk.submitSecret(hash, secrets[idx]);
          console.log({ idx }, "shared secret");
        }
      }
      // check if order finished
      const { status } = await sdk.getOrderStatus(hash);
      if (status === OrderStatus.Executed || status === OrderStatus.Expired || status === OrderStatus.Refunded) {
        break;
      }
      await sleep(1000);
    }

    const statusResponse = await sdk.getOrderStatus(hash);
    console.log(statusResponse);

    return Response.json({
      status: statusResponse.status,
    });
  } catch (err: any) {
    console.error("Error al enviar el pedido:", err);
    if (err.response) {
      console.error("El servidor respondió con estado:", err.response.status);
      console.error("Datos de la respuesta del servidor:", err.response.data); // ¡Esto es lo más útil!
      console.error("Cabeceras de la respuesta del servidor:", err.response.headers);
    } else if (err.request) {
      console.error("No se recibió respuesta del servidor:", err.request);
    } else {
      console.error("Error al configurar la solicitud:", err.message);
    }
    return Response.json(err, { status: 400 });
  }
}

// return Response.json({
//   srcChainId: quote.srcChainId,
//   hash: hash.toString(),
//   order: orderCleared,
//   quoteId,
//   secretHashes,
// });
