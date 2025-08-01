"use client";

import React, { useState } from "react";
import { formatUnits, keccak256, parseUnits, toBytes } from "viem";
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
  fromTokenAddress: string;
  fromAmount: string;
  decimal: 6 | 18;
};

const DialogSwapProgress: React.FC<DialogSwapProgressProps> = ({
  address,
  factoryAddress,
  fromTokenAddress,
  fromAmount,
  decimal,
}) => {
  const { signTypedDataAsync } = useSignTypedData();

  //states
  const [currentProgress, setCurrentProgress] = useState<number>(0);

  //smart contract
  const { writeContractAsync: writeTokenAsync } = useScaffoldWriteContract({ contractName: "USDC_Testnet" });

  const { writeContractAsync: writeSwapFactoryAsync } = useScaffoldWriteContract({ contractName: "SwapFactory" });

  const { data: allowance } = useScaffoldReadContract({
    contractName: "USDC_Testnet",
    functionName: "allowance",
    args: [address, factoryAddress],
  });

  const { data: swapAddress } = useScaffoldReadContract({
    contractName: "SwapFactory",
    functionName: "swaps",
    args: [address],
  });

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

  //TODO: ahora debo buscar las address de los tokens para darle approve, lo bueno que etherlink tiene 3 nada mas.

  //TODO: Mejorar el dialog y el progress a 33% por step o 50% en caso que sean 2 steps, y guardar el progreso en caso de que cierre el dialog, tambien agregar el boton de cancelar approve.

  //TODO: luego de crear el swap empeza a averigurar la forma de yo tener esa address porque creo que la vamos a necesitar para interactuar con el y 1nch

  const hashlock = keccak256(toBytes("key-secret"));
  const handleCreateSwap = async () => {
    try {
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
  console.log(fromAmount);
  console.log(parseUnits(fromAmount, decimal));

  const handleSign = async () => {
    const amount = parseUnits(fromAmount, decimal);
    const signature = await signTypedDataAsync({
      domain: {
        name: "FusionSwapIntentERC20",
        version: "1",
        chainId: 128123,
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
        fromChainId: 128123n,
        toChainId: 10n,
        fromToken: fromTokenAddress,
        toToken: fromTokenAddress,
        amount,
        hashlock,
        timelock: BigInt(Math.floor(Date.now() / 1000)) + 3600n, //1 hour,
      },
    });

    console.log(signature);
    await sendSign(signature, fromTokenAddress, fromTokenAddress, address, address, amount, amount, 128123n.toString());
    setCurrentProgress(99.9);
  };

  const sendSign = async (
    signature: string,
    fromTokenAddress: string,
    toTokenAdress: string,
    fromAddress: string,
    toAddress: string,
    fromAmount: bigint,
    toAmount: bigint,
    srcChainId: string,
  ) => {
    try {
      const req = await fetch("api/look", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          signature,
          fromTokenAddress,
          toTokenAdress,
          fromAddress,
          toAddress,
          fromAmount: fromAmount.toString(),
          toAmount: toAmount.toString(),
          srcChainId,
        }),
      });

      const res = await req.json();

      console.log(res);
    } catch (err) {
      console.log(err);
    }
  };

  // useEffect(() => {
  //   if (swapAddress !== undefined && !swapAddress.includes("0x0000000000000")) setCurrentProgress(66.6);
  //   else if (allowance !== undefined && allowance > 0) setCurrentProgress(33.3);
  //   else setCurrentProgress(0);
  // }, [allowance, swapAddress]);
  // console.log(currentProgress);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-gradient w-full" disabled={parseFloat(fromAmount) < 0}>
          Next
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your account and remove your data from our
            servers.
          </DialogDescription>
        </DialogHeader>
        <section>
          <span>Progress</span>
          <Progress value={currentProgress} />
          {currentProgress < 30 ? (
            <Button onClick={handleApprove}>Aprove amount</Button>
          ) : currentProgress <= 60 ? (
            <Button onClick={handleCreateSwap}>Create Swap</Button>
          ) : (
            <article>
              <p>{formatUnits(allowance ?? 0n, 6)}</p>

              <Button onClick={handleSign}>Sign</Button>
            </article>
          )}
        </section>
      </DialogContent>
    </Dialog>
  );
};

export default DialogSwapProgress;
