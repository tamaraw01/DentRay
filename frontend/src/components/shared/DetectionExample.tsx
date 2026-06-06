import { cn } from "@/lib/utils";

type ExampleCard = {
  description: string;
  kind: "photo" | "mask" | "overlay";
  label: string;
  src?: string;
};

type DetectionExampleProps = {
  className?: string;
  compact?: boolean;
  maskSrc?: string;
  originalSrc?: string;
  overlaySrc?: string;
};

const defaultExampleImages = {
  mask: "/examples/tooth-mask.png",
  original: "/examples/tooth-original.png",
  overlay: "/examples/tooth-overlay.png"
};

function PlaceholderImage({ kind }: { kind: ExampleCard["kind"] }) {
  const showMask = kind === "mask" || kind === "overlay";
  const showOverlay = kind === "overlay";

  return (
    <div className="relative flex aspect-[3/2] items-center justify-center overflow-hidden rounded-[1.25rem] border border-slate-100 bg-gradient-to-br from-slate-50 via-white to-clinical-50 shadow-[inset_0_0_36px_rgba(96,165,250,0.08)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_22%,rgba(96,165,250,0.12),transparent_13rem)]" />
      <div className="relative h-[62%] w-[72%] rounded-[45%] border border-slate-200/70 bg-gradient-to-br from-white via-slate-50 to-clinical-100 shadow-[0_16px_42px_rgba(15,23,42,0.06)]">
        <div className="absolute left-[18%] top-[12%] h-[76%] w-[34%] rounded-[54%_44%_44%_50%] bg-white" />
        <div className="absolute right-[18%] top-[12%] h-[76%] w-[34%] rounded-[44%_54%_50%_44%] bg-white" />
        <div className="absolute left-1/2 top-[20%] h-[62%] w-[4%] -translate-x-1/2 rounded-full bg-slate-200/70" />
        {(kind === "photo" || showOverlay) && (
          <div className="absolute right-[20%] top-[42%] h-[18%] w-[20%] rounded-full bg-red-300/70 shadow-[0_0_18px_rgba(248,113,113,0.24)]" />
        )}
      </div>
      {showMask && <div className="absolute right-[31%] top-[43%] h-[15%] w-[17%] rounded-full bg-red-500/82" />}
      {showMask && <div className="absolute inset-0 bg-red-500/[0.03]" />}
    </div>
  );
}

function ExampleCardView({ card, compact }: { card: ExampleCard; compact?: boolean }) {
  const imageFit = card.kind === "mask" ? "object-contain p-2" : "object-cover";

  return (
    <div className="rounded-[1.45rem] border border-slate-200/70 bg-white/78 p-2.5 shadow-[0_14px_40px_rgba(15,23,42,0.05)] backdrop-blur transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_48px_rgba(15,23,42,0.07)]">
      {card.src ? (
        <div className="aspect-[3/2] overflow-hidden rounded-[1.1rem] border border-slate-100 bg-gradient-to-br from-clinical-50/80 to-white/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
          <img alt={`Contoh ${card.label.toLowerCase()} DentRay`} className={cn("h-full w-full", imageFit)} src={card.src} />
        </div>
      ) : (
        <PlaceholderImage kind={card.kind} />
      )}
      <div className={cn("mt-3", compact ? "space-y-0.5" : "space-y-1")}>
        <p className="text-sm font-extrabold text-slate-950">{card.label}</p>
        {!compact && <p className="text-xs leading-5 text-slate-500">{card.description}</p>}
      </div>
    </div>
  );
}

export function DetectionExample({ className, compact = false, maskSrc, originalSrc, overlaySrc }: DetectionExampleProps) {
  const cards: ExampleCard[] = [
    {
      description: "Foto gigi masuk.",
      kind: "photo",
      label: "Foto",
      src: originalSrc ?? defaultExampleImages.original
    },
    {
      description: "Model membuat mask.",
      kind: "mask",
      label: "Mask",
      src: maskSrc ?? defaultExampleImages.mask
    },
    {
      description: "Area ditandai merah.",
      kind: "overlay",
      label: "Overlay",
      src: overlaySrc ?? defaultExampleImages.overlay
    }
  ];

  return (
    <section
      aria-label="Contoh hasil segmentasi DentRay"
      className={cn(
        "glass-card rounded-[1.9rem] p-3 sm:p-4",
        className
      )}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm font-extrabold text-slate-950">Contoh hasil segmentasi.</p>
        <span className="rounded-full border border-clinical-200/80 bg-clinical-50/70 px-3 py-1 text-xs font-bold text-clinical-700">
          U-Net
        </span>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {cards.map((card) => (
          <ExampleCardView card={card} compact={compact} key={card.label} />
        ))}
      </div>
    </section>
  );
}
