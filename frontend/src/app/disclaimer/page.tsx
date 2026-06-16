import { Section } from "@/components/shared/Section";
import { Card } from "@/components/ui/Card";

export const metadata = {
  title: "Catatan Medis"
};

export default function DisclaimerPage() {
  return (
    <Section
      eyebrow="Perhatian Medis"
      title="Catatan Medis Penting"
      description="Baca catatan medis ini sebelum menggunakan DentRay."
    >
      <Card className="max-w-4xl">
        <p className="text-lg font-semibold leading-8 text-slate-950">DentRay adalah alat bantu skrining visual awal berbasis AI. Hasil yang ditampilkan merupakan indikasi visual dari proses segmentasi gambar dan bukan pengganti pemeriksaan klinis oleh dokter gigi profesional.</p>
        <div className="mt-6 grid gap-4 text-sm leading-6 text-slate-600 md:grid-cols-2">
          <p className="rounded-2xl border border-slate-100 bg-slate-50 p-4">Kualitas dan sudut pengambilan foto dapat memengaruhi akurasi hasil secara signifikan.</p>
          <p className="rounded-2xl border border-slate-100 bg-slate-50 p-4">Jika ada keluhan atau gejala pada gigi, segera konsultasikan ke dokter gigi.</p>
        </div>
      </Card>
    </Section>
  );
}
