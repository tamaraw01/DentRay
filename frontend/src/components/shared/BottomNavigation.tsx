"use client";

import Link from "next/link";

import { cn } from "@/lib/utils";

export const appNavItems = [
  { href: "/app", icon: "home", label: "Beranda", mobileLabel: "Beranda" },
  { href: "/app/scan", icon: "scan", label: "Skrining", mobileLabel: "Scan" },
  { href: "/app/history", icon: "history", label: "Riwayat", mobileLabel: "Riwayat" },
  { href: "/app/profile", icon: "profile", label: "Profil", mobileLabel: "Profil" }
] as const;

export function AppNavIcon({ name }: { name: (typeof appNavItems)[number]["icon"] }) {
  const iconClassName = "h-[1.1rem] w-[1.1rem] shrink-0";

  if (name === "scan") {
    return (
      <svg aria-hidden="true" className={iconClassName} fill="none" viewBox="0 0 24 24">
        <path d="M5 8V5h3M16 5h3v3M19 16v3h-3M8 19H5v-3" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
        <path d="M7 12h10" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
      </svg>
    );
  }

  if (name === "history") {
    return (
      <svg aria-hidden="true" className={iconClassName} fill="none" viewBox="0 0 24 24">
        <path d="M12 7v5l3 2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        <path d="M5 12a7 7 0 1 0 2-5" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
        <path d="M5 5v4h4" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
      </svg>
    );
  }

  if (name === "profile") {
    return (
      <svg aria-hidden="true" className={iconClassName} fill="none" viewBox="0 0 24 24">
        <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" stroke="currentColor" strokeWidth="2" />
        <path d="M5 20a7 7 0 0 1 14 0" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" className={iconClassName} fill="none" viewBox="0 0 24 24">
      <path d="m4 11 8-7 8 7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
      <path d="M6 10v10h12V10" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  );
}

type BottomNavigationProps = {
  pathname: string;
};

export function BottomNavigation({ pathname }: BottomNavigationProps) {
  return (
    <nav
      aria-label="Navigasi aplikasi"
      className="fixed inset-x-0 bottom-0 z-40 rounded-t-[1.75rem] bg-white/95 px-3 pt-2.5 pb-[max(0.6rem,env(safe-area-inset-bottom))] shadow-[0_-6px_28px_rgba(15,23,42,0.09)] backdrop-blur-xl md:hidden"
    >
      <div className="mx-auto grid max-w-md grid-cols-4">
        {appNavItems.map((item) => {
          const isActive = item.href === "/app" ? pathname === item.href : pathname.startsWith(item.href);

          return (
            <Link
              aria-current={isActive ? "page" : undefined}
              aria-label={item.label}
              className="flex items-center justify-center py-1 focus-visible:outline-none"
              href={item.href}
              key={item.href}
            >
              <span
                className={cn(
                  "flex h-11 w-11 items-center justify-center rounded-[1.05rem] transition-all duration-200 ease-out",
                  isActive
                    ? "scale-[1.18] bg-clinical-600 text-white shadow-[0_10px_22px_rgba(11,124,255,0.32)]"
                    : "text-slate-400"
                )}
              >
                <AppNavIcon name={item.icon} />
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
