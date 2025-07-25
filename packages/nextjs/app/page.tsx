"use client";

// import Link from "next/link";
import { useRouter } from "next/navigation";
import { HandCoinsIcon, SendHorizonal } from "lucide-react";
// import Link from "next/link";
// import { BugIcon, MagnetIcon } from "lucide-react";
// import { useAccount } from "wagmi";
// import { Address } from "~~/components/scaffold-eth";
import type { NextPage } from "next";
import { Button } from "~~/components/shadcn/ui/button";

const Home: NextPage = () => {
  const router = useRouter();

  return (
    <main className="relative bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <section className="h-screen bg-gradient-to-r from-purple-500/20 to-pink-500/20 flex flex-col items-center gap-10 justify-center">
        <h1 className="text-7xl font-semibold text-center text-white">Haz tu transferencia</h1>
        <div className="flex gap-4 justify-center">
          <Button className="w-full py-10 hover:scale-105 ">
            <SendHorizonal className="size-10" />
            Send
          </Button>
          <Button className="w-full py-10 hover:scale-105" onClick={() => router.push("/receive")}>
            <HandCoinsIcon className="size-10" /> Received
          </Button>
        </div>

        <article>lista dkeankdfadfadf ad fad fmkafks fsfsfs</article>
      </section>
    </main>
  );
};

export default Home;

// <div className=" flex items-center flex-col grow pt-10">
//       <div className="px-5">
//         <h1 className="text-center">
//           <span className="block text-2xl mb-2">Welcome to</span>
//           <span className="block text-4xl font-bold">Scaffold-ETH 2</span>
//         </h1>
//         <div className="flex justify-center items-center space-x-2 flex-col">
//           <p className="my-2 font-medium">Connected Address:</p>
//           {/* <Address address={connectedAddress} /> */}
//         </div>

//         <p className="text-center text-lg">
//           Get started by editing{" "}
//           <code className="italic bg-base-300 text-base font-bold max-w-full break-words break-all inline-block">
//             packages/nextjs/app/page.tsx
//           </code>
//         </p>
//         <p className="text-center text-lg">
//           Edit your smart contract{" "}
//           <code className="italic bg-base-300 text-base font-bold max-w-full break-words break-all inline-block">
//             YourContract.sol
//           </code>{" "}
//           in{" "}
//           <code className="italic bg-base-300 text-base font-bold max-w-full break-words break-all inline-block">
//             packages/hardhat/contracts
//           </code>
//         </p>
//       </div>

//       <div className="grow bg-base-300 w-full mt-16 px-8 py-12">
//         <div className="flex justify-center items-center gap-12 flex-col md:flex-row">
//           <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
//             <BugIcon className="h-8 w-8 fill-secondary" />
//             <p>
//               Tinker with your smart contract using the{" "}
//               <Link href="/debug" passHref className="link">
//                 Debug Contracts
//               </Link>{" "}
//               tab.
//             </p>
//           </div>
//           <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
//             <MagnetIcon className="h-8 w-8 fill-secondary" />
//             <p>
//               Explore your local transactions with the{" "}
//               <Link href="/blockexplorer" passHref className="link">
//                 Block Explorer
//               </Link>{" "}
//               tab.
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
