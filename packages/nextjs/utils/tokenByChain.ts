import { etherlinkTestnet } from "viem/chains";

export interface IToken {
  value: string;
  label: string;
  symbol: string;
  icon: string;
  decimal: 6 | 18;
}

const allTokens: IToken[] = [
  {
    value: "0x4C2AA252BEe766D3399850569713b55178934849",
    label: "USDC Testnet",
    symbol: "USDC",
    icon: "usdc",
    decimal: 6,
  },
];

const etherlinkTokens: IToken[] = [
  {
    value: "0x",
    label: "Tezos Testnet",
    symbol: "XTZ",
    icon: "xtz",
    decimal: 18,
  },
];

export const tokensByChain = (chainID: number): IToken[] => {
  if (chainID === etherlinkTestnet.id) {
    return allTokens.concat(etherlinkTokens);
  } else {
    return allTokens;
  }
};
