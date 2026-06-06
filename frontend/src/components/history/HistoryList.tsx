"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { useDentRayUser } from "@/components/app/AppShell";
import { listScanSessions } from "@/lib/scan-storage";
import type { ScanSessionSummary } from "@/types/scan";
import { Card } from "@/components/ui/Card";

export function HistoryList() {
  const user = useDentRayUser();
  const [sessions, setSessions] = useState<ScanSessionSummary[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    void listScanSessions(user)
      .then(setSessions)
      .catch((historyError) => setError(historyError instanceof Error ? historyError.message : "Riwayat belum bisa dibuka."));
  }, [user]);

  return (
    <div className="space-y-4">
      <div className="glass-card rounded-[1.9rem] p-5">
        <div className="relative z-10">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-clinical-600">Riwayat</p>
          <h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-slate-950">Riwayat</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">Hasil tersimpan.</p>
        </div>
      </div>
      {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {sessions.length === 0 ? (
        <Card>
          <p className="text-sm leading-6 text-slate-600">Belum ada skrining tersimpan.</p>
        </Card>
      ) : (
        sessions.map((session) => (
          <Card key={session.id}>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
              {new Date(session.created_at).toLocaleString("id-ID")}
            </p>
            <h2 className="mt-2 text-xl font-bold text-slate-950">{session.highest_indication}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{session.total_images} foto dianalisis.</p>
            <Link className="mt-4 inline-block rounded-[1rem] bg-clinical-50 px-4 py-2 text-sm font-bold text-clinical-700" href={`/app/history/${session.id}`}>
              Lihat detail
            </Link>
          </Card>
        ))
      )}
    </div>
  );
}
