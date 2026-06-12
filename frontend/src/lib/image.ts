import type { Area } from "react-easy-crop";

function createImage(imageSrc: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Citra tidak dapat diproses."));
    image.src = imageSrc;
  });
}

function rotatedSize(width: number, height: number, rotation: number) {
  const radians = (rotation * Math.PI) / 180;
  return {
    height: Math.abs(Math.sin(radians) * width) + Math.abs(Math.cos(radians) * height),
    width: Math.abs(Math.cos(radians) * width) + Math.abs(Math.sin(radians) * height)
  };
}

function canvasToBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
          return;
        }
        reject(new Error("Hasil penyesuaian tidak dapat dibuat."));
      },
      "image/jpeg",
      0.9
    );
  });
}

export async function createCroppedImage(imageSrc: string, crop: Area, rotation: number, filename: string) {
  const image = await createImage(imageSrc);
  const maxSourceDimension = 2048;
  const sourceScale = Math.min(1, maxSourceDimension / Math.max(image.naturalWidth, image.naturalHeight));
  const sourceWidth = Math.max(1, Math.round(image.naturalWidth * sourceScale));
  const sourceHeight = Math.max(1, Math.round(image.naturalHeight * sourceScale));
  const rotationRadians = (rotation * Math.PI) / 180;
  const boundingBox = rotatedSize(sourceWidth, sourceHeight, rotation);
  const sourceCanvas = document.createElement("canvas");
  const sourceContext = sourceCanvas.getContext("2d");

  if (!sourceContext) {
    throw new Error("Browser tidak dapat menyesuaikan citra.");
  }

  sourceCanvas.width = Math.ceil(boundingBox.width);
  sourceCanvas.height = Math.ceil(boundingBox.height);
  sourceContext.translate(sourceCanvas.width / 2, sourceCanvas.height / 2);
  sourceContext.rotate(rotationRadians);
  sourceContext.translate(-sourceWidth / 2, -sourceHeight / 2);
  sourceContext.drawImage(image, 0, 0, sourceWidth, sourceHeight);

  const outputCanvas = document.createElement("canvas");
  const outputContext = outputCanvas.getContext("2d");
  const cropX = Math.round(crop.x * sourceScale);
  const cropY = Math.round(crop.y * sourceScale);
  const cropWidth = Math.max(1, Math.round(crop.width * sourceScale));
  const cropHeight = Math.max(1, Math.round(crop.height * sourceScale));

  if (!outputContext) {
    throw new Error("Browser tidak dapat membuat hasil crop.");
  }

  const outputScale = Math.min(1, 512 / Math.max(cropWidth, cropHeight));
  const outputWidth = Math.max(1, Math.round(cropWidth * outputScale));
  const outputHeight = Math.max(1, Math.round(cropHeight * outputScale));

  outputCanvas.width = outputWidth;
  outputCanvas.height = outputHeight;
  outputContext.imageSmoothingEnabled = true;
  outputContext.imageSmoothingQuality = "high";
  outputContext.drawImage(
    sourceCanvas,
    cropX,
    cropY,
    cropWidth,
    cropHeight,
    0,
    0,
    outputWidth,
    outputHeight
  );

  const blob = await canvasToBlob(outputCanvas);
  return new File([blob], filename, { type: "image/jpeg" });
}
