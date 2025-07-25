import { CheckIcon, Files } from "lucide-react";
import { Button } from "~~/components/shadcn/ui/button";
import { useCopyToClipboard } from "~~/hooks/scaffold-eth/useCopyToClipboard";

export const AddressCopyIcon = ({ className, address }: { className?: string; address: string }) => {
  const { copyToClipboard: copyAddressToClipboard, isCopiedToClipboard: isAddressCopiedToClipboard } =
    useCopyToClipboard();

  return (
    <Button
      variant="ghost"
      onClick={e => {
        e.stopPropagation();
        copyAddressToClipboard(address);
      }}
    >
      {isAddressCopiedToClipboard ? (
        <CheckIcon className={className} aria-hidden="true" />
      ) : (
        <Files aria-hidden />
        // <DocumentDuplicateIcon className={className} aria-hidden="true" />
      )}
    </Button>
  );
};
