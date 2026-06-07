import { Card } from "@/components/ui/Card";
import type { PredictionResponse } from "@/types/prediction";

type ResultImageGridProps = {
  result: PredictionResponse;
};

const imageLabels = [
  {
    key: "predicted_mask",
    title: "Mask",
    focus: false
  },
  {
    key: "overlay",
    title: "Overlay",
    focus: true
  }
] as const;

export function ResultImageGrid({ result }: ResultImageGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {imageLabels.map((item) => (
        <Card className={item.focus ? "p-3 ring-1 ring-clinical-200 shadow-[0_18px_44px_rgba(37,99,235,0.10)]" : "p-3"} key={item.key}>
          <div className="aspect-[3/2] overflow-hidden rounded-[1.25rem] border border-slate-100 bg-slate-50">
            <img alt={item.title} className="h-full w-full object-contain" src={result[item.key]} />
          </div>
          <h3 className="mt-3 font-bold text-slate-950">{item.title}</h3>
        </Card>
      ))}
    </div>
  );
}
