import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type SectionProps = {
  children: ReactNode;
  className?: string;
  eyebrow?: string;
  title?: string;
  description?: string;
};

export function Section({ children, className, eyebrow, title, description }: SectionProps) {
  return (
    <section className={cn("px-4 py-12 sm:px-6 lg:px-8", className)}>
      <div className="mx-auto max-w-6xl">
        {(eyebrow || title || description) && (
          <div className="mb-7 max-w-2xl">
            {eyebrow && <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-clinical-600">{eyebrow}</p>}
            {title && <h2 className="text-3xl font-bold tracking-[-0.04em] text-slate-950 sm:text-4xl">{title}</h2>}
            {description && <p className="mt-3 text-base leading-7 text-slate-600">{description}</p>}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
