import Link from "next/link";

import { BrandLogo } from "@/components/shared/BrandLogo";
import { LinkButton } from "@/components/ui/Button";
import { siteConfig } from "@/config/site";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-[#F7FAFF]/82 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link className="flex min-w-0 shrink-0 items-center gap-3" href="/" aria-label="DentRay beranda">
          <BrandLogo showText size="sm" />
          <span className="hidden sm:block">
            <span className="hidden text-xs font-semibold text-slate-500 sm:block">Skrining visual</span>
          </span>
        </Link>
        <div className="hidden min-w-0 items-center justify-center gap-0.5 md:flex lg:gap-1">
          {siteConfig.navItems.map((item) => (
            <Link
              className="whitespace-nowrap rounded-full px-2 py-2 text-xs font-semibold text-slate-600 transition hover:bg-white/70 hover:text-clinical-700 lg:px-3 lg:text-sm"
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <LinkButton className="hidden lg:inline-flex" href="/login">
            Mulai Skrining
          </LinkButton>
        </div>
      </nav>
    </header>
  );
}
