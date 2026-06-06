import { Section } from "@/components/shared/Section";
import { DetectionExample } from "@/components/shared/DetectionExample";
import { Card } from "@/components/ui/Card";

export const metadata = {
  title: "Cara Kerja"
};

const workflow = [
  {
    title: "Ambil foto",
    body: "Gunakan kamera atau galeri."
  },
  {
    title: "AI membuat mask",
    body: "Model memproses gambar."
  },
  {
    title: "Overlay menandai area",
    body: "Area ditandai merah."
  }
];

export default function HowItWorksPage() {
  return (
    <Section
      eyebrow="Cara kerja"
      title="Cara kerja"
      description="Singkat dan mudah diikuti."
    >
      <div className="grid gap-4 md:grid-cols-3">
        {workflow.map((item, index) => (
          <Card className={index === 2 ? "dark-med-panel" : ""} key={item.title}>
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-clinical-600 text-sm font-bold text-white shadow-[0_10px_24px_rgba(37,99,235,0.16)]">
              {index + 1}
            </span>
            <h2 className="mt-4 text-xl font-bold text-slate-950">{item.title}</h2>
            <p className="mt-3 leading-7 text-slate-600">{item.body}</p>
          </Card>
        ))}
      </div>
      <DetectionExample className="mt-6" />
    </Section>
  );
}
