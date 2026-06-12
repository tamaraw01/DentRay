"use client";

import { useCallback, useState } from "react";
import Cropper, { type Area, type MediaSize } from "react-easy-crop";

import { Button } from "@/components/ui/Button";
import { createCroppedImage } from "@/lib/image";

type ImageAdjusterProps = {
  aspectRatio?: number;
  imageSrc: string;
  onConfirm: (file: File, previewUrl: string) => void;
  onRetake: () => void;
};

const initialCrop = { x: 0, y: 0 };

export function ImageAdjuster({ aspectRatio, imageSrc, onConfirm, onRetake }: ImageAdjusterProps) {
  const [crop, setCrop] = useState(initialCrop);
  const [zoom, setZoom] = useState(1);
  const [sourceAspectRatio, setSourceAspectRatio] = useState(4 / 3);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const activeAspectRatio = aspectRatio ?? sourceAspectRatio;

  const handleCropComplete = useCallback((_croppedArea: Area, nextCroppedAreaPixels: Area) => {
    setCroppedAreaPixels(nextCroppedAreaPixels);
  }, []);

  const handleMediaLoaded = useCallback((mediaSize: MediaSize) => {
    if (mediaSize.naturalWidth > 0 && mediaSize.naturalHeight > 0) {
      setSourceAspectRatio(mediaSize.naturalWidth / mediaSize.naturalHeight);
    }
  }, []);

  function resetAdjustment() {
    setCrop(initialCrop);
    setZoom(1);
    setError("");
  }

  async function confirmAdjustment() {
    if (!croppedAreaPixels || isProcessing) {
      return;
    }

    setIsProcessing(true);
    setError("");

    try {
      const file = await createCroppedImage(
        imageSrc,
        croppedAreaPixels,
        0,
        `dentray-adjusted-${Date.now()}.jpg`
      );
      onConfirm(file, URL.createObjectURL(file));
    } catch (adjustmentError) {
      setError(adjustmentError instanceof Error ? adjustmentError.message : "Foto tidak dapat disesuaikan.");
      setIsProcessing(false);
    }
  }

  return (
    <section aria-labelledby="image-adjuster-title" className="space-y-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-clinical-600">Periksa citra</p>
        <h2 className="mt-2 text-2xl font-bold tracking-[-0.03em] text-slate-950" id="image-adjuster-title">
          Sesuaikan foto
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">Pastikan gigi terlihat jelas.</p>
      </div>

      <div
        className="relative mx-auto w-full max-w-xl overflow-hidden rounded-[1.65rem] border border-slate-200 bg-slate-950 shadow-[0_18px_42px_rgba(15,23,42,0.12)]"
        style={{ aspectRatio: activeAspectRatio }}
      >
        <Cropper
          aspect={activeAspectRatio}
          crop={crop}
          image={imageSrc}
          maxZoom={3}
          minZoom={1}
          onCropChange={setCrop}
          onCropComplete={handleCropComplete}
          onMediaLoaded={handleMediaLoaded}
          onZoomChange={setZoom}
          showGrid={false}
          zoom={zoom}
          zoomWithScroll
        />
        <div className="pointer-events-none absolute inset-3 rounded-[1.25rem] border border-white/75 shadow-[inset_0_0_0_1px_rgba(37,99,235,0.25)]" />
      </div>

      <div className="rounded-[1.4rem] border border-slate-200/80 bg-slate-50/80 p-4">
        <label className="grid gap-2 text-sm font-bold text-slate-700">
          <span>Perbesar</span>
          <input
            aria-label="Perbesar foto"
            className="h-2 w-full cursor-pointer accent-clinical-600"
            max="3"
            min="1"
            onChange={(event) => setZoom(Number(event.target.value))}
            step="0.01"
            type="range"
            value={zoom}
          />
        </label>
      </div>

      {error && <p className="rounded-2xl bg-red-50 p-3 text-sm leading-6 text-red-700">{error}</p>}

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Button disabled={isProcessing || !croppedAreaPixels} onClick={() => void confirmAdjustment()} type="button">
          {isProcessing ? "Menyiapkan foto..." : "Gunakan foto"}
        </Button>
        <Button disabled={isProcessing} onClick={resetAdjustment} type="button" variant="secondary">
          Reset
        </Button>
        <Button disabled={isProcessing} onClick={onRetake} type="button" variant="ghost">
          Ambil ulang
        </Button>
      </div>
    </section>
  );
}
