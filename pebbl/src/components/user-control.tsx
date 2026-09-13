"use client";
import { UserButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";

interface Props {
  showName?: boolean;
}

export const UserControl = ({ showName }: Props) => {
  const pathname = usePathname();
  const isPricing = pathname === "/pricing";
  return (
    <UserButton
      showName={showName}
      appearance={{
        elements: {
          userButtonBox: "rounded-md!",
          userButtonAvatarBox: "rounded-md! size-8!",
          userButtonTrigger: "rounded-md!",
          ...(!isPricing && { userButtonOuterIdentifier: "text-white!" }),
        },
      }}
    />
  );
};
