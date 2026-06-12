import { DentRayMascot } from "@/components/mascot/DentRayMascot";
import { cn } from "@/lib/utils";

type MascotCardProps = {
  animated?: boolean;
  className?: string;
  priority?: boolean;
  variant?: "card" | "floating" | "compact";
};

export function MascotCard({
  animated = false,
  className,
  priority = false,
  variant = "card"
}: MascotCardProps) {
  const mascotSize = variant === "compact" ? "sm" : variant === "floating" ? "hero" : "lg";

  return (
    <div
      className={cn(
        "relative isolate flex items-center justify-center overflow-hidden border border-slate-200/75 bg-[linear-gradient(145deg,#ffffff_0%,#f2f8ff_55%,#e7f4ff_100%)]",
        variant === "card" && "min-h-[250px] rounded-[1.8rem] shadow-[0_16px_44px_rgba(37,99,235,0.07)]",
        variant === "floating" && "min-h-[340px] rounded-[2.2rem] shadow-[0_22px_60px_rgba(37,99,235,0.09)]",
        variant === "compact" && "min-h-32 rounded-[1.6rem] shadow-[0_10px_28px_rgba(37,99,235,0.06)]",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-x-[13%] bottom-[8%] h-[42%] rounded-[50%] bg-[radial-gradient(ellipse,rgba(147,197,253,0.25),transparent_68%)]" />
      <DentRayMascot
        animated={animated}
        className="relative z-10"
        priority={priority}
        size={mascotSize}
      />
    </div>
  );
}
