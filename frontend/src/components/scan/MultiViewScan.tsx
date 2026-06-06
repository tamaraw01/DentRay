"use client";

import { useEffect, useState } from "react";

import { useDentRayUser } from "@/components/app/AppShell";
import { CameraCapture } from "@/components/camera/CameraCapture";
import { ResultDashboard } from "@/components/result/ResultDashboard";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ImageUpload } from "@/components/upload/ImageUpload";
import { predictImage } from "@/lib/api";
import { saveScanSession } from "@/lib/scan-storage";
import type { PredictionResponse, SelectedImage } from "@/types/prediction";
import type { ScanResultItem, ScanView, ScanViewType } from "@/types/scan";

type InputMode = "camera" | "upload";

const inputOptions: Array<{
  id: InputMode;
  title: string;
  body: string;
}> = [
  { id: "camera", title: "Kamera", body: "Ambil foto langsung." },
  { id: "upload", title: "Upload", body: "Pilih dari galeri." }
];

const scanViews: ScanView[] = [
  { id: "front", title: "Depan", instruction: "Tampak depan." },
  { id: "left", title: "Kiri", instruction: "Sudut kiri." },
  { id: "right", title: "Kanan", instruction: "Sudut kanan." },
  { id: "upper", title: "Atas", instruction: "Bagian atas." },
  { id: "lower", title: "Bawah", instruction: "Bagian bawah." }
];

export function MultiViewScan() {
  const user = useDentRayUser();
  const [mode, setMode] = useState<InputMode>("camera");
  const [activeView, setActiveView] = useState<ScanViewType>("front");
  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(null);
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      if (selectedImage?.previewUrl) {
        URL.revokeObjectURL(selectedImage.previewUrl);
      }
    };
  }, [selectedImage?.previewUrl]);

  function chooseImage(file: File, previewUrl: string, source: InputMode) {
    if (selectedImage?.previewUrl && selectedImage.previewUrl !== previewUrl) {
      URL.revokeObjectURL(selectedImage.previewUrl);
    }
    setSelectedImage({ file, previewUrl, source });
    setResult(null);
    setProgress("");
    setError("");
  }

  function resetFlow() {
    if (selectedImage?.previewUrl) {
      URL.revokeObjectURL(selectedImage.previewUrl);
    }
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
    setProgress("DentRay sedang membaca gambar…");

    try {
      const prediction = await predictImage(selectedImage.file);
      const currentView = scanViews.find((view) => view.id === activeView) ?? scanViews[0];
      const scanResult: ScanResultItem = {
        viewType: currentView.id,
        title: currentView.title,
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
      <Card className="overflow-hidden rounded-[1.9rem] p-0">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <p className="text-base font-bold text-slate-950">Scan gigi</p>
          <span className="rounded-full border border-clinical-100 bg-clinical-50 px-3 py-1 text-xs font-bold text-clinical-700">AI</span>
        </div>

        <div className="m-3 rounded-[1.6rem] border border-slate-100 bg-slate-50/80 p-5 sm:m-4 sm:p-7">
          <div className="relative z-10">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-clinical-600">Skrining awal</p>
              <h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-slate-950 sm:text-4xl">Ambil foto dari beberapa sisi.</h1>
              <p className="mt-3 text-sm leading-6 text-slate-600">Posisikan gigi di dalam frame.</p>

              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
                {scanViews.map((view) => {
                  const isActive = activeView === view.id;
                  return (
                    <button
                      aria-pressed={isActive}
                      className={`rounded-[1.2rem] border p-3 text-left transition ${
                        isActive
                          ? "border-clinical-200 bg-white text-clinical-700 shadow-[0_12px_28px_rgba(37,99,235,0.10)]"
                          : "border-slate-200 bg-white/70 text-slate-600 hover:border-clinical-200 hover:bg-white"
                      }`}
                      key={view.id}
                      onClick={() => {
                        setActiveView(view.id);
                        setError("");
                      }}
                      type="button"
                    >
                      <span className="block text-sm font-extrabold">{view.title}</span>
                      <span className={`mt-1 block text-xs leading-5 ${isActive ? "text-clinical-600" : "text-slate-500"}`}>{view.instruction}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {!result && (
        <Card className="rounded-[1.9rem]">
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
            <CameraCapture disabled={isAnalyzing} onPhotoSelected={(file, previewUrl) => chooseImage(file, previewUrl, "camera")} />
          ) : (
            <ImageUpload disabled={isAnalyzing} onImageSelected={(file, previewUrl) => chooseImage(file, previewUrl, "upload")} />
          )}

          {selectedImage && (
            <div className="mt-5 border-t border-slate-100 pt-5">
              <div className="grid gap-4 lg:grid-cols-[0.8fr_1fr] lg:items-center">
                <div className="aspect-[3/2] w-full overflow-hidden rounded-[1.4rem] border border-clinical-100 bg-clinical-50">
                  <img alt="Preview foto" className="h-full w-full object-contain" src={selectedImage.previewUrl} />
                </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-clinical-600">Periksa foto</p>
                    <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950">Foto siap</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-600">Pastikan foto terlihat jelas.</p>
                    {error && <p className="mt-4 rounded-2xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
                    {progress && <p className="mt-4 rounded-2xl bg-clinical-50 p-3 text-sm font-semibold text-clinical-800">{progress}</p>}
                  <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                    <Button disabled={isAnalyzing} onClick={analyze} type="button">
                      {isAnalyzing ? "Membaca gambar…" : "Analisis"}
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

      {result && (
        <ResultDashboard result={result} onReset={resetFlow} />
      )}
    </div>
  );
}
