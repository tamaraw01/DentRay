import { DentRayMascot } from "@/components/mascot/DentRayMascot";
import { cn } from "@/lib/utils";

type MascotShowcaseProps = {
  animated?: boolean;
  priority?: boolean;
  className?: string;
  sizeClassName?: string;
};

export function MascotShowcase({
  animated = true,
  priority = false,
  className,
  sizeClassName = "h-32 w-24 sm:h-44 sm:w-32 lg:h-56 lg:w-40"
}: MascotShowcaseProps) {
  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      {/* Colorful halo */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[118%] w-[118%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[conic-gradient(from_130deg,#7dd3fc,#a5b4fc,#f0abfc,#fde68a,#86efac,#7dd3fc)] opacity-55 blur-2xl"
      />
      {/* Soft white core keeps the mascot crisp over the halo */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[72%] w-[72%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/75 blur-xl"
      />
      {/* Grounding shadow */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[5%] left-1/2 h-[9%] w-[58%] -translate-x-1/2 rounded-[50%] bg-clinical-900/10 blur-md"
      />
      <DentRayMascot
        animated={animated}
        className="relative z-10"
        priority={priority}
        size="lg"
        sizeClassName={sizeClassName}
      />
    </div>
  );
}
