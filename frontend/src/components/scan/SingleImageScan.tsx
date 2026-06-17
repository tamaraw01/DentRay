"use client";

import { useEffect, useState } from "react";

import { useDentRayUser } from "@/components/app/AppShell";
import { CameraCapture } from "@/components/camera/CameraCapture";
import { ImageAdjuster } from "@/components/camera/ImageAdjuster";
import { ImageQualityNotice } from "@/components/camera/ImageQualityNotice";
import { DentRayLoading } from "@/components/loading/DentRayLoading";
import { ResultDashboard } from "@/components/result/ResultDashboard";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Glyph } from "@/components/ui/Glyph";
import { IconBadge } from "@/components/ui/IconBadge";
import { ImageUpload } from "@/components/upload/ImageUpload";
import { useImageQuality } from "@/hooks/useImageQuality";
import { predictImage } from "@/lib/api";
import { enhanceImageForInference } from "@/lib/image/enhanceImageForInference";
import { saveScanSession } from "@/lib/scan-storage";
import type { PredictionResponse, SelectedImage } from "@/types/prediction";
import type { ScanResultItem } from "@/types/scan";

type InputMode = "camera" | "upload";

const inputOptions: Array<{
  id: InputMode;
  title: string;
  body: string;
}> = [
  { id: "camera", title: "Kamera", body: "Ambil foto langsung." },
  { id: "upload", title: "Unggah Foto", body: "Pilih dari galeri." }
];

export function SingleImageScan() {
  const user = useDentRayUser();
  const [mode, setMode] = useState<InputMode>("camera");
  const [pendingImage, setPendingImage] = useState<SelectedImage | null>(null);
  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(null);
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState("");
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

  function beginAdjustment(file: File, previewUrl: string, source: InputMode) {
    if (pendingImage?.previewUrl && pendingImage.previewUrl !== previewUrl) {
      URL.revokeObjectURL(pendingImage.previewUrl);
    }
    if (selectedImage?.previewUrl && selectedImage.previewUrl !== previewUrl) {
      URL.revokeObjectURL(selectedImage.previewUrl);
    }
    setPendingImage({ file, previewUrl, source });
    setSelectedImage(null);
    setResult(null);
    setProgress("");
    setError("");
  }

  function confirmAdjustment(file: File, previewUrl: string) {
    if (!pendingImage) {
      URL.revokeObjectURL(previewUrl);
      return;
    }
    setSelectedImage({ file, previewUrl, source: pendingImage.source });
    setPendingImage(null);
    setError("");
  }

  function retakeAdjustment() {
    setPendingImage(null);
    setError("");
  }

  function resetFlow() {
    if (pendingImage?.previewUrl) {
      URL.revokeObjectURL(pendingImage.previewUrl);
    }
    if (selectedImage?.previewUrl) {
      URL.revokeObjectURL(selectedImage.previewUrl);
    }
    setPendingImage(null);
    setSelectedImage(null);
    setResult(null);
    setProgress("");
    setError("");
  }

  async function analyze() {
    if (!selectedImage || isAnalyzing || isCheckingQuality || isQualityBlocked) {
      return;
    }

    setIsAnalyzing(true);
    setError("");
    setProgress("");

    try {
      const inferenceFile = await enhanceImageForInference(selectedImage.file);
      const prediction = await predictImage(inferenceFile);
      const scanResult: ScanResultItem = {
        viewType: "single",
        title: "Citra",
        result: prediction
      };
      setResult(prediction);
      await saveScanSession(user, [scanResult]);
      setProgress("Riwayat tersimpan");
    } catch (scanError) {
      setError(scanError instanceof Error ? scanError.message : "Analisis gagal. Coba ulangi.");
      setProgress("");
    } finally {
      setIsAnalyzing(false);
    }
  }

  return (
    <div className="space-y-5">
      <header className="flex items-center justify-between gap-4 px-1">
        <div>
          <h1 className="text-2xl font-bold tracking-[-0.03em] text-slate-950 sm:text-[1.7rem]">Skrining Gigi</h1>
          <p className="mt-1 text-sm text-slate-500">Satu foto yang jelas sudah cukup.</p>
        </div>
        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-clinical-700">AI</span>
      </header>

      {!result && (
        <Card className="rounded-[1.75rem]">
          {pendingImage ? (
            <ImageAdjuster
              imageSrc={pendingImage.previewUrl}
              onConfirm={confirmAdjustment}
              onRetake={retakeAdjustment}
            />
          ) : !selectedImage ? (
            <>
              <div className="mb-5 grid gap-3 sm:grid-cols-2">
                {inputOptions.map((option) => {
                  const isActive = mode === option.id;
                  return (
                    <button
                      aria-pressed={isActive}
                      className={`flex items-center gap-3 rounded-[1.25rem] p-4 text-left transition-all ${
                        isActive
                          ? "bg-blue-50/70 text-slate-950 ring-2 ring-clinical-500/60"
                          : "bg-slate-50 text-slate-600 hover:bg-slate-100/80"
                      }`}
                      key={option.id}
                      onClick={() => {
                        setMode(option.id);
                        setError("");
                      }}
                      type="button"
                    >
                      <IconBadge tone={option.id === "camera" ? "blue" : "green"}>
                        <Glyph name={option.id === "camera" ? "scan" : "photo"} />
                      </IconBadge>
                      <span className="min-w-0">
                        <span className="block text-sm font-bold">{option.title}</span>
                        <span className="mt-0.5 block text-xs leading-5 text-slate-500">{option.body}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
              {mode === "camera" ? (
                <CameraCapture
                  disabled={isAnalyzing}
                  onPhotoSelected={(file, previewUrl) => beginAdjustment(file, previewUrl, "camera")}
                  onUploadRequested={() => setMode("upload")}
                />
              ) : (
                <ImageUpload disabled={isAnalyzing} onImageSelected={(file, previewUrl) => beginAdjustment(file, previewUrl, "upload")} />
              )}
            </>
          ) : isAnalyzing ? (
            <DentRayLoading message="Menganalisis foto" variant="scan" />
          ) : (
            <div>
              <div className="grid gap-4 lg:grid-cols-[0.8fr_1fr] lg:items-center">
                <div className="flex max-h-[34rem] w-full items-center justify-center overflow-hidden rounded-[1.4rem] border border-clinical-100 bg-clinical-50 p-2">
                  <img alt="Citra gigi yang dipilih" className="h-auto max-h-[33rem] w-auto max-w-full object-contain" src={selectedImage.previewUrl} />
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
                  {progress && <p className="mt-4 rounded-2xl bg-clinical-50 p-3 text-sm font-semibold text-clinical-800">{progress}</p>}
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

      {result && <ResultDashboard result={result} onReset={resetFlow} />}
    </div>
  );
}
