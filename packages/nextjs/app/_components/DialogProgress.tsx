"use client";

import React, { useEffect, useState } from "react";
import { ArrowRight, FilePen, LockOpen, RefreshCcw } from "lucide-react";
import { parseUnits } from "viem/utils";
import { useSignTypedData } from "wagmi";
import { Button } from "~~/components/shadcn/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~~/components/shadcn/ui/dialog";
import { Progress } from "~~/components/shadcn/ui/progress";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth/useScaffoldReadContract";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth/useScaffoldWriteContract";

type DialogSwapProgressProps = {
  address: string;
  factoryAddress: `0x${string}` | undefined;
  fromNetworkId: string;
  fromTokenAddress: string;
  fromAmount: string;
  toNetworkId: string;
  toTokenAddress: string;
  decimal: 6 | 18 | undefined;
};

const DialogSwapProgress: React.FC<DialogSwapProgressProps> = ({
  address,
  factoryAddress,
  fromNetworkId,
  fromTokenAddress,
  fromAmount,
  toNetworkId,
  toTokenAddress,
  decimal,
}) => {
  const { signTypedDataAsync } = useSignTypedData();

  //states
  const [hashlock, setHashLock] = useState<`0x${string}`>("0x");
  const [currentProgress, setCurrentProgress] = useState<number>(0);

  //smart contract
  const { writeContractAsync: writeTokenAsync } = useScaffoldWriteContract({ contractName: "USDC_Testnet" });

  const { writeContractAsync: writeSwapFactoryAsync } = useScaffoldWriteContract({ contractName: "SwapFactory" });

  // const { data: allowance } = useScaffoldReadContract({
  //   contractName: "USDC_Testnet",
  //   functionName: "allowance",
  //   args: [address, factoryAddress],
  // });

  const { data: swapAddress } = useScaffoldReadContract({
    contractName: "SwapFactory",
    functionName: "swaps",
    args: [address],
  });

  //effects
  useEffect(() => {
    const getHashLock = async () => {
      try {
        const req = await fetch("api/hashlock");

        const res = await req.json();

        console.log(res);
        setHashLock(res);
      } catch (err) {
        console.log(err);
      }
    };
    getHashLock();
  }, []);

  //functions
  const handleApprove = async () => {
    try {
      await writeTokenAsync({
        functionName: "approve",
        args: [factoryAddress, parseUnits(fromAmount, 6)],
      });

      setCurrentProgress(33.3);
    } catch (e) {
      console.error("Error setting greeting:", e);
    }
  };

  const handleCreateSwap = async () => {
    try {
      if (decimal === undefined) return;
      await writeSwapFactoryAsync({
        functionName: "createSwap",
        args: [
          hashlock, // Hash del secreto
          3600n, // 1 hora
          address, // Destinatario
          fromTokenAddress, // Contrato del token
          parseUnits(fromAmount, decimal),
        ],
      });

      setCurrentProgress(66.6);
    } catch (e) {
      console.error("Error setting greeting:", e);
    }
  };

  const handleSign = async () => {
    if (decimal === undefined) return;

    const amount = parseUnits(fromAmount, decimal);
    const signature = await signTypedDataAsync({
      domain: {
        name: "FusionSwapIntentERC20",
        version: "1",
        chainId: parseInt(toNetworkId),
        verifyingContract: swapAddress,
      },
      types: {
        SwapIntent: [
          { name: "sender", type: "address" },
          { name: "receiver", type: "address" },
          { name: "fromChainId", type: "uint256" },
          { name: "toChainId", type: "uint256" },
          { name: "fromToken", type: "address" },
          { name: "toToken", type: "address" },
          { name: "amount", type: "uint256" },
          { name: "hashlock", type: "bytes32" },
          { name: "timelock", type: "uint256" },
        ],
      },
      primaryType: "SwapIntent",
      message: {
        sender: address,
        receiver: address,
        fromChainId: BigInt(fromNetworkId),
        toChainId: BigInt(toNetworkId),
        fromToken: fromTokenAddress,
        toToken: fromTokenAddress,
        amount,
        hashlock,
        timelock: BigInt(Math.floor(Date.now() / 1000)) + 3600n, //1 hour,
      },
    });

    console.log(signature);
    setCurrentProgress(99.9);
  };

  // const sendSign = async (
  //   signature: string,
  //   fromTokenAddress: string,
  //   toTokenAddress: string,
  //   fromAddress: string,
  //   toAddress: string,
  //   amount: bigint,
  //   srcChainId: string,
  //   dstChainID: string,
  // ) => {
  //   // await sendSign(signature, fromTokenAddress, fromTokenAddress, address, address, amount, fromNetworkId, toNetworkId);

  //   try {
  //     const req = await fetch("api/look", {
  //       method: "POST",
  //       headers: {
  //         "Content-type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         hashlock,
  //         signature,
  //         fromTokenAddress,
  //         toTokenAddress,
  //         fromAddress,
  //         toAddress,
  //         amount,
  //         srcChainId,
  //         dstChainID,
  //       }),
  //     });

  //     const res = await req.json();

  //     console.log(res);
  //   } catch (err) {
  //     console.log(err);
  //   }
  // };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          className="bg-gradient w-full"
          disabled={
            swapAddress === undefined ||
            fromAmount === "" ||
            parseFloat(fromAmount) === 0 ||
            decimal === undefined ||
            fromTokenAddress === "" ||
            (fromTokenAddress === toTokenAddress && fromNetworkId === toNetworkId) ||
            factoryAddress === undefined ||
            fromNetworkId === "" ||
            toNetworkId === ""
          }
        >
          Next
          <ArrowRight />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-purple-50">
        <DialogHeader>
          <DialogTitle className="text-center">
            {currentProgress < 30
              ? " Approval of tokens for exchange"
              : currentProgress <= 60
                ? "Create exchange intent"
                : ""}
          </DialogTitle>
          <DialogDescription className="text-black/80">
            {currentProgress < 30
              ? " Before performing the swap, you need to approve the amount of tokens you want to exchange. This approval allows the smart contract to access your tokens and execute the transaction securely."
              : currentProgress <= 60
                ? "The exchange intention is deployed with hashlock and timelock. This allows the swap to be executed only if the correct secret is revealed before the time limit expires."
                : ""}
          </DialogDescription>
        </DialogHeader>
        <section className="flex flex-col gap-4 justify-center">
          <div>
            <p className="text-sm font-semibold text-center mt-0">
              {currentProgress < 30 ? 1 : currentProgress <= 60 ? 2 : 3}/3
            </p>
            <Progress value={currentProgress} />
          </div>
          {currentProgress < 30 ? (
            <Button className="bg-gradient" onClick={handleApprove}>
              <LockOpen />
              Aprove amount
            </Button>
          ) : currentProgress <= 60 ? (
            <Button className="bg-gradient" onClick={handleCreateSwap}>
              <RefreshCcw />
              Create Swap
            </Button>
          ) : (
            <Button className="bg-gradient" onClick={handleSign}>
              <FilePen /> Sign
            </Button>
          )}
        </section>
      </DialogContent>
    </Dialog>
  );
};

export default DialogSwapProgress;

// DEbo crear mi propio RelayerApi, y mi resolver es mi propia wallet para hacer el cambio cross chain mientras pasa el handleWebpackExternalForEdgeRuntime, el relaye debo desplegarlo en un VPS free para dejarlo despierto y escuchando eventos con viem

// import { createWalletClient, http } from 'viem'
// import { privateKeyToAccount } from 'viem/accounts'
// import { sepolia } from '@viem/chains'
// import dotenv from 'dotenv'
// import { abi } from './SwapContractAbi'

// dotenv.config()

// const contractAddress = '0xTuDireccionDelContrato'
// const privateKey = process.env.RELAYER_KEY as `0x${string}`

// async function main() {
//   const account = privateKeyToAccount(privateKey)

//   const client = createWalletClient({
//     account,
//     chain: sepolia,
//     transport: http()
//   })

//   const hash = await client.writeContract({
//     address: contractAddress,
//     abi,
//     functionName: 'executeSwap',
//     args: [], // Aquí los argumentos si requiere la función
//   })

//   console.log('Tx enviada:', hash)
// }

// main().catch(console.error)
