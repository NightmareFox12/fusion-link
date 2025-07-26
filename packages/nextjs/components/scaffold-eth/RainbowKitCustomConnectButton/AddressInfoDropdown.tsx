import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { NetworkOptions } from "./NetworkOptions";
import { ArrowLeftRight, ChevronDown, ClipboardCheck, ExternalLink, Files, LogOut, QrCode } from "lucide-react";
import { Address, getAddress } from "viem";
import { useDisconnect } from "wagmi";
import { BlockieAvatar, isENS } from "~~/components/scaffold-eth";
import { Button } from "~~/components/shadcn/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~~/components/shadcn/ui/dropdown-menu";
import { useCopyToClipboard } from "~~/hooks/scaffold-eth";
import { getTargetNetworks } from "~~/utils/scaffold-eth";

const allowedNetworks = getTargetNetworks();

type AddressInfoDropdownProps = {
  address: Address;
  blockExplorerAddressLink: string | undefined;
  displayName: string;
  ensAvatar?: string;
  setShowQr: Dispatch<SetStateAction<boolean>>;
};

export const AddressInfoDropdown = ({
  address,
  ensAvatar,
  displayName,
  blockExplorerAddressLink,
  setShowQr,
}: AddressInfoDropdownProps) => {
  const { disconnect } = useDisconnect();
  const checkSumAddress = getAddress(address);

  const { copyToClipboard: copyAddressToClipboard, isCopiedToClipboard: isAddressCopiedToClipboard } =
    useCopyToClipboard();

  //states
  const [selectingNetwork, setSelectingNetwork] = useState<boolean>(false);
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const [lockMenu, setLockMenu] = useState<boolean>(false);

  // const closeDropdown = () => {
  //   setSelectingNetwork(false);
  // };

  // useOutsideClick(dropdownRef, closeDropdown);

  useEffect(() => {
    if (lockMenu) {
      setTimeout(() => {
        setLockMenu(false);
      }, 100);
    }
  }, [lockMenu]);

  return (
    <>
      <DropdownMenu onOpenChange={open => setShowMenu(lockMenu ? !open : open)} open={showMenu}>
        <DropdownMenuTrigger asChild>
          <Button onClick={() => setShowMenu(true)} className="gap-3 py-5">
            <BlockieAvatar address={checkSumAddress} size={30} ensImage={ensAvatar} />
            {isENS(displayName) ? displayName : checkSumAddress?.slice(0, 6) + "..." + checkSumAddress?.slice(-4)}
            <ChevronDown />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="px-2 font-semibold mr-7">
          {selectingNetwork ? (
            <NetworkOptions setSelectingNetwork={setSelectingNetwork} />
          ) : (
            <>
              <DropdownMenuItem
                onSelect={() => {
                  setLockMenu(true);
                  copyAddressToClipboard(checkSumAddress);
                }}
                className="cursor-pointer"
              >
                {isAddressCopiedToClipboard ? <ClipboardCheck /> : <Files />}
                {isAddressCopiedToClipboard ? "Copied!" : "Copy Address"}
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => setShowQr(true)} className="cursor-pointer">
                <QrCode /> View QR code
              </DropdownMenuItem>

              {allowedNetworks.length > 1 && (
                <DropdownMenuItem
                  onClick={() => {
                    setLockMenu(true);
                    setSelectingNetwork(true);
                  }}
                  className="cursor-pointer"
                >
                  <ArrowLeftRight />
                  Switch Network
                </DropdownMenuItem>
              )}

              <DropdownMenuItem className="flex cursor-pointer">
                <ExternalLink />
                <a href={blockExplorerAddressLink} target="_blank">
                  View on Block Explorer
                </a>
              </DropdownMenuItem>
            </>
          )}

          <DropdownMenuItem onClick={() => disconnect()} className="!text-red-500 cursor-pointer ">
            <LogOut className="text-red-500" /> Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

//  <details ref={dropdownRef} className="dropdown dropdown-end leading-3">
//         <summary className="btn btn-secondary btn-sm pl-0 pr-2 shadow-md dropdown-toggle gap-0 h-auto!">
//           <BlockieAvatar address={checkSumAddress} size={30} ensImage={ensAvatar} />
//           <span className="ml-2 mr-1">
//             {isENS(displayName) ? displayName : checkSumAddress?.slice(0, 6) + "..." + checkSumAddress?.slice(-4)}
//           </span>
//           {/* <ChevronDownIcon className="h-6 w-4 ml-2 sm:ml-0" /> */}
//           <ChevronDown className="h-6 w-4 ml-2 sm:ml-0" />
//         </summary>
//         <ul className="dropdown-content menu z-2 p-2 mt-2 shadow-center shadow-accent bg-base-200 rounded-box gap-1">
//           <NetworkOptions hidden={!selectingNetwork} />
//           <li className={selectingNetwork ? "hidden" : ""}>
//             <div
//               className="h-8 btn-sm rounded-xl! flex gap-3 py-3 cursor-pointer"
//               onClick={() => copyAddressToClipboard(checkSumAddress)}
//             >
//               {isAddressCopiedToClipboard ? (
//                 <>
//                   {/* <CheckCircleIcon className="text-xl font-normal h-6 w-4 ml-2 sm:ml-0" aria-hidden="true" /> */}
//                   <span className="whitespace-nowrap">Copied!</span>
//                 </>
//               ) : (
//                 <>
//                   {/* <DocumentDuplicateIcon className="text-xl font-normal h-6 w-4 ml-2 sm:ml-0" aria-hidden="true" /> */}
//                   <span className="whitespace-nowrap">Copy address</span>
//                 </>
//               )}
//             </div>
//           </li>
//           <li className={selectingNetwork ? "hidden" : ""}>
//             <label htmlFor="qrcode-modal" className="h-8 btn-sm rounded-xl! flex gap-3 py-3">
//               {/* <QrCodeIcon className="h-6 w-4 ml-2 sm:ml-0" /> */}
//               <span className="whitespace-nowrap">View QR Code</span>
//             </label>
//           </li>
//           <li className={selectingNetwork ? "hidden" : ""}>
//             <button className="h-8 btn-sm rounded-xl! flex gap-3 py-3" type="button">
//               {/* <ArrowTopRightOnSquareIcon className="h-6 w-4 ml-2 sm:ml-0" /> */}
//               <a
//                 target="_blank"
//                 href={blockExplorerAddressLink}
//                 rel="noopener noreferrer"
//                 className="whitespace-nowrap"
//               >
//                 View on Block Explorer
//               </a>
//             </button>
//           </li>
//           {allowedNetworks.length > 1 ? (
//             <li className={selectingNetwork ? "hidden" : ""}>
//               <button
//                 className="h-8 btn-sm rounded-xl! flex gap-3 py-3"
//                 type="button"
//                 onClick={() => {
//                   setSelectingNetwork(true);
//                 }}
//               >
//                 {/* <ArrowsRightLeftIcon className="h-6 w-4 ml-2 sm:ml-0" /> <span>Switch Network</span> */}
//               </button>
//             </li>
//           ) : null}
//           <li className={selectingNetwork ? "hidden" : ""}>
//             <button
//               className="menu-item text-error h-8 btn-sm rounded-xl! flex gap-3 py-3"
//               type="button"
//               onClick={() => disconnect()}
//             >
//               {/* <ArrowLeftOnRectangleIcon className="h-6 w-4 ml-2 sm:ml-0" /> <span>Disconnect</span> */}
//             </button>
//           </li>
//         </ul>
//       </details>
