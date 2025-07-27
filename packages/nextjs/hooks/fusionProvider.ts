import { EIP712TypedData } from "@1inch/cross-chain-sdk";
import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { mainnet } from "viem/chains";
import scaffoldConfig from "~~/scaffold.config";

interface BlockchainProviderConnector {
  signTypedData(walletAddress: string, typedData: EIP712TypedData): Promise<string>;

  ethCall(contractAddress: string, callData: string): Promise<string>;
}

export class FusionProvider implements BlockchainProviderConnector {
  private readonly account;
  private readonly publicClient;
  private readonly walletClient;

  constructor(private readonly privatekey: `0x${string}`) {
    const alchemyApiKey = scaffoldConfig.alchemyApiKey;

    this.account = privateKeyToAccount(this.privatekey);

    this.publicClient = createPublicClient({
      chain: mainnet,
      transport: http(`https://mainnet.infura.io/v3/${alchemyApiKey}`),
    });

    this.walletClient = createWalletClient({
      account: this.account,
      chain: mainnet,
      transport: http(`https://mainnet.infura.io/v3/${alchemyApiKey}`),
    });
  }

  async signTypedData(walletAddress: string, typedData: any): Promise<string> {
    if (walletAddress.toLowerCase() !== this.account.address.toLowerCase()) {
      throw new Error("Wallet address mismatch");
    }

    const signature = await this.walletClient.signTypedData({
      account: this.account,
      domain: typedData.domain,
      types: typedData.types,
      primaryType: typedData.primaryType,
      message: typedData.message,
    });

    return signature;
  }

  async ethCall(contractAddress: string, callData: string): Promise<string> {
    const result = await this.publicClient.call({
      to: contractAddress as `0x${string}`,
      data: callData as `0x${string}`,
    });

    return result.data ?? "";
  }
}
