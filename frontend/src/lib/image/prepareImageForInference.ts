export type ImageInput = File | Blob | ImageData;

export const INFERENCE_IMAGE_MAX_SIDE = 1024;
export const INFERENCE_IMAGE_QUALITY = 0.92;

function loadImage(source: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Citra tidak dapat diproses."));
    image.src = source;
  });
}

export function canvasToJpeg(
  canvas: HTMLCanvasElement,
  quality = INFERENCE_IMAGE_QUALITY
) {
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
      quality
    );
  });
}

function isImageData(input: ImageInput): input is ImageData {
  return typeof ImageData !== "undefined" && input instanceof ImageData;
}

export async function createPreparedImageCanvas(
  input: ImageInput,
  maxSide = INFERENCE_IMAGE_MAX_SIDE
) {
  let objectUrl: string | null = null;

  try {
    let source: CanvasImageSource;
    let sourceWidth: number;
    let sourceHeight: number;

    if (isImageData(input)) {
      const sourceCanvas = document.createElement("canvas");
      const sourceContext = sourceCanvas.getContext("2d");
      if (!sourceContext) {
        throw new Error("Browser tidak dapat menyiapkan citra.");
      }

      sourceCanvas.width = input.width;
      sourceCanvas.height = input.height;
      sourceContext.putImageData(input, 0, 0);
      source = sourceCanvas;
      sourceWidth = input.width;
      sourceHeight = input.height;
    } else {
      objectUrl = URL.createObjectURL(input);
      const image = await loadImage(objectUrl);
      source = image;
      sourceWidth = image.naturalWidth;
      sourceHeight = image.naturalHeight;
    }

    const scale = Math.min(
      1,
      maxSide / Math.max(sourceWidth, sourceHeight)
    );
    const targetWidth = Math.max(1, Math.round(sourceWidth * scale));
    const targetHeight = Math.max(1, Math.round(sourceHeight * scale));
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
    context.drawImage(source, 0, 0, targetWidth, targetHeight);

    return {
      canvas,
      height: sourceHeight,
      width: sourceWidth
    };
  } finally {
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
    }
  }
}

export async function prepareImageForInference(input: ImageInput): Promise<File> {
  const { canvas } = await createPreparedImageCanvas(input);
  const blob = await canvasToJpeg(canvas);
  return new File([blob], "dentray-scan.jpg", {
    lastModified: Date.now(),
    type: "image/jpeg"
  });
}
