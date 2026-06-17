"use client";

import { useEffect, useState } from "react";

import { getScanSessionDetail } from "@/lib/scan-storage";
import type { ScanSessionSummary, StoredScanResult } from "@/types/scan";
import { Card } from "@/components/ui/Card";

type HistoryDetailProps = {
  id: string;
};

export function HistoryDetail({ id }: HistoryDetailProps) {
  const [session, setSession] = useState<ScanSessionSummary | null>(null);
  const [results, setResults] = useState<StoredScanResult[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    void getScanSessionDetail(id)
      .then((detail) => {
        setSession(detail.session);
        setResults(detail.results);
      })
      .catch((detailError) => setError(detailError instanceof Error ? detailError.message : "Detail belum bisa dibuka."));
  }, [id]);

  if (error) {
    return (
      <Card>
        <p className="text-sm text-red-700">{error}</p>
      </Card>
    );
  }

  if (!session) {
    return (
      <Card>
        <p className="text-sm text-slate-600">Memuat detail skrining...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <header className="px-1">
        <h1 className="text-2xl font-bold tracking-[-0.03em] text-slate-950 sm:text-[1.7rem]">Sesi Skrining</h1>
        <p className="mt-1 text-sm text-slate-500">
          {new Date(session.created_at).toLocaleString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          })}{" "}
          · {session.total_images} foto
        </p>
      </header>

      {results.map((result) => (
        <Card key={result.id}>
          <h2 className="text-lg font-bold text-slate-900">Hasil Overlay</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">Area terdeteksi ditandai overlay.</p>
          <div className="mt-4 rounded-[1.35rem] border border-clinical-200 bg-white p-3 shadow-[0_16px_38px_rgba(37,99,235,0.08)]">
            {result.overlay_image_url ? (
              <div className="flex max-h-[70svh] items-center justify-center overflow-hidden rounded-xl bg-clinical-50/70 p-2">
                <img alt="Overlay hasil skrining" className="h-auto max-h-[68svh] w-auto max-w-full object-contain" src={result.overlay_image_url} />
              </div>
            ) : (
              <p className="p-4 text-sm text-slate-500">Gambar overlay tidak tersedia untuk hasil ini.</p>
            )}
            <p className="mt-2 text-sm font-bold text-slate-700">Overlay</p>
          </div>
        </Card>
      ))}
      <Card className="border-amber-200/70 bg-amber-50/80 shadow-none">
        <p className="text-sm leading-6 text-amber-900">Skrining visual awal. Bukan pengganti dokter gigi.</p>
      </Card>
    </div>
  );
}
