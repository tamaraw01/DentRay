"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { PredictionResponse } from "@/types/prediction";
import { MedicalDisclaimer } from "./MedicalDisclaimer";
import { ResultImageGrid } from "./ResultImageGrid";
import { ResultSummary } from "./ResultSummary";

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

const safeNotes = [
  "Gunakan sebagai hasil awal.",
  "Ambil ulang jika foto kurang jelas.",
  "Perlu konfirmasi dokter gigi."
];

export function ResultDashboard({ result, onReset }: ResultDashboardProps) {
  const notes = result.recommendations.length > 0 ? result.recommendations : safeNotes;

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-clinical-700">Ringkasan</p>
          <h2 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-slate-950">Hasil skrining</h2>
        </div>
      </div>
      <ResultSummary result={result} />
      <ResultImageGrid result={result} />
      <Card className="p-4">
        <h3 className="text-base font-extrabold text-slate-950">Catatan visual</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">{result.interpretation_text}</p>
      </Card>
      {result.warnings.length > 0 && (
        <Card className="border-amber-200/70 bg-amber-50/80 shadow-none">
          <h3 className="text-base font-extrabold text-amber-950">Perhatian</h3>
          <ul className="mt-3 grid gap-2 text-sm leading-6 text-amber-900">
            {result.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </Card>
      )}
      <Card className="p-4">
        <h3 className="text-base font-extrabold text-slate-950">Saran singkat</h3>
        <ul className="mt-3 grid gap-2 text-sm leading-6 text-slate-600">
          {notes.map((note) => (
            <li className="rounded-[1.15rem] border border-slate-100 bg-slate-50 px-4 py-3" key={note}>
              {note}
            </li>
          ))}
        </ul>
      </Card>
      <MedicalDisclaimer disclaimer={result.disclaimer || "Hasil ini adalah skrining awal. Periksa ke dokter gigi untuk memastikan kondisi gigi Anda."} />
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
