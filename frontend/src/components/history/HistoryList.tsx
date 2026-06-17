"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { useDentRayUser } from "@/components/app/AppShell";
import { MascotShowcase } from "@/components/mascot/MascotShowcase";
import { Glyph } from "@/components/ui/Glyph";
import { IconBadge } from "@/components/ui/IconBadge";
import { listScanSessions } from "@/lib/scan-storage";
import type { ScanSessionSummary } from "@/types/scan";

export function HistoryList() {
  const user = useDentRayUser();
  const [sessions, setSessions] = useState<ScanSessionSummary[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    void listScanSessions(user)
      .then(setSessions)
      .catch((historyError) =>
        setError(historyError instanceof Error ? historyError.message : "Riwayat belum bisa dibuka.")
      );
  }, [user]);

  return (
    <div className="space-y-5">
      <header className="px-1">
        <h1 className="text-2xl font-bold tracking-[-0.03em] text-slate-950 sm:text-[1.7rem]">Riwayat Skrining</h1>
        <p className="mt-1 text-sm text-slate-500">Semua sesi skrining tersimpan di sini.</p>
      </header>

      {error && <p className="rounded-2xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}

      {sessions.length === 0 ? (
        <div className="glass-card flex items-center gap-4 rounded-[1.75rem] p-5">
          <MascotShowcase className="shrink-0" sizeClassName="h-24 w-[4.5rem]" />
          <div>
            <h2 className="text-base font-bold text-slate-900">Belum ada riwayat.</h2>
            <p className="mt-1.5 text-sm leading-6 text-slate-500">Skrining pertama Anda akan tampil di sini.</p>
            <Link
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-clinical-700 hover:text-clinical-600"
              href="/app/scan"
            >
              Mulai Skrining <Glyph className="h-4 w-4" name="arrow" />
            </Link>
          </div>
        </div>
      ) : (
        <ul className="space-y-3">
          {sessions.map((session) => (
            <li key={session.id}>
              <Link
                className="glass-card flex items-center gap-4 rounded-[1.5rem] p-4 transition-transform hover:-translate-y-0.5"
                href={`/app/history/${session.id}`}
              >
                <IconBadge tone="blue">
                  <Glyph name="scan" />
                </IconBadge>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-900">Sesi Skrining</p>
                  <p className="mt-0.5 truncate text-xs text-slate-500">
                    {new Date(session.created_at).toLocaleString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}{" "}
                    · {session.total_images} foto
                  </p>
                </div>
                <Glyph className="h-4 w-4 shrink-0 text-slate-300" name="arrow" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
