"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaucetButton, RainbowKitCustomConnectButton } from "./scaffold-eth";
import { Button } from "./shadcn/ui/button";
import { BugIcon, Home } from "lucide-react";
import { hardhat } from "viem/chains";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";

type HeaderMenuLink = {
  label: string;
  href: string;
  icon?: React.ReactNode;
};

export const menuLinks: HeaderMenuLink[] = [
  {
    icon: <Home />,
    label: "Home",
    href: "/",
  },
  {
    label: "Debug Contracts",
    href: "/debug",
    icon: <BugIcon />,
  },
];

export default function ScaffoldHeader() {
  const { targetNetwork } = useTargetNetwork();
  const isLocalNetwork = targetNetwork.id === hardhat.id;
  const pathname = usePathname();

  return (
    <header className="bg-linear-to-bl from-purple-900 to-slate-900 border-b border-white/10 backdrop-blur-sm w-full">
      <div className="mx-4 h-16 flex items-center justify-between gap-2 md:gap-4 lg:gap-5">
        <div className="flex items-center gap-2 justify-center">
          <div className="relative w-4 h-4 md:w-8 md:h-8">
            <Image src={"/favicon.png"} alt="icon" fill={true} />
          </div>
          {/* <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              {/* <Zap className="w-5 h-5 text-white" /> */}
          {/* </div>  */}
          <span className=" sm:text-xl font-bold text-white">Fusion Link</span>
        </div>
        <nav className="hidden md:flex space-x-4 flex-1">
          {menuLinks.map(({ label, href, icon }) => {
            const isActive = pathname === href;
            return (
              <Link key={href} href={href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={
                    isActive ? "bg-gradient" : "text-white hover:text-white bg-gradient-secondary border-[0.5px]"
                  }
                >
                  {icon}
                  <span>{label}</span>
                </Button>
              </Link>
            );
          })}
        </nav>
        <RainbowKitCustomConnectButton />
        {isLocalNetwork && <FaucetButton />}
      </div>
    </header>
  );
}
