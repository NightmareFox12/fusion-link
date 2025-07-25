import { NetworkOptions } from "./NetworkOptions";
import { ChevronDown, LogOut } from "lucide-react";
import { useDisconnect } from "wagmi";
import { Button } from "~~/components/shadcn/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~~/components/shadcn/ui/dropdown-menu";

export const WrongNetworkDropdown = () => {
  const { disconnect } = useDisconnect();

  return (
    <DropdownMenu open={true}>
      <DropdownMenuTrigger asChild>
        <Button className="py-2 bg-red-600 font-semibold">
          <ChevronDown />
          Wrong Network
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="font-semibold me-6">
        <NetworkOptions />
        <DropdownMenuItem onClick={() => disconnect()} className="!text-red-500 cursor-pointer ps-4">
          <LogOut className="text-red-500" /> Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
