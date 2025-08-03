"use client";

// import { useEffect, useState } from "react";
import Landing from "./Landing";
// import { Header } from "./Header";
import ScaffoldHeader from "./ScaffoldHeader";
import { ScaffoldSidebar } from "./ScaffoldSidebar";
import { SidebarInset, SidebarProvider } from "./shadcn/ui/sidebar";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppProgressBar as ProgressBar } from "next-nprogress-bar";
// import { useTheme } from "next-themes";
import { Toaster } from "sonner";
// import { Toaster } from "react-hot-toast";
import { WagmiProvider, useAccount } from "wagmi";
// import { Footer } from "~~/components/Footer";
// import { Header } from "~~/components/Header";
import { BlockieAvatar } from "~~/components/scaffold-eth";
import { useInitializeNativeCurrencyPrice } from "~~/hooks/scaffold-eth";
import { wagmiConfig } from "~~/services/web3/wagmiConfig";

const ScaffoldEthApp = ({ children }: { children: React.ReactNode }) => {
  useInitializeNativeCurrencyPrice();
  const { isConnected } = useAccount();

  return (
    <>
      <Toaster richColors={true} position="top-center" />
      {isConnected ? (
        <SidebarProvider defaultOpen={false}>
          <ScaffoldSidebar />
          <SidebarInset>
            <ScaffoldHeader />
            {children}
          </SidebarInset>
          {/* <main> */}
          {/* <Header /> */}

          {/* </main> */}
        </SidebarProvider>
      ) : (
        <>
          <Landing />
        </>
      )}

      {/* <div className={`flex flex-col min-h-screen `}>
        <Header />
        <main className="relative flex flex-col flex-1">{children}</main>
        <Footer />
      </div>
      <Toaster /> */}
    </>
  );
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

export const ScaffoldEthAppWithProviders = ({ children }: { children: React.ReactNode }) => {
  // const { resolvedTheme } = useTheme();
  // const isDarkMode = resolvedTheme === "dark";
  // const [mounted, setMounted] = useState(false);

  // useEffect(() => {
  //   setMounted(true);
  // }, []);

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          avatar={BlockieAvatar}
          theme={
            darkTheme({
              accentColor: "oklch(70.2% 0.183 293.541)",
            })
            // mounted ? (isDarkMode ? darkTheme() : lightTheme()) : lightTheme()
          }
          modalSize="compact"
        >
          <ProgressBar height="3px" color="#2299dd" />
          <ScaffoldEthApp>{children}</ScaffoldEthApp>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
