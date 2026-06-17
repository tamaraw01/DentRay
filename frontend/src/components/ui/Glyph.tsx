type GlyphName =
  | "scan"
  | "history"
  | "info"
  | "profile"
  | "calendar"
  | "photo"
  | "shield"
  | "spark"
  | "arrow";

const paths: Record<GlyphName, React.ReactNode> = {
  scan: (
    <>
      <path d="M5 8V5h3M16 5h3v3M19 16v3h-3M8 19H5v-3" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
      <path d="M7 12h10" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
    </>
  ),
  history: (
    <>
      <path d="M12 7v5l3 2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
      <path d="M5 12a7 7 0 1 0 2-5" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
      <path d="M5 5v4h4" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2" />
      <path d="M12 11v5M12 8h.01" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
    </>
  ),
  profile: (
    <>
      <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" stroke="currentColor" strokeWidth="2" />
      <path d="M5 20a7 7 0 0 1 14 0" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
    </>
  ),
  calendar: (
    <>
      <rect height="14" rx="2" stroke="currentColor" strokeWidth="2" width="16" x="4" y="4" />
      <path d="M8 2v2M16 2v2M4 9h16" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
    </>
  ),
  photo: (
    <>
      <rect height="14" rx="2" stroke="currentColor" strokeWidth="2" width="18" x="3" y="5" />
      <circle cx="8.5" cy="10" r="1.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="m4 18 5-5 4 4 3-3 4 4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3 5 6v5c0 4 3 7 7 9 4-2 7-5 7-9V6l-7-3Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="2" />
      <path d="m9.5 12 1.8 1.8L15 10" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </>
  ),
  spark: (
    <path
      d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="2"
    />
  ),
  arrow: <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
};

export function Glyph({ name, className }: { name: GlyphName; className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      {paths[name]}
    </svg>
  );
}
