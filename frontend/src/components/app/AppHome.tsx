"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { useDentRayUser } from "@/components/app/AppShell";
import { listScanSessions } from "@/lib/scan-storage";
import type { ScanSessionSummary } from "@/types/scan";
import { Card } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { ToothModel } from "@/components/visuals/ToothModel";

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
              <p className="text-sm font-semibold text-slate-500">Halo, {user.fullName || user.email}</p>
              <h1 className="mt-8 max-w-xl text-4xl font-bold tracking-[-0.045em] text-slate-950 sm:text-5xl">Rawat senyum, mulai dari citra.</h1>
              <p className="mt-3 max-w-sm text-sm leading-6 text-slate-600">Ambil foto gigi dan lihat area yang ditandai.</p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <LinkButton href="/app/scan">Mulai scan</LinkButton>
                <LinkButton href="/app/history" variant="secondary">Riwayat</LinkButton>
              </div>
              <p className="mt-5 text-xs font-semibold text-slate-500">Bukan pengganti pemeriksaan dokter.</p>
            </div>

            <div className="relative min-h-[260px] overflow-hidden rounded-[1.8rem] border border-slate-200/70 bg-[radial-gradient(circle_at_58%_42%,rgba(255,255,255,0.9)_0%,rgba(219,234,254,0.54)_48%,rgba(239,246,255,0.86)_100%)]">
              <div className="absolute right-[-10%] top-[8%] h-[82%] w-[82%] rounded-full bg-clinical-100/50 blur-3xl" />
              <div className="absolute bottom-5 left-6 rounded-full border border-white/80 bg-white/70 px-3 py-1 text-xs font-bold text-clinical-700 shadow-sm backdrop-blur">
                Riksa awal
              </div>
              <ToothModel className="relative z-10 min-h-[270px] translate-x-8 sm:translate-x-10" position={[0, -0.12, 0]} scale={1.78} variant="small" />
            </div>
          </div>
        </section>
      </div>

      <aside className="space-y-4">
        <Card>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-clinical-600">Riwayat terakhir</p>
          {latest ? (
            <>
              <h2 className="mt-3 text-xl font-bold text-slate-950">{latest.highest_indication}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{latest.total_images} citra.</p>
              <Link className="mt-4 inline-block text-sm font-bold text-clinical-700" href={`/app/history/${latest.id}`}>
                Lihat detail
              </Link>
            </>
          ) : (
            <p className="mt-3 text-sm leading-6 text-slate-600">Belum ada hasil tersimpan.</p>
          )}
        </Card>
      </aside>
    </div>
  );
}
