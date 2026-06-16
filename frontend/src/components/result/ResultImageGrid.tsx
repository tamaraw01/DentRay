import type { PredictionResponse } from "@/types/prediction";

type ResultImageGridProps = {
  result: PredictionResponse;
};

export function ResultImageGrid({ result }: ResultImageGridProps) {
  return (
    <div className="rounded-[1.7rem] border border-clinical-100 bg-white p-3 shadow-[0_18px_44px_rgba(37,99,235,0.08)]">
      <div className="flex max-h-[70svh] items-center justify-center overflow-hidden rounded-[1.35rem] bg-slate-50 p-2">
        <img alt="Hasil overlay skrining DentRay — area yang terdeteksi ditandai merah" className="h-auto max-h-[68svh] w-auto max-w-full object-contain" src={result.overlay} />
      </div>
      <p className="px-1 pb-1 pt-3 text-sm font-bold text-slate-900">Overlay</p>
    </div>
  );
}
