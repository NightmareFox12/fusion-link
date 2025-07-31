"use client";

import React, { useEffect, useState } from "react";
import { formatUnits, keccak256, parseUnits, toBytes } from "viem";
import { useWalletClient } from "wagmi";
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
  tokenAddress: string;
  amount: string;
};

const DialogSwapProgress: React.FC<DialogSwapProgressProps> = ({ address, factoryAddress, tokenAddress, amount }) => {
  const { data: walletClient } = useWalletClient();

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

  //functions
  const handleApprove = async () => {
    try {
      await writeTokenAsync({
        functionName: "approve",
        args: [factoryAddress, parseUnits(amount, 6)],
      });
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
          tokenAddress, // Contrato del token
          parseUnits(amount, 6),
        ],
      });

      setCurrentProgress(60);
    } catch (e) {
      console.error("Error setting greeting:", e);
    }
  };

  const handleSign = async () => {
    const intent = {
      chainFrom: "Etherlink",
      chainTo: "Etherlink",
      tokenFrom: tokenAddress,
      tokenTo: tokenAddress,
      amount: BigInt("1000000000000000000"), // 1 token con 18 decimales
      recipient: address,
      executorContract: "0x222",
      hashlock,
      timelock: Math.floor(Date.now() / 1000) + 3600, // Expira en 1 hora
      minReceived: BigInt("950000000000000000"), // Mínimo aceptado en la otra cadena
    };

    const domain = {
      name: "FusionSwapIntent",
      version: "1",
      chainId: 128123, // Etherlink chainId
      verifyingContract: "0xTuFactoryAddress",
    };

    const types = {
      Intent: [
        { name: "chainFrom", type: "string" },
        { name: "chainTo", type: "string" },
        { name: "tokenFrom", type: "address" },
        { name: "tokenTo", type: "address" },
        { name: "amount", type: "uint256" },
        { name: "recipient", type: "address" },
        { name: "executorContract", type: "address" },
        { name: "hashlock", type: "bytes32" },
        { name: "timelock", type: "uint256" },
        { name: "minReceived", type: "uint256" },
      ],
    };

    //hacer una firma La firma EIP-712 garantiza que el Intent fue autorizado por el usuario.

    const signature = await walletClient?.signTypedData({
      domain,
      types,
      primaryType: "Intent",
      message: intent,
    });

    console.log(signature);
  };

  useEffect(() => {
    if (allowance !== undefined && allowance > 0) setCurrentProgress(60);
    else setCurrentProgress(0);
  }, [allowance]);

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
