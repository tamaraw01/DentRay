export function Footer() {
  return (
    <footer className="border-t border-slate-200/70 bg-white/58 px-4 pt-7 pb-[calc(5rem+env(safe-area-inset-bottom))] backdrop-blur sm:px-6 md:pb-7 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-3 text-sm text-slate-600 md:grid-cols-[1fr_auto] md:items-center">
        <p>Skrining visual gigi, cukup dari satu foto.</p>
        <p className="font-semibold text-slate-900">Skrining awal, bukan pengganti dokter gigi.</p>
      </div>
    </footer>
  );
}
