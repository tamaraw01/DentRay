import { Section } from "@/components/shared/Section";
import { DetectionExample } from "@/components/shared/DetectionExample";
import { Card } from "@/components/ui/Card";

export const metadata = {
  title: "Cara Kerja"
};

const workflow = [
  {
    title: "Ambil atau Unggah Foto",
    body: "Gunakan kamera perangkat atau pilih foto dari galeri."
  },
  {
    title: "AI Menganalisis Gambar",
    body: "Model segmentasi AI memproses dan mendeteksi area visual yang mencurigakan."
  },
  {
    title: "Overlay Ditampilkan",
    body: "Area yang terdeteksi ditandai dengan overlay merah pada foto asli."
  }
];

export default function HowItWorksPage() {
  return (
    <Section
      eyebrow="Alur Skrining"
      title="Cara DentRay Bekerja"
      description="Tiga langkah sederhana untuk mendapatkan hasil skrining visual dari foto gigi Anda."
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
