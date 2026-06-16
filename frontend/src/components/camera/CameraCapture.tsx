"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/Button";
import { useDeviceOrientation } from "@/hooks/useDeviceOrientation";
import { cn } from "@/lib/utils";

type CameraCaptureProps = {
  disabled?: boolean;
  onPhotoSelected: (file: File, previewUrl: string) => void;
  onUploadRequested?: () => void;
};

type CameraState = "idle" | "starting" | "ready" | "error";
type FacingMode = "user" | "environment";

const MAX_CAPTURE_SIDE = 1920;
const CAPTURE_QUALITY = 0.94;

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}

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

function cameraConstraints(mode: FacingMode, highResolution = true): MediaTrackConstraints {
  if (!highResolution) {
    return { facingMode: { ideal: mode } };
  }

  return mode === "environment"
    ? {
        facingMode: { ideal: "environment" },
        frameRate: { ideal: 30 },
        height: { ideal: 1080 },
        width: { ideal: 1920 }
      }
    : {
        facingMode: { ideal: "user" },
        frameRate: { ideal: 30 },
        height: { ideal: 720 },
        width: { ideal: 1280 }
      };
}

export function CameraCapture({ disabled = false, onPhotoSelected, onUploadRequested }: CameraCaptureProps) {
  const { isPortrait } = useDeviceOrientation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);
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
      const openCamera = async (mode: FacingMode) => {
        try {
          return await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: cameraConstraints(mode)
          });
        } catch (constraintError) {
          if (
            constraintError instanceof DOMException &&
            constraintError.name === "OverconstrainedError"
          ) {
            return navigator.mediaDevices.getUserMedia({
              audio: false,
              video: cameraConstraints(mode, false)
            });
          }
          throw constraintError;
        }
      };

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
    const frame = frameRef.current;
    const previewContainer = previewContainerRef.current;

    if (
      !video ||
      !canvas ||
      !frame ||
      !previewContainer ||
      video.videoWidth === 0 ||
      video.videoHeight === 0
    ) {
      setError("Preview kamera belum siap. Tunggu sebentar lalu coba lagi.");
      return;
    }

    const previewRect = previewContainer.getBoundingClientRect();
    const frameRect = frame.getBoundingClientRect();
    const frameLeft = Math.max(frameRect.left, previewRect.left);
    const frameTop = Math.max(frameRect.top, previewRect.top);
    const frameRight = Math.min(frameRect.right, previewRect.right);
    const frameBottom = Math.min(frameRect.bottom, previewRect.bottom);
    const frameWidth = frameRight - frameLeft;
    const frameHeight = frameBottom - frameTop;

    if (previewRect.width <= 0 || previewRect.height <= 0 || frameWidth <= 0 || frameHeight <= 0) {
      setError("Area frame belum siap. Coba ambil foto kembali.");
      return;
    }

    const videoAspect = video.videoWidth / video.videoHeight;
    const previewAspect = previewRect.width / previewRect.height;
    let displayedWidth = previewRect.width;
    let displayedHeight = previewRect.height;
    let offsetX = 0;
    let offsetY = 0;

    if (videoAspect > previewAspect) {
      displayedWidth = previewRect.height * videoAspect;
      offsetX = (previewRect.width - displayedWidth) / 2;
    } else {
      displayedHeight = previewRect.width / videoAspect;
      offsetY = (previewRect.height - displayedHeight) / 2;
    }

    const frameXInDisplayedVideo = frameLeft - previewRect.left - offsetX;
    const frameYInDisplayedVideo = frameTop - previewRect.top - offsetY;
    const sourceScaleX = video.videoWidth / displayedWidth;
    const sourceScaleY = video.videoHeight / displayedHeight;
    const sourceWidth = Math.min(video.videoWidth, frameWidth * sourceScaleX);
    const sourceHeight = Math.min(video.videoHeight, frameHeight * sourceScaleY);
    const visibleSourceX = frameXInDisplayedVideo * sourceScaleX;
    const sourceY = clamp(
      frameYInDisplayedVideo * sourceScaleY,
      0,
      Math.max(0, video.videoHeight - sourceHeight)
    );
    const sourceX =
      facingModeRef.current === "user"
        ? clamp(
            video.videoWidth - visibleSourceX - sourceWidth,
            0,
            Math.max(0, video.videoWidth - sourceWidth)
          )
        : clamp(visibleSourceX, 0, Math.max(0, video.videoWidth - sourceWidth));

    const outputScale = Math.min(
      1,
      MAX_CAPTURE_SIDE / Math.max(sourceWidth, sourceHeight)
    );
    canvas.width = Math.max(1, Math.round(sourceWidth * outputScale));
    canvas.height = Math.max(1, Math.round(sourceHeight * outputScale));
    const context = canvas.getContext("2d");
    if (!context) {
      setError("Browser tidak dapat memproses gambar kamera.");
      return;
    }

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.save();
    if (facingModeRef.current === "user") {
      context.translate(canvas.width, 0);
      context.scale(-1, 1);
    }
    context.drawImage(
      video,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      canvas.width,
      canvas.height
    );
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
      CAPTURE_QUALITY
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
      <div>
        <h2 className="text-xl font-bold tracking-[-0.025em] text-slate-950">Ambil Foto Gigi</h2>
        <p className="mt-1 text-sm text-slate-600">Posisikan gigi di dalam frame.</p>
      </div>
      <div className="overflow-hidden rounded-[1.65rem] border border-slate-200 bg-slate-100 shadow-[0_14px_34px_rgba(15,23,42,0.05)]">
        <div
          className={cn(
            "relative w-full",
            isPortrait ? "aspect-[3/4]" : "aspect-[16/9] max-h-[72svh]"
          )}
          ref={previewContainerRef}
        >
          <video
            aria-label="Live camera preview"
            className={`h-full w-full object-cover ${facingMode === "user" ? "scale-x-[-1]" : ""}`}
            muted
            playsInline
            ref={videoRef}
          />
          {state === "ready" && (
            <button
              aria-label="Kamera Lain"
              className="absolute right-3 top-3 rounded-full border border-white/80 bg-white/95 px-3 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clinical-500"
              onClick={switchCamera}
              title={cameraCount > 1 ? "Kamera Lain" : "Coba Kamera Lain"}
              type="button"
            >
              Kamera Lain
            </button>
          )}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div
              className={cn(
                "aspect-[3/2] rounded-[2rem] border-2 border-white/85 shadow-[0_0_0_999px_rgba(15,23,42,0.13),0_2px_12px_rgba(15,23,42,0.16)]",
                isPortrait ? "w-[84%]" : "w-[68%] max-w-[72svh]"
              )}
              ref={frameRef}
            />
          </div>
          {state === "starting" && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/90 text-sm font-semibold text-slate-700">
              Membuka kamera...
            </div>
          )}
        </div>
      </div>
      <p className="text-sm text-slate-500">Gunakan cahaya yang cukup.</p>

      {error && <p className="rounded-2xl bg-red-50 p-3 text-sm leading-6 text-red-700">{error}</p>}

      <div className="grid gap-3 sm:grid-cols-3">
        <Button disabled={disabled || state !== "ready"} onClick={capturePhoto} type="button">
          Ambil Foto
        </Button>
        <Button disabled={disabled || state === "starting"} onClick={switchCamera} type="button" variant="secondary">
          Kamera Lain
        </Button>
        {onUploadRequested && (
          <Button disabled={disabled} onClick={onUploadRequested} type="button" variant="ghost">
            Unggah Foto
          </Button>
        )}
      </div>
      <canvas className="hidden" ref={canvasRef} />
    </div>
  );
}
