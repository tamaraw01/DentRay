import type { ImageQualityResult } from "@/types/image-quality";

type ImageQualityNoticeProps = {
  error?: string;
  isChecking: boolean;
  quality: ImageQualityResult | null;
};

export function ImageQualityNotice({
  error,
  isChecking,
  quality
}: ImageQualityNoticeProps) {
  if (isChecking) {
    return (
      <p
        className="mt-4 rounded-2xl border border-clinical-100 bg-clinical-50 px-3.5 py-3 text-sm text-clinical-800"
        role="status"
      >
        Memeriksa kualitas foto...
      </p>
    );
  }

  if (error) {
    return (
      <p
        className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-sm text-amber-900"
        role="status"
      >
        {error}
      </p>
    );
  }

  if (!quality?.message) {
    return null;
  }

  return (
    <div
      className={`mt-4 rounded-2xl border px-3.5 py-3 text-sm leading-6 ${
        quality.ok
          ? "border-amber-200 bg-amber-50 text-amber-950"
          : "border-red-200 bg-red-50 text-red-800"
      }`}
      role={quality.ok ? "status" : "alert"}
    >
      <p className="font-semibold">{quality.message}</p>
      {quality.ok && <p className="mt-0.5 opacity-75">Foto masih dapat dianalisis.</p>}
    </div>
  );
}
