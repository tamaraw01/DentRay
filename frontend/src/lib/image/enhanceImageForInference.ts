import {
  canvasToJpeg,
  createPreparedImageCanvas,
  type ImageInput
} from "@/lib/image/prepareImageForInference";

function clampChannel(value: number) {
  return Math.max(0, Math.min(255, Math.round(value)));
}

export async function enhanceImageForInference(
  input: ImageInput
): Promise<File> {
  const { canvas } = await createPreparedImageCanvas(input);
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) {
    throw new Error("Citra tidak dapat disiapkan untuk analisis.");
  }

  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = imageData.data;
  let luminanceSum = 0;
  let squaredLuminanceSum = 0;
  const pixelCount = canvas.width * canvas.height;

  for (let index = 0; index < pixels.length; index += 4) {
    const luminance =
      pixels[index] * 0.2126 +
      pixels[index + 1] * 0.7152 +
      pixels[index + 2] * 0.0722;
    luminanceSum += luminance;
    squaredLuminanceSum += luminance * luminance;
  }

  const brightness = luminanceSum / pixelCount;
  const contrast = Math.sqrt(
    Math.max(0, squaredLuminanceSum / pixelCount - brightness * brightness)
  );
  const brightnessOffset =
    brightness < 70 ? Math.min(18, (70 - brightness) * 0.35) : 0;
  const contrastFactor = contrast < 35 ? 1.1 : 1.03;

  for (let index = 0; index < pixels.length; index += 4) {
    pixels[index] = clampChannel(
      (pixels[index] - 128) * contrastFactor + 128 + brightnessOffset
    );
    pixels[index + 1] = clampChannel(
      (pixels[index + 1] - 128) * contrastFactor + 128 + brightnessOffset
    );
    pixels[index + 2] = clampChannel(
      (pixels[index + 2] - 128) * contrastFactor + 128 + brightnessOffset
    );
  }

  context.putImageData(imageData, 0, 0);
  const blob = await canvasToJpeg(canvas, 0.92);
  return new File([blob], "dentray-scan.jpg", {
    lastModified: Date.now(),
    type: "image/jpeg"
  });
}
