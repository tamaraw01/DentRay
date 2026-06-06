"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { Footer } from "@/components/shared/Footer";
import { Navbar } from "@/components/shared/Navbar";

type AppChromeProps = {
  children: ReactNode;
};

export function AppChrome({ children }: AppChromeProps) {
  const pathname = usePathname();
  const isWelcome = pathname === "/";

  return (
    <>
      {!isWelcome && <Navbar />}
      <main>{children}</main>
      {!isWelcome && <Footer />}
    </>
  );
}
