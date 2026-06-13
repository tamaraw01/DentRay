"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";

import { DentRayLoading } from "@/components/loading/DentRayLoading";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { AppNavIcon, appNavItems, BottomNavigation } from "@/components/shared/BottomNavigation";
import { getCurrentUser, signOut } from "@/lib/auth";
import type { DentRayUser } from "@/types/user";

type AppShellProps = {
  children: ReactNode;
};

const UserContext = createContext<DentRayUser | null>(null);

export function useDentRayUser() {
  const user = useContext(UserContext);
  if (!user) {
    throw new Error("DentRay user context is not available.");
  }
  return user;
}

export function AppShell({ children }: AppShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<DentRayUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    void getCurrentUser().then((currentUser) => {
      if (!isMounted) {
        return;
      }
      if (!currentUser) {
        router.replace("/");
        return;
      }
      setUser(currentUser);
      setIsLoading(false);
    });
    return () => {
      isMounted = false;
    };
  }, [router]);

  async function handleLogout() {
    await signOut();
    router.push("/");
    router.refresh();
  }

  if (isLoading || !user) {
    return <DentRayLoading fullScreen message="Menyiapkan akun" variant="auth" />;
  }

  return (
    <div className="min-h-screen px-3 pb-[calc(6.5rem+env(safe-area-inset-bottom))] pt-4 sm:px-5 md:pb-8">
      <UserContext.Provider value={user}>
        <div className="app-frame mx-auto grid max-w-6xl gap-5 rounded-[2rem] p-3 sm:rounded-[2.35rem] sm:p-5 lg:grid-cols-[84px_minmax(0,1fr)]">
          <aside className="sticky top-24 hidden h-[calc(100vh-8rem)] flex-col items-center justify-between rounded-[2rem] border border-slate-200/80 bg-white/95 px-3 py-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)] lg:flex">
            <Link aria-label="DentRay beranda" href="/app">
              <BrandLogo size="sm" />
            </Link>

            <nav className="flex flex-col gap-3">
              {appNavItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    aria-label={item.label}
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl transition ${
                      isActive
                        ? "bg-clinical-600 text-white shadow-[0_12px_28px_rgba(37,99,235,0.18)]"
                        : "bg-slate-50 text-slate-500 hover:bg-white hover:text-clinical-700"
                    }`}
                    href={item.href}
                    key={item.href}
                    title={item.label}
                  >
                    <AppNavIcon name={item.icon} />
                  </Link>
                );
              })}
            </nav>

            <button
              aria-label="Keluar"
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-500 shadow-sm transition hover:bg-white hover:text-red-600"
              onClick={handleLogout}
              title="Keluar"
              type="button"
            >
              <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
                <path d="M10 6H6v12h4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                <path d="M14 8l4 4-4 4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                <path d="M8 12h10" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
              </svg>
            </button>
          </aside>

          <div className="min-w-0">{children}</div>
        </div>
      </UserContext.Provider>
      <BottomNavigation pathname={pathname} />
    </div>
  );
}
