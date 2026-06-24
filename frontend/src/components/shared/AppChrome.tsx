"use client";

import type { AuthChangeEvent } from "@supabase/supabase-js";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { UpdatePrompt } from "@/components/pwa/UpdatePrompt";
import { Footer } from "@/components/shared/Footer";
import { Navbar } from "@/components/shared/Navbar";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

type AppChromeProps = {
  children: ReactNode;
};

export function AppChrome({ children }: AppChromeProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isWelcome = pathname === "/";

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      return;
    }

    const supabase = createClient();
    // Whenever a recovery link is opened — no matter which page it lands on —
    // send the user to the dedicated "set new password" screen.
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event: AuthChangeEvent) => {
      if (event === "PASSWORD_RECOVERY" && window.location.pathname !== "/reset-password") {
        router.replace("/reset-password");
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  return (
    <>
      {!isWelcome && <Navbar />}
      <main>{children}</main>
      {!isWelcome && <Footer />}
      <UpdatePrompt />
      <InstallPrompt />
    </>
  );
}
