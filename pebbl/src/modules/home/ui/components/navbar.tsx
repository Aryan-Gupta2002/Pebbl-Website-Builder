"use client";

import Link from "next/link";
import Image from "next/image";
import { Show, SignInButton, SignUpButton } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";
import { UserControl } from "@/components/user-control";
import { useScroll } from "@/hooks/use-scroll";
import { cn } from "@/lib/utils";

export const Navbar = () => {
  const isScrolled = useScroll();
  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 px-4 py-3.5 pt-5 transition-all duration-300",
        isScrolled
          ? "bg-[#08091a]/80 backdrop-blur-md border-b border-white/[0.07]"
          : "bg-transparent",
      )}
    >
      <div className="max-w-2xl mx-auto w-full flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 group">
          <Image src="/logo.svg" alt="Pebbl" width={22} height={22} />
          <span className="font-semibold text-[15px] text-white/90 group-hover:text-white transition-colors duration-150">
            Pebbl
          </span>
        </Link>
        <Show when="signed-out">
          <div className="flex gap-2">
            <SignUpButton>
              <Button
                variant="ghost"
                size="sm"
                className="text-white/65 hover:text-white hover:bg-white/[0.08] border border-white/[0.10] hover:border-white/[0.18] text-[13px] h-8 px-3 rounded-lg shadow-none"
              >
                Sign up
              </Button>
            </SignUpButton>
            <SignInButton>
              <Button
                size="sm"
                className="bg-white/[0.09] hover:bg-white/[0.14] text-white/90 hover:text-white border border-white/[0.14] hover:border-white/[0.24] shadow-none text-[13px] h-8 px-3 rounded-lg backdrop-blur-sm"
              >
                Sign in
              </Button>
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
