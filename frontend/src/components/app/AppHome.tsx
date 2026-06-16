"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { useDentRayUser } from "@/components/app/AppShell";
import { MascotCard } from "@/components/mascot/MascotCard";
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

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
      <div className="space-y-5">
        <section className="glass-card overflow-hidden rounded-[2rem] p-5 sm:p-7 lg:p-8">
          <div className="grid gap-5 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
            <div className="relative z-10">
              <p className="text-sm font-semibold text-slate-500">Selamat datang, {user.fullName || user.email}</p>
              <h1 className="mt-8 max-w-xl text-4xl font-bold tracking-[-0.045em] text-slate-950 sm:text-5xl">Skrining Gigi Anda</h1>
              <p className="mt-3 max-w-sm text-sm leading-6 text-slate-600">Ambil satu foto gigi yang jelas, dan DentRay akan menandai area yang perlu diperhatikan.</p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <LinkButton href="/app/scan">Mulai Skrining</LinkButton>
                <LinkButton href="/app/history" variant="secondary">Riwayat</LinkButton>
              </div>
              <p className="mt-5 text-xs font-semibold text-slate-500">Hasil bersifat indikatif, bukan diagnosis klinis.</p>
            </div>

            <MascotCard animated className="min-h-[250px]" priority variant="card" />
          </div>
        </section>

        <nav aria-label="Informasi DentRay" className="rounded-[1.5rem] border border-slate-200/80 bg-white px-4 py-4 md:hidden">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Informasi DentRay</p>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
            {informationLinks.map((item) => (
              <Link className="text-sm font-bold text-clinical-700" href={item.href} key={item.href}>
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      </div>

      <aside className="space-y-4">
        <Card>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-clinical-600">Skrining Terakhir</p>
          {latest ? (
            <>
              <h2 className="mt-3 text-xl font-bold text-slate-950">Sesi Skrining</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {new Date(latest.created_at).toLocaleDateString("id-ID")} · {latest.total_images} foto
              </p>
              <Link className="mt-4 inline-block text-sm font-bold text-clinical-700" href={`/app/history/${latest.id}`}>
                Lihat Selengkapnya
              </Link>
            </>
          ) : (
            <p className="mt-3 text-sm leading-6 text-slate-600">Belum ada riwayat skrining.</p>
          )}
        </Card>
      </aside>
    </div>
  );
}
