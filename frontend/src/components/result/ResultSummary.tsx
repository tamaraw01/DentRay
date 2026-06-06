import { Card } from "@/components/ui/Card";
import type { PredictionResponse } from "@/types/prediction";

type ResultSummaryProps = {
  result: PredictionResponse;
};

export function ResultSummary({ result }: ResultSummaryProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_0.72fr]">
      <Card className="p-5">
        <div className="relative z-10">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-clinical-600">Indikasi visual</p>
          <h2 className="mt-3 text-2xl font-bold tracking-[-0.03em] text-slate-950">{result.interpretation_level}</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">Area yang ditandai berasal dari segmentasi AI.</p>
        </div>
      </Card>
      <Card>
        <p className="text-sm font-bold text-slate-500">Estimasi area tersegmentasi</p>
        <div className="mt-3 flex items-end gap-2">
          <span className="text-5xl font-bold tracking-[-0.05em] text-clinical-700">{result.segmented_area_percentage.toFixed(2)}</span>
          <span className="pb-2 text-xl font-bold text-slate-500">%</span>
        </div>
        <p className="mt-3 text-sm leading-6 text-slate-600">Estimasi pada foto analisis.</p>
        <p className="mt-4 rounded-[1.1rem] bg-clinical-50 px-3 py-2 text-sm font-semibold text-clinical-900">
          {result.segmented_area_pixels.toLocaleString("id-ID")} pixel ditandai
        </p>
      </Card>
    </div>
  );
}
