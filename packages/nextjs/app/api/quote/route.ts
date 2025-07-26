// // export async function GET(request: Request) {
// // import { NetworkEnum, QuoteParams, SDK } from "@1inch/cross-chain-sdk";
// // export async function GET() {
// //   const extensionContract: Address = new Address("0x8273f37417da37c4a6c3995e82cf442f87a25d9c");
// //   const resolvingStartAt: bigint = now();
// //   const order: FusionOrder = FusionOrder.new(
// //     extensionContract,
// //     {
// //       makerAsset: new Address("0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"),
// //       takerAsset: new Address("0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"),
// //       makingAmount: 1000000000000000000n,
// //       takingAmount: 1420000000n,
// //       maker: new Address("0x00000000219ab540356cbb839cbe05303d7705fa"), //User wallet del user
// //       salt: 10n,
// //     },
// //     {
// //       auction: new AuctionDetails({
// //         duration: 180n,
// //         startTime: 1673548149n,
// //         initialRateBump: 50000,
// //         points: [
// //           {
// //             coefficient: 20000,
// //             delay: 12,
// //           },
// //         ],
// //       }),
// //       whitelist: Whitelist.new(resolvingStartAt, [
// //         {
// //           address: new Address("0x00000000219ab540356cbb839cbe05303d7705fa"), //User wallet del user
// //           allowFrom: 0n,
// //         },
// //       ]),
// //     },
// //   );
// //   const extension = order.extension.encode(); // => 0x...
// //   const builtOrder: LimitOrderV4Struct = order.build();
// //   console.log("extension", extension);
// //   console.log("builtOrder", builtOrder);
// //   /* => {
// //             maker: '0x00000000219ab540356cbb839cbe05303d7705fa',
// //             makerAsset: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
// //             makingAmount: '1000000000000000000',
// //             receiver: '0x0000000000000000000000000000000000000000',
// //             takerAsset: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
// //             takingAmount: '1420000000',
// //             makerTraits:
// //                 '29852648006495581632639394572552351243421169944806257724550573036760110989312',
// //             salt: '14832508939800728556409473652845244531014097925085'
// //         }
// // */
// // }
// import { HashLock, NetworkEnum, PrivateKeyProviderConnector, QuoteParams, SDK } from "@1inch/cross-chain-sdk";
// import { randomBytes } from "node:crypto";
// // import { Address, AuctionDetails, FusionOrder, LimitOrderV4Struct, Whitelist, now } from "@1inch/fusion-sdk";
// import { encodePacked, keccak256 } from "viem";
// import Web3 from "web3";
// export async function GET() {
//   const makerPrivateKey = "0x123....";
//   const makerAddress = "0x123....";
//   const nodeUrl = "https://node.mainnet.etherlink.com";
//   const blockchainProvider = new PrivateKeyProviderConnector(makerPrivateKey, new Web3(nodeUrl));
//   const sdk = new SDK({
//     url: "https://api.1inch.dev/fusion-plus",
//     authKey: "your-auth-key",
//     blockchainProvider,
//   });
//   const params: QuoteParams = {
//     srcChainId: NetworkEnum.ETHEREUM,
//     dstChainId: NetworkEnum.GNOSIS,
//     srcTokenAddress: "0x6b175474e89094c44da98b954eedeac495271d0f",
//     dstTokenAddress: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
//     amount: "1000000000000000000000",
//     enableEstimate: true,
//     walletAddress: makerAddress,
//   };
//   const quote = await sdk.getQuote(params);
//   const secretsCount = quote.getPreset().secretsCount;
//   const secrets = Array.from({ length: secretsCount }).map(() => randomBytes(32).toString("hex"));
//   const secretHashes = secrets.map(x => HashLock.hashSecret(x));
//   const hashLock =
//     secretsCount === 1
//       ? HashLock.forSingleFill(secrets[0])
//       : HashLock.forMultipleFills(
//           secretHashes.map((secretHash, i) =>
//             keccak256(encodePacked(["uint64", "bytes32"], [BigInt(i), secretHash as `0x${string}`])),
//           ) as (string & { _tag: "MerkleLeaf" })[],
//         );
//   const res = await sdk.createOrder(quote, {
//     walletAddress: makerAddress,
//     hashLock,
//     secretHashes,
//     // fee is an optional field
//     fee: {
//       takingFeeBps: 100, // 1% as we use bps format, 1% is equal to 100bps
//       takingFeeReceiver: "0x0000000000000000000000000000000000000000", //  fee receiver address
//     },
//   });
//   console.log(res);
// }
// // export async function GET() {
// //   const url = "https://api.1inch.dev/fusion-plus/quoter/v1.0/quote/build";
// //   const body = {
// //     srcChainId: 10, // Optimism
// //     dstChainId: 42793, // Etherlink
// //     srcTokenAddress: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85", // USDC
// //     dstTokenAddress: "0xfc24f770F94edBca6D6f885E12d4317320BcB401", // WETH
// //     amount: "1000000000000000000", // 1 ?? en wei
// //     walletAddress: "0xD2692F9df925D18D527ABe8b3d99EE9E9C8d75AE",
// //   };
// //   try {
// //     const req = await fetch(url, {
// //       method: "POST",
// //       headers: {
// //         "Content-Type": "application/json",
// //         Authorization: `Bearer ${ONENCH_KEY}`,
// //       },
// //       body: JSON.stringify(body),
// //     });
// //     if (!req.ok) throw new Error(`Error HTTP ${req.status}: ${await req.text()}`);
// //     const res = await req.json();
// //     console.log("✅ Orden Fusion+ generada:", res);
// //     return Response.json(res);
// //   } catch (err: any) {
// //     console.error("❌ Error al construir la orden Fusion+:", err.message);
// //     return Response.json(err, { status: 400 });
// //   }
// // }
// // try {
// //   console.log(request);
// //   const sdk = new SDK({
// //     url: "https://api.1inch.dev/fusion-plus",
// //     authKey: ONENCH_KEY,
// //   });
// //   const params: QuoteParams = {
// //     srcChainId: NetworkEnum.ETHEREUM,
// //     dstChainId: NetworkEnum.GNOSIS,
// //     srcTokenAddress: "0x6b175474e89094c44da98b954eedeac495271d0f",
// //     dstTokenAddress: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
// //     amount: "1000000000000000000000",
// //     walletAddress: "0xD2692F9df925D18D527ABe8b3d99EE9E9C8d75AE",
// //   };
// //   const quote = await sdk.getQuote(params);
// //   console.log(quote);
// //   return Response.json({ response: quote });
// // } catch (err) {
// //   console.log(err);
// //   return Response.json(err, { status: 400 });
// // }
import {
  HashLock,
  NetworkEnum,
  OrderStatus,
  PresetEnum,
  PrivateKeyProviderConnector,
  SDK,
} from "@1inch/cross-chain-sdk";
import { randomBytes } from "node:crypto";
import Web3 from "web3";

const privateKey = "0x";
const rpc = "https://ethereum-rpc.publicnode.com";
const authKey = process.env.ONENCH_KEY;
const source = "pay-fusion";

const web3 = new Web3(rpc);
const walletAddress = web3.eth.accounts.privateKeyToAccount(privateKey).address;

const sdk = new SDK({
  url: "https://api.1inch.dev/fusion-plus",
  authKey,
  blockchainProvider: new PrivateKeyProviderConnector(privateKey, web3), // only required for order creation
});

export async function GET() {
  async function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // async function main(): Promise<void> {
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
    source,
    secretHashes,
  });
  console.log({ hash }, "order created");

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
  // }

  // main();
}
