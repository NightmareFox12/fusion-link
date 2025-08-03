"use client";

import React, { useEffect, useState } from "react";
import { ArrowRight, FilePen, LockOpen, RefreshCcw } from "lucide-react";
import { keccak256, parseUnits, toBytes } from "viem/utils";
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
  const [salt, setSalt] = useState<`0x${string}`>("0x");
  const [secret, setSecret] = useState<`0x${string}`>("0x");
  const [hashlock, setHashLock] = useState<`0x${string}`>("0x");
  const [currentProgress, setCurrentProgress] = useState<number>(0);

  const [loadingRelayer, setLoadingRelayer] = useState<boolean>(false);

  //smart contract
  const { writeContractAsync: writeTokenAsync } = useScaffoldWriteContract({ contractName: "USDC_Testnet" });

  const { writeContractAsync: writeSwapFactoryAsync } = useScaffoldWriteContract({ contractName: "SwapFactory" });

  // const { data: allowance } = useScaffoldReadContract({
  //   contractName: "USDC_Testnet",
  //   functionName: "allowance",
  //   args: [address, factoryAddress],
  // });

  const { data: predictSwapAddress } = useScaffoldReadContract({
    contractName: "SwapFactory",
    functionName: "predictSwapAddress",
    args: [
      salt,
      "FusionSwapIntentERC20",
      "1",
      address,
      hashlock,
      3600n,
      address,
      fromTokenAddress,
      parseUnits(fromAmount, decimal ?? 18),
    ],
  });

  const { data: swapAddress } = useScaffoldReadContract({
    contractName: "SwapFactory",
    functionName: "swaps",
    args: [address],
  });

  //effects
  useEffect(() => {
    getHashLock();
  }, []);

  console.log(predictSwapAddress);

  //functions
  const getHashLock = async () => {
    try {
      const req = await fetch("api/hashlock");

      const res: { hashlock: `0x${string}`; secret: `0x${string}` } = await req.json();

      setHashLock(res.hashlock);
      setSecret(res.secret);
    } catch (err) {
      console.log(err);
    }
  };

  const handleApprove = async () => {
    try {
      await writeTokenAsync({
        functionName: "approve",
        args: [factoryAddress, parseUnits(fromAmount, 6)],
      });

      const timestamp = Date.now().toString();
      const generateSalt = keccak256(toBytes(`${address}-${timestamp}`));

      setSalt(generateSalt);
      localStorage.setItem("hashlock", hashlock);
      setCurrentProgress(25);
    } catch (e) {
      console.error("Error setting greeting:", e);
    }
  };

  const handleSign = async () => {
    if (decimal === undefined) return;

    const amount = parseUnits(fromAmount, decimal);
    const hashlockSaved = localStorage.getItem("hashlock") as `0x${string}` | null;
    if (hashlockSaved === null) return;

    console.log(hashlockSaved, "hashlock");
    console.log(predictSwapAddress, "predictswap");
    console.log(salt, "salt");
    console.log(fromNetworkId, "fromnt");

    const signature = await signTypedDataAsync({
      domain: {
        name: "FusionSwapIntentERC20",
        version: "1",
        chainId: parseInt(fromNetworkId),
        verifyingContract: predictSwapAddress,
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
        toToken: toTokenAddress,
        amount,
        hashlock: hashlockSaved,
        timelock: BigInt(Math.floor(Date.now() / 1000)) + 3600n, //1 hour,
      },
    });

    console.log(signature);
    localStorage.setItem("signature", signature);
    // setCurrentProgress(66.6);
    setCurrentProgress(50);
  };

  const handleCreateSwap = async () => {
    try {
      setLoadingRelayer(true);
      if (decimal === undefined) return;
      await writeSwapFactoryAsync({
        functionName: "createSwap",
        args: [
          salt,
          hashlock, // Hash del secreto
          3600n, // 1 hora
          address, // Destinatario
          fromTokenAddress, // Contrato del token
          parseUnits(fromAmount, decimal),
        ],
      });

      // setCurrentProgress(99.9);
      setCurrentProgress(75);
      handleRelayer();
    } catch (e) {
      console.error("Error setting greeting:", e);
    } finally {
      setLoadingRelayer(false);
    }
  };

  const handleRelayer = async () => {
    try {
      const signature = localStorage.getItem("signature");

      const req = await fetch("api/relayer", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          contractAddress: predictSwapAddress,
          fromTokenAddress,
          toTokenAddress,
          fromAmount,
          fromChainId: fromNetworkId,
          toChainId: toNetworkId,
          signature: signature,
          secret,
          receiverAddress: address,
          tokenDecimal: decimal,
        }),
      });

      const res = await req.json();

      if (req.status !== 200) throw Error("a ocurred a error");
      console.log(res);
      getHashLock();
    } catch (err) {
      console.log(err);
    }
  };

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
            toNetworkId === "" ||
            hashlock === "0x"
          }
        >
          Next
          <ArrowRight />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-purple-50">
        <DialogHeader>
          <DialogTitle className="text-center">
            {currentProgress < 25
              ? " Approval of tokens for exchange"
              : currentProgress < 50
                ? "Create exchange intent"
                : "Sign Swap"}
          </DialogTitle>
          <DialogDescription className="text-black/80">
            {currentProgress < 25
              ? " Before performing the swap, you need to approve the amount of tokens you want to exchange. This approval allows the smart contract to access your tokens and execute the transaction securely."
              : currentProgress < 50
                ? "The exchange intention is deployed with hashlock and timelock. This allows the swap to be executed only if the correct secret is revealed before the time limit expires."
                : "Signing this message allows the relayer to execute the swap on the other chain."}
          </DialogDescription>
        </DialogHeader>
        <section className="flex flex-col gap-4 justify-center">
          <div>
            <p className="text-sm font-semibold text-center mt-0">
              {currentProgress < 25 ? 1 : currentProgress < 50 ? 2 : currentProgress < 75 ? 3 : 4}/4
            </p>
            <Progress value={currentProgress} />
          </div>
          {currentProgress < 25 ? (
            <Button className="bg-gradient" onClick={handleApprove}>
              <LockOpen />
              Aprove amount
            </Button>
          ) : currentProgress < 50 ? (
            <Button className="bg-gradient" onClick={handleSign}>
              <FilePen /> Sign
            </Button>
          ) : currentProgress < 75 ? (
            <Button className="bg-gradient" onClick={handleCreateSwap}>
              <RefreshCcw />
              Create Swap
            </Button>
          ) : (
            <Button className="bg-gradient" onClick={handleRelayer} disabled={loadingRelayer}>
              <RefreshCcw />
              Call Relayer
            </Button>
          )}
        </section>
      </DialogContent>
    </Dialog>
  );
};

export default DialogSwapProgress;
