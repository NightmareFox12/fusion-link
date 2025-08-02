"use client";

import { useEffect, useMemo, useState } from "react";
import DialogSwapProgress from "./_components/DialogProgress";
import { NetworkIcon, TokenIcon } from "@web3icons/react";
import { ArrowDownUp, Coins, Loader, Network, Wallet, WalletMinimalIcon } from "lucide-react";
import { NextPage } from "next";
// import QRcode from "qrcode";
import { useAccount } from "wagmi";
import { Address } from "~~/components/scaffold-eth";
import { Badge } from "~~/components/shadcn/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~~/components/shadcn/ui/card";
import { Input } from "~~/components/shadcn/ui/input";
import { Label } from "~~/components/shadcn/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~~/components/shadcn/ui/select";
// import { Separator } from "~~/components/shadcn/ui/separator";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";

const networks = [
  // { label: "Ethereum", chainId: 1, icon: "ethereum" },
  { label: "Optimism Testnet", chainId: 11155420, icon: "optimism" },
  // { label: "Arbitrum", chainId: 42161, icon: "arbitrum-one" },
  { label: "Etherlink Testnet", chainId: 42793, icon: "etherlink" },
] as const;

const tokens = [
  { value: "eth", label: "Ether", symbol: "ETH", icon: "eth", decimal: 18 },
  // { value: "0x1d17cbcf0d6d143135ae902365d2e5e2a16538d4", label: "USDC", symbol: "USDC", icon: "usdc", decimal: 18 },
  // { value: "0x68f180fcce6836688e9084f035309e29bf0a2095", label: "Tether", symbol: "USDT", icon: "usdt", decimal: 18 },
  // { value: "0xeeeeeb57642040be42185f49c52f7e9b38f8eeee", label: "Optimism", symbol: "OP", icon: "op", decimal: 18 },
  {
    value: "0x4C2AA252BEe766D3399850569713b55178934849",
    label: "USDC Testnet",
    symbol: "USDC",
    icon: "usdc",
    decimal: 6,
  },
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
  const [showLongAddress, setShowLongAddress] = useState<boolean>(false);

  //smart contract
  const { data: swapFactoryContract, isLoading } = useDeployedContractInfo({ contractName: "SwapFactory" });

  //effects
  useEffect(() => {
    window.addEventListener("resize", () => {
      setShowLongAddress(window.innerWidth > 600);
    });
  }, []);

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
            {/* Balance session */}
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
                    {networks.map(network => (
                      <SelectItem
                        key={network.chainId}
                        value={network.chainId.toString()}
                        className="cursor-pointer p-2"
                      >
                        <div className="flex items-center gap-2">
                          <NetworkIcon id={network.icon} variant="branded" className="size-8" />
                          <span className="">{network.label}</span>
                          <Badge variant="outline">Chain {network.chainId}</Badge>
                        </div>
                      </SelectItem>
                    ))}
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

            {/* Amount */}
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
                  className="pr-16 no-spinner py-6 text-lg font-semibold"
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
                    {networks.map(network => (
                      <SelectItem
                        key={network.chainId}
                        value={network.chainId.toString()}
                        className="cursor-pointer p-2"
                      >
                        <div className="flex items-center gap-2">
                          <NetworkIcon id={network.icon} variant="branded" className="size-8" />
                          <span className="">{network.label}</span>
                          <Badge variant="outline">Chain {network.chainId}</Badge>
                        </div>
                      </SelectItem>
                    ))}
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

            {/* <Button
              onClick={handleSubmit}
              className="w-full bg-gradient"
              size="lg"
              disabled={fromNetwork === "" || toNetwork === ""}
            >
              Generate order
            </Button> */}
            {isLoading || address === undefined || tokenSelected === undefined ? (
              <div className="flex justify-center">
                <Loader className="animate-spin" />
              </div>
            ) : (
              <div className="flex justify-center">
                <DialogSwapProgress
                  address={address}
                  factoryAddress={swapFactoryContract?.address}
                  fromTokenAddress={fromToken}
                  fromAmount={fromAmount}
                  decimal={tokenSelected.decimal}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default ReceivePage;
