"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { useDentRayUser } from "@/components/app/AppShell";
import { DentRayMascot } from "@/components/mascot/DentRayMascot";
import { listScanSessions } from "@/lib/scan-storage";
import type { ScanSessionSummary } from "@/types/scan";
import { Card } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";

const informationLinks = [
  { href: "/how-it-works", label: "Cara kerja" },
  { href: "/about", label: "Tentang" },
  { href: "/disclaimer", label: "Catatan" }
] as const;

export function AppHome() {
  const user = useDentRayUser();
  const [latest, setLatest] = useState<ScanSessionSummary | null>(null);

  useEffect(() => {
    void listScanSessions(user).then((sessions) => setLatest(sessions[0] ?? null)).catch(() => setLatest(null));
  }, [user]);

  const firstName = user.fullName?.split(" ")[0] || user.email?.split("@")[0] || "Pengguna";

  return (
    <div className="space-y-4">
      {/* Hero greeting card */}
      <section className="glass-card overflow-hidden rounded-[2rem] p-6 sm:p-7">
        <div className="grid grid-cols-[1fr_auto] items-center gap-4 sm:gap-6">
          <div>
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.15em] text-clinical-600">
              Selamat datang
            </p>
            <h1 className="mt-2 text-[2.2rem] font-bold leading-[1.1] tracking-[-0.04em] text-slate-950 sm:text-[2.8rem]">
              Halo, {firstName}!
            </h1>
            <p className="mt-2.5 text-sm leading-relaxed text-slate-500">
              Satu foto yang jelas sudah cukup.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <LinkButton href="/app/scan">Mulai Skrining</LinkButton>
              <LinkButton href="/app/history" variant="secondary">Riwayat</LinkButton>
            </div>
            <p className="mt-4 text-xs text-slate-400">Bukan diagnosis klinis.</p>
          </div>
          <DentRayMascot
            animated
            className="sm:h-64 sm:w-48"
            priority
            size="md"
          />
        </div>
      </section>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <Card className="p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[0.75rem] bg-blue-50 text-clinical-600">
              <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
                <rect height="14" rx="2" stroke="currentColor" strokeWidth="2" width="16" x="4" y="4" />
                <path d="M8 2v2M16 2v2M4 9h16" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-[0.68rem] text-slate-500">Skrining Terakhir</p>
              <p className="mt-0.5 truncate text-sm font-bold text-slate-900">
                {latest
                  ? new Date(latest.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short" })
                  : "–"}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[0.75rem] bg-emerald-50 text-emerald-600">
              <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
                <path d="M4 8h16M4 16h16" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
                <path d="M8 4v4M12 4v4M16 4v4" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-[0.68rem] text-slate-500">Foto Teranalisis</p>
              <p className="mt-0.5 text-sm font-bold text-slate-900">
                {latest?.total_images != null ? `${latest.total_images} foto` : "–"}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Info links */}
      <Card className="p-4 sm:p-5">
        <p className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-slate-400">
          Pelajari
        </p>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
          {informationLinks.map((item) => (
            <Link
              className="text-sm font-semibold text-clinical-700 hover:text-clinical-600"
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
