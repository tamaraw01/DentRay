import { Section } from "@/components/shared/Section";
import { Card } from "@/components/ui/Card";

export const metadata = {
  title: "Tentang"
};

export default function AboutPage() {
  return (
    <Section
      eyebrow="Tentang DentRay"
      title="Skrining Gigi Berbasis AI"
      description="Deteksi area mencurigakan dari satu foto gigi."
    >
      <div className="grid gap-5 md:grid-cols-[1.05fr_0.95fr]">
        <Card className="dark-med-panel">
          <div className="relative z-10">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-clinical-600">Cara Kerja</p>
            <h2 className="mt-3 text-2xl font-bold tracking-[-0.03em] text-slate-950">Visualisasi area yang perlu diperhatikan.</h2>
            <p className="mt-3 leading-7 text-slate-600">Foto gigi dianalisis AI. Area terdeteksi ditandai secara visual.</p>
          </div>
        </Card>
        <Card>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-clinical-600">Penting Diketahui</p>
          <h2 className="mt-3 text-2xl font-bold tracking-[-0.03em] text-slate-950">Konfirmasi dokter tetap diperlukan.</h2>
          <p className="mt-3 leading-7 text-slate-600">Akurasi bergantung pada kualitas foto. Bukan diagnosis medis.</p>
        </Card>
      </div>
    </Section>
  );
}
