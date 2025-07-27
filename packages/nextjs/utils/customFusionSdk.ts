import { SDK } from "@1inch/cross-chain-sdk";
import { FusionProvider } from "~~/hooks/fusionProvider";

//constants
const authKey = process.env.ONENCH_KEY;
const privateKey = (process.env.MY_PRIVATE_KEY as `0x${string}`) || ("" as `0x${string}`);

export const fusionSdk = new SDK({
  url: "https://api.1inch.dev/fusion-plus",
  authKey,
  blockchainProvider: new FusionProvider(privateKey),
});
