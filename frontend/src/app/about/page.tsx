import { Section } from "@/components/shared/Section";
import { Card } from "@/components/ui/Card";

export const metadata = {
  title: "Tentang"
};

export default function AboutPage() {
  return (
    <Section
      eyebrow="Tentang DentRay"
      title="Skrining gigi cerdas"
      description="Cek indikasi karies dari foto HP."
    >
      <div className="grid gap-5 md:grid-cols-[1.05fr_0.95fr]">
        <Card className="dark-med-panel">
          <div className="relative z-10">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-clinical-600">Fungsi</p>
            <h2 className="mt-3 text-2xl font-bold tracking-[-0.03em] text-slate-950">Lihat area visual.</h2>
          <p className="mt-3 leading-7 text-slate-600">DentRay menandai area dari foto gigi.</p>
          </div>
        </Card>
        <Card>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-clinical-600">Batasan</p>
          <h2 className="mt-3 text-2xl font-bold tracking-[-0.03em] text-slate-950">Perlu konfirmasi dokter.</h2>
          <p className="mt-3 leading-7 text-slate-600">Hasil awal dapat dipengaruhi kualitas foto.</p>
        </Card>
      </div>
    </Section>
  );
}
