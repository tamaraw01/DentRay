import { MascotCard } from "@/components/mascot/MascotCard";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { LinkButton } from "@/components/ui/Button";

export function HeroSection() {
  return (
    <section className="relative flex min-h-screen overflow-hidden px-4 py-5 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_66%_28%,rgba(11,124,255,0.16),transparent_24rem),radial-gradient(circle_at_28%_76%,rgba(22,212,255,0.12),transparent_20rem)]" />
      <div className="mx-auto flex w-full max-w-7xl flex-col">
        <header className="relative z-10 flex items-center justify-between">
          <BrandLogo showText size="md" />
          <span className="rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-xs font-bold text-clinical-700 shadow-sm">DentRay</span>
        </header>

        <div className="relative z-10 grid flex-1 items-center gap-8 py-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="order-2 mx-auto w-full max-w-xl text-center lg:order-1 lg:mx-0 lg:text-left">
            <h1 className="text-6xl font-extrabold leading-[0.94] tracking-[-0.035em] text-slate-950 sm:text-7xl lg:text-8xl">
              DentRay
            </h1>
            <p className="mt-5 text-2xl font-extrabold tracking-[-0.02em] text-slate-950 sm:text-3xl">
              Skrining awal, dari satu foto.
            </p>
            <p className="mx-auto mt-4 max-w-md text-base leading-7 text-slate-600 lg:mx-0">
              DentRay menganalisis foto gigi dan menandai area yang perlu diperhatikan secara visual.
            </p>
            <p className="mt-4 text-sm font-semibold text-slate-500">Hasil skrining visual, bukan pengganti pemeriksaan dokter gigi.</p>
          </div>

          <div className="order-1 lg:order-2">
            <div className="relative mx-auto w-full max-w-[660px]">
              <MascotCard animated className="relative z-10 min-h-[360px]" priority variant="floating" />
            </div>
          </div>
        </div>

        <div className="relative z-20 mx-auto grid w-full max-w-md gap-3 pb-3 sm:grid-cols-2 lg:mx-0">
          <LinkButton className="min-h-[3.25rem] rounded-[1.35rem] px-7" href="/login">
            Masuk
          </LinkButton>
          <LinkButton className="min-h-[3.25rem] rounded-[1.35rem] px-7" href="/signup" variant="secondary">
            Daftar
          </LinkButton>
        </div>
      </div>
    </section>
  );
}
