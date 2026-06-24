import { Section } from "@/components/shared/Section";
import { DetectionExample } from "@/components/shared/DetectionExample";
import { Card } from "@/components/ui/Card";
import { Glyph } from "@/components/ui/Glyph";
import { IconBadge, type BadgeTone } from "@/components/ui/IconBadge";

export const metadata = {
  title: "Cara Kerja"
};

const workflow = [
  {
    icon: "photo",
    tone: "blue" as BadgeTone,
    title: "Ambil atau Unggah Foto",
    body: "Kamera langsung atau pilih dari galeri."
  },
  {
    icon: "scan",
    tone: "green" as BadgeTone,
    title: "Analisis Cerdas",
    body: "Area yang mencurigakan dikenali secara otomatis."
  },
  {
    icon: "spark",
    tone: "amber" as BadgeTone,
    title: "Hasil Ditampilkan",
    body: "Area terindikasi ditandai merah."
  }
] as const;

export default function HowItWorksPage() {
  return (
    <Section
      eyebrow="Alur Skrining"
      title="Cara DentRay Bekerja"
      description="Tiga langkah sederhana, satu hasil visual."
    >
      <div className="grid gap-4 md:grid-cols-3">
        {workflow.map((item, index) => (
          <Card key={item.title}>
            <div className="flex items-center gap-3">
              <IconBadge tone={item.tone}>
                <Glyph name={item.icon} />
              </IconBadge>
              <span className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                Langkah {index + 1}
              </span>
            </div>
            <h2 className="mt-4 text-xl font-bold text-slate-950">{item.title}</h2>
            <p className="mt-2 leading-7 text-slate-600">{item.body}</p>
          </Card>
        ))}
      </div>
      <DetectionExample className="mt-6" />
    </Section>
  );
}
