"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/Button";

type CameraCaptureProps = {
  disabled?: boolean;
  onPhotoSelected: (file: File, previewUrl: string) => void;
};

type CameraState = "idle" | "starting" | "ready" | "error";
type FacingMode = "user" | "environment";

function cameraErrorMessage(error: unknown) {
  if (error instanceof DOMException) {
    if (error.name === "NotAllowedError") {
      return "Izin kamera ditolak. Aktifkan izin kamera browser atau gunakan upload gambar.";
    }
    if (error.name === "NotFoundError") {
      return "Kamera tidak ditemukan pada perangkat ini. Gunakan upload gambar sebagai alternatif.";
    }
    if (error.name === "NotReadableError") {
      return "Kamera sedang dipakai aplikasi lain. Tutup aplikasi tersebut lalu coba lagi.";
    }
  }

  if (typeof window !== "undefined" && !window.isSecureContext && window.location.hostname !== "localhost") {
    return "Kamera browser membutuhkan HTTPS. Gunakan deployment HTTPS atau localhost saat pengembangan.";
  }

  return "Kamera belum dapat dibuka. Coba ulangi atau gunakan upload gambar.";
}

export function CameraCapture({ disabled = false, onPhotoSelected }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const facingModeRef = useRef<FacingMode>("user");
  const [state, setState] = useState<CameraState>("idle");
  const [error, setError] = useState("");
  const [facingMode, setFacingMode] = useState<FacingMode>("user");
  const [cameraCount, setCameraCount] = useState(1);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const startCamera = useCallback(async (requestedMode: FacingMode = facingModeRef.current) => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Browser belum mendukung kamera langsung. Gunakan upload gambar.");
      setState("error");
      return;
    }

    setState("starting");
    setError("");

    try {
      stopCamera();
      const openCamera = (mode: FacingMode) =>
        navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: mode },
            width: { ideal: 1280 },
            height: { ideal: 960 }
          },
          audio: false
        });

      let activeMode = requestedMode;
      let stream: MediaStream;

      try {
        stream = await openCamera(requestedMode);
      } catch (initialError) {
        const canFallback =
          requestedMode === "user" &&
          initialError instanceof DOMException &&
          ["NotFoundError", "OverconstrainedError"].includes(initialError.name);

        if (!canFallback) {
          throw initialError;
        }

        activeMode = "environment";
        stream = await openCamera(activeMode);
      }

      streamRef.current = stream;
      const reportedMode = stream.getVideoTracks()[0]?.getSettings().facingMode;
      if (reportedMode === "user" || reportedMode === "environment") {
        activeMode = reportedMode;
      }
      facingModeRef.current = activeMode;
      setFacingMode(activeMode);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        setCameraCount(devices.filter((device) => device.kind === "videoinput").length);
      } catch {
        setCameraCount(1);
      }

      setState("ready");
    } catch (cameraError) {
      setError(cameraErrorMessage(cameraError));
      setState("error");
    }
  }, [stopCamera]);

  useEffect(() => {
    // Camera startup synchronizes this component with the browser media API.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void startCamera();
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas || video.videoWidth === 0 || video.videoHeight === 0) {
      setError("Preview kamera belum siap. Tunggu sebentar lalu coba lagi.");
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    if (!context) {
      setError("Browser tidak dapat memproses gambar kamera.");
      return;
    }

    context.save();
    if (facingModeRef.current === "user") {
      context.translate(canvas.width, 0);
      context.scale(-1, 1);
    }
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    context.restore();
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setError("Foto tidak berhasil dibuat. Coba ambil ulang.");
          return;
        }
        const file = new File([blob], `dentray-camera-${Date.now()}.jpg`, { type: "image/jpeg" });
        const previewUrl = URL.createObjectURL(blob);
        stopCamera();
        onPhotoSelected(file, previewUrl);
      },
      "image/jpeg",
      0.92
    );
  };

  const switchCamera = () => {
    const nextMode: FacingMode = facingModeRef.current === "user" ? "environment" : "user";
    facingModeRef.current = nextMode;
    setFacingMode(nextMode);
    setError("");
    void startCamera(nextMode);
  };

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-[1.65rem] border border-slate-200 bg-slate-100 shadow-[0_16px_38px_rgba(15,23,42,0.06)]">
        <div className="relative aspect-[3/2]">
          <video
            aria-label="Live camera preview"
            className={`h-full w-full object-cover ${facingMode === "user" ? "scale-x-[-1]" : ""}`}
            muted
            playsInline
            ref={videoRef}
          />
          {state === "ready" && (
            <button
              aria-label="Ganti kamera"
              className="absolute right-4 top-4 rounded-full border border-white/80 bg-white/85 px-3 py-2 text-xs font-bold text-slate-700 shadow-sm backdrop-blur transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clinical-500"
              onClick={switchCamera}
              title={cameraCount > 1 ? "Ganti kamera" : "Coba kamera lain"}
              type="button"
            >
              Ganti kamera
            </button>
          )}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-[54%] w-[76%] rounded-[1.8rem] border border-white shadow-[0_0_0_999px_rgba(15,23,42,0.12),0_0_28px_rgba(96,165,250,0.20)]" />
          </div>
          <div className="pointer-events-none absolute inset-x-8 top-1/2 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent" />
          <p className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full border border-white/80 bg-white/82 px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm backdrop-blur">
            Letakkan gigi di dalam frame.
          </p>
          {state === "starting" && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 text-sm font-semibold text-slate-700 backdrop-blur">
              Membuka kamera...
            </div>
          )}
        </div>
      </div>

      {error && <p className="rounded-2xl bg-red-50 p-3 text-sm leading-6 text-red-700">{error}</p>}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button disabled={disabled || state !== "ready"} onClick={capturePhoto} type="button">
          Ambil foto
        </Button>
        <Button disabled={disabled || state === "starting"} onClick={() => void startCamera()} type="button" variant="secondary">
          Buka kamera
        </Button>
      </div>
      <canvas className="hidden" ref={canvasRef} />
    </div>
  );
}
