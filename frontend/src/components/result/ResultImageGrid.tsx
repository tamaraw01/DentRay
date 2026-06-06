import { Card } from "@/components/ui/Card";
import type { PredictionResponse } from "@/types/prediction";

type ResultImageGridProps = {
  result: PredictionResponse;
};

const imageLabels = [
  {
    key: "original_preview",
    title: "Foto",
    description: "Gambar analisis.",
    focus: false
  },
  {
    key: "predicted_mask",
    title: "Mask",
    description: "Mask segmentasi.",
    focus: false
  },
  {
    key: "overlay",
    title: "Overlay",
    description: "Area yang ditandai.",
    focus: true
  }
] as const;

export function ResultImageGrid({ result }: ResultImageGridProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-[0.86fr_0.86fr_1.12fr]">
      {imageLabels.map((item) => (
        <Card className={item.focus ? "p-3 ring-1 ring-clinical-200" : "p-3"} key={item.key}>
          <div className="aspect-[3/2] overflow-hidden rounded-[1.25rem] border border-slate-100 bg-slate-50">
            <img alt={item.title} className="h-full w-full object-contain" src={result[item.key]} />
          </div>
          <h3 className="mt-3 font-extrabold text-slate-950">{item.title}</h3>
          <p className="mt-1 text-sm leading-6 text-slate-500">{item.description}</p>
        </Card>
      ))}
    </div>
  );
}
