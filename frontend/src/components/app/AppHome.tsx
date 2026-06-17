"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { useDentRayUser } from "@/components/app/AppShell";
import { MascotShowcase } from "@/components/mascot/MascotShowcase";
import { Glyph } from "@/components/ui/Glyph";
import { IconBadge, type BadgeTone } from "@/components/ui/IconBadge";
import { listScanSessions } from "@/lib/scan-storage";
import type { ScanSessionSummary } from "@/types/scan";

const actionLinks = [
  { href: "/app/scan", label: "Mulai Skrining", icon: "scan", tone: "blue" },
  { href: "/app/history", label: "Lihat Riwayat", icon: "history", tone: "green" },
  { href: "/how-it-works", label: "Cara Kerja", icon: "info", tone: "amber" },
  { href: "/app/profile", label: "Profil Saya", icon: "profile", tone: "violet" }
] as const;

export function AppHome() {
  const user = useDentRayUser();
  const [sessions, setSessions] = useState<ScanSessionSummary[]>([]);

  useEffect(() => {
    void listScanSessions(user)
      .then(setSessions)
      .catch(() => setSessions([]));
  }, [user]);

  const firstName = user.fullName?.split(" ")[0] || user.email?.split("@")[0] || "Pengguna";

  const stats = useMemo(() => {
    const totalImages = sessions.reduce((sum, session) => sum + (session.total_images ?? 0), 0);
    const latest = sessions[0] ?? null;
    return [
      {
        icon: "scan",
        tone: "blue" as BadgeTone,
        label: "Total Skrining",
        value: String(sessions.length)
      },
      {
        icon: "photo",
        tone: "green" as BadgeTone,
        label: "Foto Dianalisis",
        value: String(totalImages)
      },
      {
        icon: "calendar",
        tone: "amber" as BadgeTone,
        label: "Skrining Terakhir",
        value: latest
          ? new Date(latest.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short" })
          : "–"
      },
      {
        icon: "shield",
        tone: "red" as BadgeTone,
        label: "Status Akun",
        value: "Aktif"
      }
    ] as const;
  }, [sessions]);

  const recent = sessions.slice(0, 3);

  return (
    <div className="space-y-4">
      {/* Greeting card — mascot is free to break out of the frame and overlap,
          but stays click-through (pointer-events-none) and behind the text. */}
      <section className="glass-card relative z-20 rounded-[2rem] px-5 py-6 sm:px-8 sm:py-8">
        <div className="grid grid-cols-[1fr_auto] items-center gap-2 sm:gap-4">
          <div className="relative z-10 max-w-md">
            <h1 className="text-[1.8rem] font-bold leading-[1.05] tracking-[-0.045em] text-slate-950 sm:text-[2.7rem]">
              Halo, {firstName}!
            </h1>
            <p className="mt-2 text-sm text-slate-500 sm:text-base">
              Mari jaga senyum Anda hari ini.
            </p>

            <div className="mt-5 grid grid-cols-1 gap-x-6 gap-y-3.5 min-[420px]:grid-cols-2 sm:mt-6">
              {actionLinks.map((item) => (
                <Link
                  className="group flex items-center gap-2.5 text-sm font-semibold text-slate-700 transition-colors hover:text-clinical-700"
                  href={item.href}
                  key={item.href}
                >
                  <IconBadge size="sm" tone={item.tone}>
                    <Glyph name={item.icon} />
                  </IconBadge>
                  <span className="leading-tight">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Narrow reserved cell keeps the text column safe; the mascot itself
              overflows this cell freely in every direction. */}
          <div className="relative z-0 w-14 self-stretch sm:w-24 lg:w-40">
            <div className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 sm:-right-2 lg:-right-4">
              <MascotShowcase
                priority
                sizeClassName="h-60 w-44 sm:h-[19rem] sm:w-56 lg:h-[26rem] lg:w-[19rem]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {stats.map((stat) => (
          <div className="glass-card rounded-[1.5rem] p-4 sm:p-5" key={stat.label}>
            <IconBadge tone={stat.tone}>
              <Glyph name={stat.icon} />
            </IconBadge>
            <p className="mt-3.5 text-xs leading-snug text-slate-500">{stat.label}</p>
            <p className="mt-1 text-2xl font-bold tracking-[-0.03em] text-slate-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Recent activity */}
      <section className="glass-card rounded-[1.75rem] p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Aktivitas Terakhir</h2>
          {recent.length > 0 && (
            <Link className="text-xs font-semibold text-clinical-700 hover:text-clinical-600" href="/app/history">
              Lihat semua
            </Link>
          )}
        </div>

        {recent.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">
            Belum ada skrining.{" "}
            <Link className="font-semibold text-clinical-700" href="/app/scan">
              Mulai yang pertama
            </Link>
            .
          </p>
        ) : (
          <ul className="mt-4 space-y-2.5">
            {recent.map((session) => (
              <li key={session.id}>
                <Link
                  className="flex items-center gap-3 rounded-[1.1rem] bg-slate-50/70 p-3 transition-colors hover:bg-slate-100/80"
                  href={`/app/history/${session.id}`}
                >
                  <IconBadge tone="blue">
                    <Glyph name="scan" />
                  </IconBadge>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800">Sesi Skrining</p>
                    <p className="truncate text-xs text-slate-500">
                      {new Date(session.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                      })}{" "}
                      · {session.total_images} foto
                    </p>
                  </div>
                  <Glyph className="h-4 w-4 shrink-0 text-slate-300" name="arrow" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
