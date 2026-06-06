import { Section } from "@/components/shared/Section";
import { Card } from "@/components/ui/Card";

export const metadata = {
  title: "Catatan Medis"
};

export default function DisclaimerPage() {
  return (
    <Section
      eyebrow="Catatan medis"
      title="Catatan medis"
      description="Skrining awal tetap perlu konfirmasi dokter."
    >
      <Card className="max-w-4xl">
        <p className="text-lg font-semibold leading-8 text-slate-950">DentRay membantu skrining awal dari foto. Hasil dapat dipengaruhi kualitas gambar dan bukan pengganti pemeriksaan dokter gigi.</p>
        <div className="mt-6 grid gap-4 text-sm leading-6 text-slate-600 md:grid-cols-2">
          <p className="rounded-2xl border border-slate-100 bg-slate-50 p-4">Kualitas foto dapat memengaruhi hasil.</p>
          <p className="rounded-2xl border border-slate-100 bg-slate-50 p-4">Jika ada keluhan, periksa ke dokter gigi.</p>
        </div>
      </Card>
    </Section>
  );
}
