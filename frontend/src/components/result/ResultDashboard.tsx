"use client";

import { Button } from "@/components/ui/Button";
import type { PredictionResponse } from "@/types/prediction";
import { ResultImageGrid } from "./ResultImageGrid";

type ResultDashboardProps = {
  result: PredictionResponse;
  onReset: () => void;
};

function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function ResultDashboard({ result, onReset }: ResultDashboardProps) {
  return (
    <section className="space-y-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-clinical-700">Hasil</p>
        <h2 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-slate-950">Hasil skrining</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">Mask dan overlay menunjukkan area yang ditandai.</p>
      </div>
      <ResultImageGrid result={result} />
      <div className="rounded-[1.5rem] border border-slate-200/80 bg-white/75 px-4 py-4 text-sm leading-6 text-slate-600 shadow-[0_12px_32px_rgba(15,23,42,0.04)]">
        <p>Area yang ditandai merupakan indikasi visual dari model AI.</p>
        <p className="mt-1 font-semibold text-slate-700">Hasil ini adalah skrining awal, bukan pengganti pemeriksaan dokter.</p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button onClick={onReset} type="button" variant="secondary">
          Ambil ulang
        </Button>
        <Button onClick={() => downloadDataUrl(result.overlay, "dentray-overlay.png")} type="button">
          Download overlay
        </Button>
      </div>
    </section>
  );
}
