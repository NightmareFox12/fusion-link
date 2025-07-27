// import { CrossChainOrder, OrderStatus } from "@1inch/cross-chain-sdk";
// import { fusionSdk } from "~~/utils/customFusionSdk";

// const sdk = fusionSdk;

// async function sleep(ms: number): Promise<void> {
//   return new Promise(resolve => setTimeout(resolve, ms));
// }

//BUSCAR LA FORMA DE PASAR EL ORDER
export async function GET(request: Request) {
  try {
    console.log(request);
    // const order = new CrossChainOrder();

    // submit order
    // const _orderInfo = await sdk.submitOrder(quote.srcChainId, order, quoteId, secretHashes);
    // console.log(_orderInfo);
    // console.log({ hash }, "order submitted");
    // // submit secrets for deployed escrows

    // while (true) {
    //   const secretsToShare = await sdk.getReadyToAcceptSecretFills(hash);
    //   if (secretsToShare.fills.length) {
    //     for (const { idx } of secretsToShare.fills) {
    //       await sdk.submitSecret(hash, secrets[idx]);
    //       console.log({ idx }, "shared secret");
    //     }
    //   }
    //   // check if order finished
    //   const { status } = await sdk.getOrderStatus(hash);
    //   if (status === OrderStatus.Executed || status === OrderStatus.Expired || status === OrderStatus.Refunded) {
    //     break;
    //   }
    //   await sleep(1000);
    // }

    // const statusResponse = await sdk.getOrderStatus(hash);
    // console.log(statusResponse);
  } catch (err) {
    console.log(err);
    return Response.json({ err: err }, { status: 400 });
  }
}
