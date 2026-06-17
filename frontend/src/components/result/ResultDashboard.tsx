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
  const disclaimer =
    result.disclaimer ??
    "Skrining awal, bukan pengganti dokter gigi.";

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-3xl font-bold tracking-[-0.04em] text-slate-950">Hasil Skrining</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">Area terindikasi ditandai merah.</p>
      </div>
      <ResultImageGrid result={result} />
      <div className="rounded-[1.4rem] border border-amber-200/70 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950">
        {disclaimer}
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button onClick={onReset} type="button" variant="secondary">
          Skrining Ulang
        </Button>
        <Button onClick={() => downloadDataUrl(result.overlay, "dentray-overlay.png")} type="button">
          Unduh Hasil
        </Button>
      </div>
    </section>
  );
}
