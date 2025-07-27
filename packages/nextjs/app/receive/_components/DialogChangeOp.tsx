// import { SDK } from "@1inch/cross-chain-sdk";
// import { FusionSDK, NetworkEnum } from "@1inch/fusion-sdk";
//import { ayudame } from "./ayudame";
import { Button } from "~~/components/shadcn/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~~/components/shadcn/ui/dialog";
import { Input } from "~~/components/shadcn/ui/input";
import { Label } from "~~/components/shadcn/ui/label";

export const DialogChangeOp: React.FC = () => {
  //functions
  const handleAlgo = async () => {
    try {
      const req = await fetch("api/quote");

      // if (req.status != 200) throw Error("Error en la peticion");
      const res = await req.json();
      console.log(res);
    } catch (err) {
      console.log(err);
    } finally {
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Open Dialog</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>Make changes to your profile here. Click save when you&apos;re done.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-3">
            <Label htmlFor="name-1">Name</Label>
            <Input id="name-1" name="name" defaultValue="Pedro Duarte" />
          </div>
          <div className="grid gap-3">
            <Label htmlFor="username-1">Username</Label>
            <Input id="username-1" name="username" defaultValue="@peduarte" />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleAlgo}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
