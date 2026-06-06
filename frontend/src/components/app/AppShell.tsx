"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";

import { BrandLogo } from "@/components/shared/BrandLogo";
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

const navItems = [
  { href: "/app", icon: "home", label: "Beranda" },
  { href: "/app/scan", icon: "scan", label: "Skrining" },
  { href: "/app/history", icon: "history", label: "Riwayat" },
  { href: "/app/profile", icon: "profile", label: "Profil" }
];

function NavIcon({ name }: { name: string }) {
  if (name === "scan") {
    return (
      <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
        <path d="M5 8V5h3M16 5h3v3M19 16v3h-3M8 19H5v-3" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
        <path d="M7 12h10" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
      </svg>
    );
  }

  if (name === "history") {
    return (
      <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
        <path d="M12 7v5l3 2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        <path d="M5 12a7 7 0 1 0 2-5" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
        <path d="M5 5v4h4" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
      </svg>
    );
  }

  if (name === "profile") {
    return (
      <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
        <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" stroke="currentColor" strokeWidth="2" />
        <path d="M5 20a7 7 0 0 1 14 0" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
      <path d="m4 11 8-7 8 7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
      <path d="M6 10v10h12V10" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  );
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
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <BrandLogo className="mb-4 justify-center" showText size="sm" />
          <p className="text-sm font-semibold text-slate-600">Memeriksa akun...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-3 pb-24 pt-4 sm:px-5 lg:pb-8">
      <UserContext.Provider value={user}>
        <div className="app-frame mx-auto grid max-w-6xl gap-5 rounded-[2rem] p-3 sm:rounded-[2.35rem] sm:p-5 lg:grid-cols-[84px_minmax(0,1fr)]">
          <aside className="sticky top-24 hidden h-[calc(100vh-8rem)] flex-col items-center justify-between rounded-[2rem] border border-slate-200/80 bg-white/82 px-3 py-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)] backdrop-blur-xl lg:flex">
            <Link aria-label="DentRay beranda" href="/app">
              <BrandLogo size="sm" />
            </Link>

            <nav className="flex flex-col gap-3">
              {navItems.map((item) => {
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
                    <NavIcon name={item.icon} />
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
      <nav className="fixed inset-x-0 bottom-4 z-40 mx-auto flex w-[min(92%,430px)] items-center justify-between rounded-full border border-slate-200/80 bg-white/88 p-2 text-slate-500 shadow-[0_18px_45px_rgba(15,23,42,0.10)] backdrop-blur-xl lg:hidden">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              className={`rounded-full px-3 py-3 text-xs font-bold transition ${
                isActive ? "bg-clinical-600 text-white shadow-[0_10px_24px_rgba(37,99,235,0.18)]" : "text-slate-500 hover:bg-slate-50 hover:text-clinical-700"
              }`}
              href={item.href}
              key={item.href}
            >
              <span className="flex items-center gap-1.5">
                <NavIcon name={item.icon} />
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
