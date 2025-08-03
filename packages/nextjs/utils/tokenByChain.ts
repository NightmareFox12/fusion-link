import { etherlinkTestnet } from "viem/chains";

export interface IToken {
  value: string;
  label: string;
  symbol: string;
  icon: string;
  decimal: 6 | 18;
}

const optimismTokens: IToken[] = [
  {
    value: "0x5fd84259d66Cd46123540766Be93DFE6D43130D7",
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
  {
    value: "0x4C2AA252BEe766D3399850569713b55178934849",
    label: "USDC Testnet",
    symbol: "USDC",
    icon: "usdc",
    decimal: 6,
  },
];

export const tokensByChain = (chainID: number): IToken[] => {
  if (chainID === etherlinkTestnet.id) {
    return etherlinkTokens;
  } else {
    return optimismTokens;
  }
};
