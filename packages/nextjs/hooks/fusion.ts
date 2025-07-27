import { EIP712TypedData } from "@1inch/cross-chain-sdk";
import { getPublicClient, getWalletClient } from "wagmi/actions";
import { wagmiConfig } from "~~/services/web3/wagmiConfig";

interface BlockchainProviderConnector {
  signTypedData(walletAddress: string, typedData: EIP712TypedData): Promise<string>;

  ethCall(contractAddress: string, callData: string): Promise<string>;
}

export class FusionProvider implements BlockchainProviderConnector {
  async signTypedData(walletAddress: string, typedData: EIP712TypedData): Promise<string> {
    const walletClient = await getWalletClient(wagmiConfig);

    if (!walletClient) throw new Error("No wallet client available");

    const [address] = await walletClient.getAddresses();
    if (address.toLowerCase() !== walletAddress.toLowerCase()) {
      throw new Error("Wallet address mismatch");
    }

    return await walletClient.signTypedData({
      account: address,
      domain: typedData.domain,
      types: typedData.types,
      message: typedData.message,
      primaryType: typedData.primaryType,
    });
  }

  async ethCall(contractAddress: string, callData: string): Promise<string> {
    const publicClient = getPublicClient(wagmiConfig);

    const result = await publicClient.call({
      to: contractAddress,
      data: callData as `0x${string}`,
    });

    return result.data ?? "";
  }
}
