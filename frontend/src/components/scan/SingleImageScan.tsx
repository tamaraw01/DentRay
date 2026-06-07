"use client";

import { useEffect, useState } from "react";

import { useDentRayUser } from "@/components/app/AppShell";
import { CameraCapture } from "@/components/camera/CameraCapture";
import { ImageAdjuster } from "@/components/camera/ImageAdjuster";
import { ResultDashboard } from "@/components/result/ResultDashboard";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ImageUpload } from "@/components/upload/ImageUpload";
import { predictImage } from "@/lib/api";
import { saveScanSession } from "@/lib/scan-storage";
import type { PredictionResponse, SelectedImage } from "@/types/prediction";
import type { ScanResultItem } from "@/types/scan";

type InputMode = "camera" | "upload";

const inputOptions: Array<{
  id: InputMode;
  title: string;
  body: string;
}> = [
  { id: "camera", title: "Kamera", body: "Ambil citra langsung." },
  { id: "upload", title: "Upload", body: "Pilih citra dari galeri." }
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
    if (!selectedImage || isAnalyzing) {
      return;
    }

    setIsAnalyzing(true);
    setError("");
    setProgress("DentRay sedang membaca citra...");

    try {
      const prediction = await predictImage(selectedImage.file);
      const scanResult: ScanResultItem = {
        viewType: "single",
        title: "Citra",
        result: prediction
      };
      setResult(prediction);
      await saveScanSession(user, [scanResult]);
      setProgress("Hasil tersimpan");
    } catch (scanError) {
      setError(scanError instanceof Error ? scanError.message : "Analisis gagal. Coba ulangi.");
      setProgress("");
    } finally {
      setIsAnalyzing(false);
    }
  }

  return (
    <div className="space-y-5">
      <Card className="overflow-hidden rounded-[1.9rem] p-5 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-clinical-600">Riksa awal</p>
            <h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-slate-950 sm:text-4xl">Scan gigi</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">Cukup satu foto yang jelas.</p>
          </div>
          <span className="rounded-full border border-clinical-100 bg-clinical-50 px-3 py-1 text-xs font-bold text-clinical-700">AI</span>
        </div>
      </Card>

      {!result && (
        <Card className="rounded-[1.9rem]">
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
                      className={`rounded-[1.35rem] border p-4 text-left transition hover:-translate-y-0.5 ${
                        isActive
                          ? "border-clinical-200 bg-white text-slate-950 shadow-[0_12px_30px_rgba(37,99,235,0.10)]"
                          : "border-slate-200 bg-slate-50/80 text-slate-600 hover:bg-white"
                      }`}
                      key={option.id}
                      onClick={() => {
                        setMode(option.id);
                        setError("");
                      }}
                      type="button"
                    >
                      <span className="text-base font-extrabold">{option.title}</span>
                      <span className="mt-1 block text-sm leading-6">{option.body}</span>
                    </button>
                  );
                })}
              </div>
              {mode === "camera" ? (
                <CameraCapture disabled={isAnalyzing} onPhotoSelected={(file, previewUrl) => beginAdjustment(file, previewUrl, "camera")} />
              ) : (
                <ImageUpload disabled={isAnalyzing} onImageSelected={(file, previewUrl) => beginAdjustment(file, previewUrl, "upload")} />
              )}
            </>
          ) : (
            <div>
              <div className="grid gap-4 lg:grid-cols-[0.8fr_1fr] lg:items-center">
                <div className="aspect-[3/2] w-full overflow-hidden rounded-[1.4rem] border border-clinical-100 bg-clinical-50">
                  <img alt="Citra gigi yang dipilih" className="h-full w-full object-contain" src={selectedImage.previewUrl} />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-clinical-600">Periksa citra</p>
                  <h2 className="mt-2 text-2xl font-bold tracking-[-0.03em] text-slate-950">Citra siap</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">Pastikan gigi terlihat jelas.</p>
                  {error && <p className="mt-4 rounded-2xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
                  {progress && <p className="mt-4 rounded-2xl bg-clinical-50 p-3 text-sm font-semibold text-clinical-800">{progress}</p>}
                  <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                    <Button disabled={isAnalyzing} onClick={analyze} type="button">
                      {isAnalyzing ? "Membaca citra..." : "Analisis"}
                    </Button>
                    <Button disabled={isAnalyzing} onClick={resetFlow} type="button" variant="secondary">
                      Ambil ulang
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
