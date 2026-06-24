import { Section } from "@/components/shared/Section";
import { Card } from "@/components/ui/Card";
import { Glyph } from "@/components/ui/Glyph";
import { IconBadge } from "@/components/ui/IconBadge";

export const metadata = {
  title: "Tentang"
};

export default function AboutPage() {
  return (
    <Section
      eyebrow="Tentang DentRay"
      title="Skrining Gigi Cerdas"
      description="Deteksi area mencurigakan dari satu foto gigi."
    >
      <div className="grid gap-5 md:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <IconBadge tone="blue">
            <Glyph name="scan" />
          </IconBadge>
          <h2 className="mt-4 text-2xl font-bold tracking-[-0.03em] text-slate-950">Visualisasi area yang perlu diperhatikan.</h2>
          <p className="mt-2 leading-7 text-slate-600">Foto gigi dianalisis secara otomatis. Area terdeteksi ditandai dengan jelas.</p>
        </Card>
        <Card>
          <IconBadge tone="red">
            <Glyph name="shield" />
          </IconBadge>
          <h2 className="mt-4 text-2xl font-bold tracking-[-0.03em] text-slate-950">Konfirmasi dokter tetap diperlukan.</h2>
          <p className="mt-2 leading-7 text-slate-600">Akurasi bergantung pada kualitas foto. Bukan diagnosis medis.</p>
        </Card>
      </div>
    </Section>
  );
}
