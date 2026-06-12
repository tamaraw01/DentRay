const INFERENCE_IMAGE_MAX_SIDE = 512;
const INFERENCE_IMAGE_QUALITY = 0.9;

function loadImage(source: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Citra tidak dapat diproses."));
    image.src = source;
  });
}

function canvasToJpeg(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
          return;
        }
        reject(new Error("Citra tidak dapat disiapkan untuk analisis."));
      },
      "image/jpeg",
      INFERENCE_IMAGE_QUALITY
    );
  });
}

export async function prepareImageForInference(fileOrBlob: File | Blob): Promise<File> {
  const objectUrl = URL.createObjectURL(fileOrBlob);

  try {
    const image = await loadImage(objectUrl);
    const scale = Math.min(
      1,
      INFERENCE_IMAGE_MAX_SIDE / Math.max(image.naturalWidth, image.naturalHeight)
    );
    const targetWidth = Math.max(1, Math.round(image.naturalWidth * scale));
    const targetHeight = Math.max(1, Math.round(image.naturalHeight * scale));
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d", { alpha: false });

    if (!context) {
      throw new Error("Browser tidak dapat menyiapkan citra.");
    }

    canvas.width = targetWidth;
    canvas.height = targetHeight;
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, targetWidth, targetHeight);
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(image, 0, 0, targetWidth, targetHeight);

    const blob = await canvasToJpeg(canvas);
    return new File([blob], "dentray-scan.jpg", {
      lastModified: Date.now(),
      type: "image/jpeg"
    });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
