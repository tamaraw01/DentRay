import { Section } from "@/components/shared/Section";
import { Card } from "@/components/ui/Card";
import { Glyph } from "@/components/ui/Glyph";
import { IconBadge } from "@/components/ui/IconBadge";

export const metadata = {
  title: "Catatan Medis"
};

export default function DisclaimerPage() {
  return (
    <Section
      eyebrow="Perhatian Medis"
      title="Catatan Medis Penting"
      description="Baca sebelum menggunakan DentRay."
    >
      <Card className="max-w-4xl">
        <IconBadge tone="red">
          <Glyph name="shield" />
        </IconBadge>
        <p className="mt-4 text-lg font-semibold leading-8 text-slate-950">DentRay adalah alat bantu skrining visual awal, bukan pengganti pemeriksaan klinis dokter gigi.</p>
        <div className="mt-6 grid gap-4 text-sm leading-6 text-slate-600 md:grid-cols-2">
          <p className="rounded-2xl border border-slate-100 bg-slate-50 p-4">Kualitas foto memengaruhi akurasi hasil.</p>
          <p className="rounded-2xl border border-slate-100 bg-slate-50 p-4">Ada keluhan gigi? Segera konsultasikan ke dokter gigi.</p>
        </div>
      </Card>
    </Section>
  );
}
