"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Show, SignInButton, SignUpButton } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";
import { UserControl } from "@/components/user-control";
import { useScroll } from "@/hooks/use-scroll";
import { cn } from "@/lib/utils";

export const Navbar = () => {
  const isScrolled = useScroll();
  const pathname = usePathname();
  const isPricing = pathname === "/pricing";
  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 px-4 py-3.5 pt-5 transition-all duration-300",
        isScrolled
          ? isPricing
            ? "bg-background/80 backdrop-blur-md border-b border-border"
            : "bg-[#08091a]/80 backdrop-blur-md"
          : "bg-transparent",
      )}
    >
      <div className="max-w-5xl mx-auto w-full flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.svg" alt="Pebbl" width={24} height={24} />
          <span
            className={cn(
              "font-semibold text-lg",
              isPricing ? "text-foreground" : "text-white",
            )}
          >
            Pebbl
          </span>
        </Link>
        <Show when="signed-out">
          <div className="flex gap-2">
            <SignUpButton>
              <Button variant="outline" size="sm">
                Sign up
              </Button>
            </SignUpButton>
            <SignInButton>
              <Button size="sm">Sign in</Button>
            </SignInButton>
          </div>
        </Show>
        <Show when="signed-in">
          <UserControl showName />
        </Show>
      </div>
    </nav>
  );
};
