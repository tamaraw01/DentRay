import Image from "next/image";

import { cn } from "@/lib/utils";

type ExampleCard = {
  description: string;
  label: string;
  src: string;
};

type DetectionExampleProps = {
  className?: string;
  compact?: boolean;
  originalSrc?: string;
  overlaySrc?: string;
};

const defaultExampleImages = {
  original: "/examples/tooth-original.png",
  overlay: "/examples/tooth-overlay.png"
} as const;

function ExampleCardView({ card, compact }: { card: ExampleCard; compact?: boolean }) {
  return (
    <div className="rounded-[1.45rem] border border-slate-200/70 bg-white p-2.5 shadow-[0_12px_34px_rgba(15,23,42,0.05)] transition duration-200 hover:-translate-y-0.5">
      <div className="relative aspect-[3/2] overflow-hidden rounded-[1.1rem] border border-slate-100 bg-clinical-50/70">
        <Image
          alt={`Contoh ${card.label.toLowerCase()} DentRay`}
          className="object-contain"
          fill
          sizes="(max-width: 640px) calc(100vw - 3rem), 360px"
          src={card.src}
        />
      </div>
      <div className={cn("mt-3", compact ? "space-y-0.5" : "space-y-1")}>
        <p className="text-sm font-extrabold text-slate-950">{card.label}</p>
        {!compact && <p className="text-xs leading-5 text-slate-500">{card.description}</p>}
      </div>
    </div>
  );
}

export function DetectionExample({
  className,
  compact = false,
  originalSrc,
  overlaySrc
}: DetectionExampleProps) {
  const cards: ExampleCard[] = [
    {
      description: "Foto asli.",
      label: "Foto Asli",
      src: originalSrc ?? defaultExampleImages.original
    },
    {
      description: "Overlay hasil deteksi.",
      label: "Hasil Overlay",
      src: overlaySrc ?? defaultExampleImages.overlay
    }
  ];

  return (
    <section
      aria-label="Contoh hasil DentRay"
      className={cn("glass-card rounded-[1.9rem] p-3 sm:p-4", className)}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm font-extrabold text-slate-950">Contoh Hasil</p>
        <span className="rounded-full border border-clinical-200/80 bg-clinical-50/70 px-3 py-1 text-xs font-bold text-clinical-700">
          AI
        </span>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {cards.map((card) => (
          <ExampleCardView card={card} compact={compact} key={card.label} />
        ))}
      </div>
    </section>
  );
}
