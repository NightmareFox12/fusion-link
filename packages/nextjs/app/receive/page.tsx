"use client";

import { useEffect, useMemo, useState } from "react";
// import { DialogChangeOp } from "./_components/DialogChangeOp";
import { NetworkIcon, TokenIcon } from "@web3icons/react";
import { ArrowDownUp, Coins, Info, Mail, Network, Wallet, WalletMinimalIcon } from "lucide-react";
import { NextPage } from "next";
import { formatEther, keccak256, toBytes } from "viem";
// import QRcode from "qrcode";
import { useAccount } from "wagmi";
import { Address } from "~~/components/scaffold-eth";
import { Badge } from "~~/components/shadcn/ui/badge";
import { Button } from "~~/components/shadcn/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~~/components/shadcn/ui/card";
import { Input } from "~~/components/shadcn/ui/input";
import { Label } from "~~/components/shadcn/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~~/components/shadcn/ui/select";
// import { Separator } from "~~/components/shadcn/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "~~/components/shadcn/ui/tooltip";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

// import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth/useScaffoldWriteContract";
// import { useWatchBalance } from "~~/hooks/scaffold-eth/useWatchBalance";

const networks = [
  { label: "Ethereum", chainId: 1, icon: "ethereum" },
  { label: "Optimism", chainId: 10, icon: "optimism" },
  { label: "Arbitrum", chainId: 42161, icon: "arbitrum-one" },
  { label: "Etherlink", chainId: 42793, icon: "etherlink" },
] as const;

// [Usuario inicia swap de USDC en Etherlink]
//         ↓
// [AtomicSwapIntent asegura la operación con hashlock]
//         ↓
// [Fusion+ detecta la liberación del secreto]
//         ↓
// [Relayer ejecuta swap USDC → USDT en Optimism]
//         ↓
// [Usuario recibe USDT en red destino]
//Con fusion+ en ehterlink cross-chain. Como fusion es chimbin y aun no tiene etherlink tambien hay que hacer un tal Atomic Swap with Hashlock/Timelock for Intent-Based Execution

const tokens = [
  { value: "eth", label: "  Ether", symbol: "ETH", icon: "eth" },
  { value: "0x1d17cbcf0d6d143135ae902365d2e5e2a16538d4", label: "USDC", symbol: "USDC", icon: "usdc" },
  { value: "0x68f180fcce6836688e9084f035309e29bf0a2095", label: "Tether", symbol: "USDT", icon: "usdt" },
  { value: "0xeeeeeb57642040be42185f49c52f7e9b38f8eeee", label: "Optimism", symbol: "OP", icon: "op" },
] as const;

const ReceivePage: NextPage = () => {
  const { address, connector } = useAccount();

  // const { data: balance, isLoading } = useWatchBalance({
  //   address,
  // });

  //states
  const [fromNetwork, setFromNetwork] = useState<string>("");
  const [toNetwork, setToNetwork] = useState<string>("");
  const [fromToken, setFromToken] = useState<string>("");
  const [toToken, setToToken] = useState<string>("");
  const [fromAmount, setFromAmount] = useState<string>("");

  //TODO: seguir avergiando lo del cross chain swap
  // const [receiveAddress, setReceiveAddress] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [showLongAddress, setShowLongAddress] = useState<boolean>(false);

  //smart contract
  const { writeContractAsync: writeSwapFactoryAsync } = useScaffoldWriteContract({ contractName: "SwapFactory" });

  //functions
  const handleSubmit = async () => {
    if (fromNetwork === "" || toNetwork === "") return;

    // Convertir el secreto a bytes
    const secret = "my-super-secret-key"; // puede ser un string, un número, un hex...
    const secretBytes = toBytes(secret);
    const hashlock = keccak256(secretBytes);

    try {
      await writeSwapFactoryAsync({
        functionName: "createSwap",
        args: [
          hashlock, // Hash del secreto
          3600, // 1 hora
          "0xReceiverAddress...", // Destinatario
          "0xExecutorAddress...", // Ejecutor
          "0xTokenAddress...", // Contrato del token
          formatEther(100000000000000n), // Monto en tokens
        ],
      });

      // setReceiveAddress(""); //TODO: esto no va aqui
      //TODO: crear el smart contract para guardar las preferencias incluyendo un state private para el email
      //TODO: crear otra function para que el usuario pueda editar su preferencias al recibir el dinero

      //TODO: debo ver como crear el codigo QR y empezar a ahacer lo del send
    } catch (err) {
      console.log(err);
    } finally {
    }
  };

  // const generateReceiveAddress = () => {
  //   if (!selectedToken || !selectedNetwork) {
  //     // toast({
  //     //   title: "Campos requeridos",
  //     //   description: "Por favor selecciona un token y una red de destino",
  //     //   variant: "destructive",
  //     // });
  //     return;
  //   }

  //   // Simular generación de dirección
  //   const mockAddress = "0x" + Math.random().toString(16).substr(2, 40);
  //   setReceiveAddress(mockAddress);

  //   // toast({
  //   //   title: "Dirección generada",
  //   //   description: "Tu dirección de recepción ha sido generada exitosamente",
  //   // });
  // };

  // const copyAddress = () => {
  //   if (receiveAddress) {
  //     navigator.clipboard.writeText(receiveAddress);
  //     // toast({
  //     //   title: "Copiado",
  //     //   description: "Dirección copiada al portapapeles",
  //     // });
  //   }
  // };

  // const PayloadQR = () => {
  //   const canvasRef = useRef(null);

  //   useEffect(() => {
  //     const drawQR = async () => {
  //       if (canvasRef.current) {
  //         try {
  //           const payloadString = JSON.stringify({ cat: true });
  //           await QRcode.toCanvas(canvasRef.current, payloadString, {
  //             width: 200,
  //             margin: 2,
  //           });
  //         } catch (err) {
  //           console.error("Error al generar el QR:", err);
  //         }
  //       }
  //     };

  //     drawQR();
  //   }, []);

  //   return (
  //     <div>
  //       <canvas ref={canvasRef} />
  //     </div>
  //   );
  // };

  //effects
  useEffect(() => {
    window.addEventListener("resize", () => {
      setShowLongAddress(window.innerWidth > 600);
    });

    // const getBalance = async () => {
    //   try {
    //     const req = await fetch("api/balance");
    //     const res = await req.json();

    //     // setUserBalance(formatEther(res["0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"]));
    //     setUserBalance(formatEther(res["0x4200000000000000000000000000000000000006"]));
    //   } catch (err) {
    //     console.log(err);
    //   }
    // };

    // getBalance();
  }, []);

  // const selectedTokenData = tokens.find(t => t.value === selectedToken);
  // const selectedNetworkData = networks.find(n => n.chainId.toString() === selectedNetwork);

  //memos
  const tokenSelected = useMemo(() => {
    return tokens.find(t => t.value === fromToken);
  }, [fromToken]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <ArrowDownUp className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-neutral-content">Receive Token</h1>
          </div>
          <p className="text-neutral-content">Recibe criptomonedas de forma segura y rápida</p>
        </div>

        {/* Main Form */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Configurar Recepción
            </CardTitle>
            <CardDescription>Selecciona el token y la red donde deseas recibir tus criptomonedas</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Balance session  */}
            {/* {isLoading || balance === undefined ? (
              <div className="w-full flex justify-center gap-2">
                <Loader className="animate-spin" />
                <span className="text-sm font-semibold">Loading Balance...</span>
              </div>
            ) : parseFloat(formatEther(balance.value ?? 0n)) < 0 ? null : (
              <div className="w-full flex justify-center gap-2">
                <DialogChangeOp />
              </div>
            )} */}

            <div className="flex space-y-2 gap-4">
              {/* Origin Network */}
              <div className="flex-1">
                <Label htmlFor="network" className="flex items-center gap-2 py-2">
                  <Network className="h-4 w-4" />
                  Origin Network<span className="text-red-500 font-semibold">*</span>
                </Label>
                <Select value={fromNetwork} onValueChange={setFromNetwork}>
                  <SelectTrigger className="w-full py-6" id="network">
                    <SelectValue placeholder="Select a network" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* {networks.map(network => (
                    <SelectItem key={network.chainId} value={network.chainId.toString()} className="cursor-pointer">
                      <div className="flex items-center gap-2">
                        <NetworkIcon id={network.icon} variant="branded" />
                        <span>{network.label}</span>
                        <Badge variant="outline">Chain {network.chainId}</Badge>
                      </div>
                    </SelectItem>
                  ))} */}
                    <SelectItem
                      key={networks[3].chainId}
                      value={networks[3].chainId.toString()}
                      className="cursor-pointer p-2"
                    >
                      <div className="flex items-center gap-2">
                        <NetworkIcon id={networks[3].icon} variant="branded" className="size-8" />
                        <span className="">{networks[3].label}</span>
                        <Badge variant="outline">Chain {networks[3].chainId}</Badge>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Origin Token */}
              <div className="flex-1">
                <Label htmlFor="token" className="flex items-center gap-2 py-2">
                  <Coins className="h-4 w-4" />
                  Origin Token<span className="text-red-500 font-semibold">*</span>
                </Label>
                <Select value={fromToken} onValueChange={setFromToken}>
                  <SelectTrigger className="w-full py-6" id="token">
                    <SelectValue placeholder="Selecciona un token" />
                  </SelectTrigger>
                  <SelectContent>
                    {tokens.map(token => (
                      <SelectItem key={token.value} value={token.value} className="cursor-pointer p-2">
                        <div className="flex items-center gap-2">
                          <TokenIcon symbol={token.symbol} variant="branded" size={40} className="size-8" />
                          <span>{token.label}</span>
                          <Badge variant="secondary">{token.symbol}</Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Amount  */}
            <div className="space-y-2">
              <Label htmlFor="token" className="flex items-center gap-2">
                <Coins className="h-4 w-4" />
                Amount<span className="text-red-500 font-semibold">*</span>
              </Label>

              <div className="relative mb-0">
                <Input
                  type="number"
                  placeholder="0.00"
                  value={fromAmount}
                  className="pr-16 no-spinner"
                  onChange={e => {
                    setFromAmount(e.target.value);
                  }}
                  disabled={tokenSelected === undefined}
                />
                {fromToken && (
                  <Badge variant="secondary" className="absolute right-2 top-1/2 -translate-y-1/2 text-xs">
                    {tokenSelected?.symbol}
                  </Badge>
                )}
              </div>
              {parseInt(fromAmount) < 0 && (
                <span className="text-red-500 font-semibold text-sm ps-2">Invalid amount</span>
              )}
            </div>

            <div className="flex space-y-2 gap-4">
              {/* To Network */}
              <div className="flex-1">
                <Label htmlFor="network" className="flex items-center gap-2 py-2">
                  <Network className="h-4 w-4" />
                  Destination Network<span className="text-red-500 font-semibold">*</span>
                </Label>
                <Select value={toNetwork} onValueChange={setToNetwork}>
                  <SelectTrigger className="w-full py-6" id="network">
                    <SelectValue placeholder="Select a network" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* {networks.map(network => (
                    <SelectItem key={network.chainId} value={network.chainId.toString()} className="cursor-pointer">
                      <div className="flex items-center gap-2">
                        <NetworkIcon id={network.icon} variant="branded" />
                        <span>{network.label}</span>
                        <Badge variant="outline">Chain {network.chainId}</Badge>
                      </div>
                    </SelectItem>
                  ))} */}
                    <SelectItem
                      key={networks[3].chainId}
                      value={networks[3].chainId.toString()}
                      className="cursor-pointer p-2"
                    >
                      <div className="flex items-center gap-2">
                        <NetworkIcon id={networks[3].icon} variant="branded" className="size-8" />
                        <span className="">{networks[3].label}</span>
                        <Badge variant="outline">Chain {networks[3].chainId}</Badge>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Destination Token */}
              <div className="flex-1">
                <Label htmlFor="token" className="flex items-center gap-2 py-2">
                  <Coins className="h-4 w-4" />
                  Destination Token<span className="text-red-500 font-semibold">*</span>
                </Label>
                <Select value={toToken} onValueChange={setToToken}>
                  <SelectTrigger className="w-full py-6" id="token">
                    <SelectValue placeholder="Selecciona un token" />
                  </SelectTrigger>
                  <SelectContent>
                    {tokens.map(token => (
                      <SelectItem key={token.value} value={token.value} className="cursor-pointer p-2">
                        <div className="flex items-center gap-2">
                          <TokenIcon symbol={token.symbol} variant="branded" size={40} className="size-8" />
                          <span>{token.label}</span>
                          <Badge variant="secondary">{token.symbol}</Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {connector !== undefined && (
              <div className="space-y-2">
                <Label htmlFor="address" className="flex items-center gap-2">
                  <WalletMinimalIcon className="w-4 h-4" />
                  Address de destino<span className="text-red-500 font-semibold">*</span>
                </Label>
                <div id="address" className="w-full flex justify-center">
                  <Address address={address} format={showLongAddress ? "long" : "short"} />
                </div>
              </div>
            )}

            {/* Email (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="email" className="flex justify-between">
                <div className="flex gap-2">
                  <Mail className="w-4 h-4" />
                  Email (Optional)
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size={"icon"} variant="ghost">
                      <Info />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-semibold">
                      Register your email address to receive a notification when the transaction is completed.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </Label>
              <Input
                id="email"
                placeholder="example@gmail.com"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            <Button
              onClick={handleSubmit}
              className="w-full bg-gradient"
              size="lg"
              disabled={fromNetwork === "" || toNetwork === ""}
            >
              Generate order
            </Button>
          </CardContent>
        </Card>

        {/* Receive Address Display */}
        {/* {receiveAddress && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <QrCode className="h-5 w-5" />
                Dirección de Recepción
              </CardTitle>
              <CardDescription className="text-green-700">Envía tus criptomonedas a esta dirección</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Selected Configuration 
              <div className="flex flex-wrap gap-2">
                {selectedTokenData && (
                  <Badge variant="default" className="bg-blue-100 text-blue-800">
                    {selectedTokenData.icon} {selectedTokenData.symbol}
                  </Badge>
                )}
                {selectedNetworkData && (
                  <Badge variant="default" className="bg-purple-100 text-purple-800">
                    {selectedNetwork} {selectedNetworkData.chainId}
                  </Badge>
                )}
                {/* {amount && (
                  <Badge variant="outline">
                    {amount} {selectedTokenData?.symbol}
                  </Badge>
                )} 
              </div>

              <Separator />

              {/* Address 
              <div className="space-y-2">
                <Label>Dirección de Recepción</Label>
                <div className="flex gap-2">
                  <Input value={receiveAddress} readOnly className="font-mono text-sm bg-white" />
                  <Button variant="outline" size="icon" onClick={copyAddress}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* QR Code Placeholder 
              <div className="flex justify-center">
                <div className="w-48 h-48 bg-white border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <QrCode className="h-12 w-12 mx-auto mb-2" />
                    <p className="text-sm">Código QR</p>
                    <p className="text-xs">{"(Próximamente)"}</p>
                  </div>
                </div>
              </div>

              {/* Warning 
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <div className="text-yellow-600 mt-0.5">⚠️</div>
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium mb-1">Importante:</p>
                    <ul className="space-y-1 text-xs">
                      <li>
                        • Solo envía {selectedTokenData?.icon} en la red {selectedNetworkData?.label}
                      </li>
                      <li>• Verifica la dirección antes de enviar</li>
                      <li>• Las transacciones son irreversibles</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )} */}
      </div>
    </main>
  );
};

export default ReceivePage;
