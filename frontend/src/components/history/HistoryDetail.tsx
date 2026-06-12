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
        <p className="text-sm text-slate-600">Memuat detail...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <Card>
        <div className="relative z-10">
          <p className="text-sm text-slate-500">{new Date(session.created_at).toLocaleString("id-ID")}</p>
          <p className="mt-3 text-xs font-bold uppercase tracking-[0.16em] text-clinical-600">Detail hasil</p>
          <h1 className="mt-2 text-3xl font-extrabold text-slate-950">Hasil skrining</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">{session.total_images} citra dianalisis.</p>
        </div>
      </Card>

      {results.map((result) => (
        <Card key={result.id}>
          <h2 className="text-xl font-extrabold text-slate-950">Overlay</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">Area yang ditandai tampil pada citra hasil.</p>
          <div className="mt-4 rounded-[1.35rem] border border-clinical-200 bg-white p-3 shadow-[0_16px_38px_rgba(37,99,235,0.08)]">
            {result.overlay_image_url ? (
              <div className="flex max-h-[70svh] items-center justify-center overflow-hidden rounded-xl bg-clinical-50/70 p-2">
                <img alt="Overlay hasil skrining" className="h-auto max-h-[68svh] w-auto max-w-full object-contain" src={result.overlay_image_url} />
              </div>
            ) : (
              <p className="p-4 text-sm text-slate-500">Overlay tidak tersedia.</p>
            )}
            <p className="mt-2 text-sm font-bold text-slate-700">Overlay</p>
          </div>
        </Card>
      ))}
      <Card className="border-amber-200/70 bg-amber-50/80 shadow-none">
        <p className="text-sm leading-6 text-amber-900">Hasil ini adalah skrining awal, bukan pengganti pemeriksaan dokter.</p>
      </Card>
    </div>
  );
}
