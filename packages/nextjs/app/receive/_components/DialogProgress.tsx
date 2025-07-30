"use client";

import React, { useState } from "react";
import { keccak256, parseUnits, toBytes } from "viem";
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
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth/useScaffoldWriteContract";

type DialogSwapProgressProps = {
  factoryAddress: `0x${string}` | undefined;
  amount: string;
};

const DialogSwapProgress: React.FC<DialogSwapProgressProps> = ({ factoryAddress, amount }) => {
  //states
  const [currentProgress, setCurrentProgress] = useState<number>(0);

  //smart contract
  const { writeContractAsync: writeTokenAsync } = useScaffoldWriteContract({ contractName: "USDC_Testnet" });

  const { writeContractAsync: writeSwapFactoryAsync } = useScaffoldWriteContract({ contractName: "SwapFactory" });

  //functions
  const handleApprove = async () => {
    try {
      await writeTokenAsync({
        functionName: "approve",
        args: [factoryAddress, parseUnits(amount, 6)],
      });

      setCurrentProgress(30);
    } catch (e) {
      console.error("Error setting greeting:", e);
    }
  };

  //TODO: ahora debo buscar las address de los tokens para darle approve, lo bueno que etherlink tiene 3 nada mas.

  //TODO: Mejorar el dialog y el progress a 33% por step o 50% en caso que sean 2 steps, y guardar el progreso en caso de que cierre el dialog, tambien agregar el boton de cancelar approve.

  //TODO: luego de crear el swap empeza a averigurar la forma de yo tener esa address porque creo que la vamos a necesitar para interactuar con el y 1nch

  const handleCreateSwap = async () => {
    try {
      const hashlock = keccak256(toBytes("key-secret"));

      await writeSwapFactoryAsync({
        functionName: "createSwap",
        args: [
          hashlock, // Hash del secreto
          3600n, // 1 hora
          "0xReceiverAddress...", // Destinatario
          "0xTokenAddress...", // Contrato del token
          parseUnits(amount, 6),
        ],
      });

      setCurrentProgress(60);
    } catch (e) {
      console.error("Error setting greeting:", e);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-gradient w-full" disabled={parseInt(amount) < 0}>
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
          ) : currentProgress < 60 ? (
            <Button onClick={handleCreateSwap}>Create Swap</Button>
          ) : (
            <div></div>
          )}
        </section>
      </DialogContent>
    </Dialog>
  );
};

export default DialogSwapProgress;
