"use client";

import { useEffect, useState } from "react";

import { CameraCapture } from "@/components/camera/CameraCapture";
import { ImageAdjuster } from "@/components/camera/ImageAdjuster";
import { ImageQualityNotice } from "@/components/camera/ImageQualityNotice";
import { DentRayLoading } from "@/components/loading/DentRayLoading";
import { ResultDashboard } from "@/components/result/ResultDashboard";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ImageUpload } from "@/components/upload/ImageUpload";
import { useImageQuality } from "@/hooks/useImageQuality";
import { predictImage } from "@/lib/api";
import { enhanceImageForInference } from "@/lib/image/enhanceImageForInference";
import type { PredictionResponse, ScreeningStatus, SelectedImage } from "@/types/prediction";

type InputMode = "camera" | "upload";

const inputOptions: Array<{
  id: InputMode;
  title: string;
  body: string;
}> = [
  { id: "camera", title: "Kamera Langsung", body: "Ambil foto langsung." },
  { id: "upload", title: "Unggah Foto", body: "Pilih dari galeri." }
];

export function ScreeningExperience() {
  const [mode, setMode] = useState<InputMode>("camera");
  const [pendingImage, setPendingImage] = useState<SelectedImage | null>(null);
  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(null);
  const [status, setStatus] = useState<ScreeningStatus>("idle");
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [error, setError] = useState("");
  const { isCheckingQuality, quality, qualityError } = useImageQuality(
    selectedImage?.file ?? null
  );
  const isQualityBlocked = quality?.ok === false;

  useEffect(() => {
    return () => {
      if (pendingImage?.previewUrl) {
        URL.revokeObjectURL(pendingImage.previewUrl);
      }
    };
  }, [pendingImage?.previewUrl]);

  useEffect(() => {
    return () => {
      if (selectedImage?.previewUrl) {
        URL.revokeObjectURL(selectedImage.previewUrl);
      }
    };
  }, [selectedImage?.previewUrl]);

  const beginAdjustment = (file: File, previewUrl: string, source: InputMode) => {
    if (pendingImage?.previewUrl && pendingImage.previewUrl !== previewUrl) {
      URL.revokeObjectURL(pendingImage.previewUrl);
    }
    if (selectedImage?.previewUrl && selectedImage.previewUrl !== previewUrl) {
      URL.revokeObjectURL(selectedImage.previewUrl);
    }
    setPendingImage({ file, previewUrl, source });
    setSelectedImage(null);
    setStatus("idle");
    setResult(null);
    setError("");
  };

  const confirmAdjustment = (file: File, previewUrl: string) => {
    if (!pendingImage) {
      URL.revokeObjectURL(previewUrl);
      return;
    }
    setSelectedImage({ file, previewUrl, source: pendingImage.source });
    setPendingImage(null);
    setStatus("ready");
    setError("");
  };

  const retakeAdjustment = () => {
    setPendingImage(null);
    setStatus("idle");
    setError("");
  };

  const resetFlow = () => {
    if (pendingImage?.previewUrl) {
      URL.revokeObjectURL(pendingImage.previewUrl);
    }
    if (selectedImage?.previewUrl) {
      URL.revokeObjectURL(selectedImage.previewUrl);
    }
    setPendingImage(null);
    setSelectedImage(null);
    setStatus("idle");
    setResult(null);
    setError("");
  };

  const analyze = async () => {
    if (
      !selectedImage ||
      status === "analyzing" ||
      isCheckingQuality ||
      isQualityBlocked
    ) {
      return;
    }

    setStatus("analyzing");
    setError("");

    try {
      const inferenceFile = await enhanceImageForInference(selectedImage.file);
      const prediction = await predictImage(inferenceFile);
      setResult(prediction);
      setStatus("result");
    } catch (analysisError) {
      setError(analysisError instanceof Error ? analysisError.message : "Analisis gagal. Coba ulangi.");
      setStatus("error");
    }
  };

  const isAnalyzing = status === "analyzing";

  return (
    <section className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-5">
        <Card className="overflow-hidden rounded-[1.9rem] p-0">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <BrandLogo showText size="sm" />
          </div>

          <div className="m-3 rounded-[1.6rem] border border-slate-100 bg-slate-50/80 p-5 sm:m-4 sm:p-7">
            <div className="relative z-10">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-clinical-600">Skrining Visual</p>
              <h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-slate-950 sm:text-4xl">Skrining Gigi</h1>
              <p className="mt-3 text-sm leading-6 text-slate-600">Satu foto yang jelas sudah cukup.</p>

              {!pendingImage && !selectedImage && (
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {inputOptions.map((option) => {
                    const isActive = mode === option.id;
                    return (
                      <button
                        aria-pressed={isActive}
                        className={`rounded-[1.35rem] border p-4 text-left transition ${
                          isActive
                            ? "border-clinical-200 bg-white text-clinical-700 shadow-[0_12px_28px_rgba(37,99,235,0.10)]"
                            : "border-slate-200 bg-white/70 text-slate-600 hover:border-clinical-200 hover:bg-white"
                        }`}
                        key={option.id}
                        onClick={() => {
                          setMode(option.id);
                          setError("");
                        }}
                        type="button"
                      >
                        <span className="text-lg font-bold">{option.title}</span>
                        <span className={`mt-1 block text-sm ${isActive ? "text-clinical-600" : "text-slate-500"}`}>{option.body}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              <p className="mt-5 text-sm leading-6 text-slate-500">Bukan diagnosis klinis.</p>
            </div>
          </div>
        </Card>

        {result ? (
          <ResultDashboard result={result} onReset={resetFlow} />
        ) : (
          <Card className="rounded-[2rem]">
            {pendingImage ? (
              <ImageAdjuster
                imageSrc={pendingImage.previewUrl}
                onConfirm={confirmAdjustment}
                onRetake={retakeAdjustment}
              />
            ) : !selectedImage ? (
              mode === "camera" ? (
                <CameraCapture
                  disabled={isAnalyzing}
                  onPhotoSelected={(file, previewUrl) => beginAdjustment(file, previewUrl, "camera")}
                  onUploadRequested={() => setMode("upload")}
                />
              ) : (
                <ImageUpload disabled={isAnalyzing} onImageSelected={(file, previewUrl) => beginAdjustment(file, previewUrl, "upload")} />
              )
            ) : isAnalyzing ? (
              <DentRayLoading message="Menganalisis foto" variant="scan" />
            ) : (
              <div>
                <div className="grid gap-4 lg:grid-cols-[0.8fr_1fr] lg:items-center">
                  <div className="flex max-h-[34rem] w-full items-center justify-center overflow-hidden rounded-[1.4rem] border border-clinical-100 bg-clinical-50 p-2">
                    <img alt="Foto gigi yang dipilih" className="h-auto max-h-[33rem] w-auto max-w-full object-contain" src={selectedImage.previewUrl} />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-clinical-600">Tinjau Foto</p>
                    <h2 className="mt-2 text-2xl font-bold tracking-[-0.03em] text-slate-950">Foto Siap Dianalisis</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-600">Pastikan gigi terlihat jelas.</p>
                    <ImageQualityNotice
                      error={qualityError}
                      isChecking={isCheckingQuality}
                      quality={quality}
                    />
                    {error && <p className="mt-4 rounded-2xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
                    <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                      <Button
                        disabled={isAnalyzing || isCheckingQuality || isQualityBlocked}
                        onClick={analyze}
                        type="button"
                      >
                        Mulai Analisis
                      </Button>
                      <Button disabled={isAnalyzing} onClick={resetFlow} type="button" variant="secondary">
                        Ganti Foto
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!selectedImage && error && <p className="mt-4 rounded-2xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          </Card>
        )}
      </div>
    </section>
  );
}
