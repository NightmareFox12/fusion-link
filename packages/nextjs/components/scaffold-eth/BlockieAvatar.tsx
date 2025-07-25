"use client";

import { Avatar, AvatarFallback, AvatarImage } from "../shadcn/ui/avatar";
import { AvatarComponent } from "@rainbow-me/rainbowkit";
import { blo } from "blo";

// Custom Avatar for RainbowKit
export const BlockieAvatar: AvatarComponent = ({ address, ensImage, size }) => (
  // Don't want to use nextJS Image here (and adding remote patterns for the URL)
  // <img
  //   className="rounded-full"
  //
  //   width={size}
  //   height={size}
  //   alt={`${address} avatar`}
  // />

  <Avatar>
    <AvatarImage src={ensImage || blo(address as `0x${string}`)} width={size} height={size} />
    <AvatarFallback>CN</AvatarFallback>
  </Avatar>
);
