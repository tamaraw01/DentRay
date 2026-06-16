import {
  createPreparedImageCanvas,
  type ImageInput
} from "@/lib/image/prepareImageForInference";
import type {
  ImageQualityIssue,
  ImageQualityResult
} from "@/types/image-quality";

const QUALITY_SAMPLE_MAX_SIDE = 320;
const MIN_SHORT_SIDE = 360;
const VERY_DARK_THRESHOLD = 25;
const DARK_THRESHOLD = 55;
const BRIGHT_THRESHOLD = 225;
const LOW_CONTRAST_THRESHOLD = 25;
const VERY_BLURRY_THRESHOLD = 12;
const BLURRY_THRESHOLD = 35;

const issueMessages: Record<ImageQualityIssue, string> = {
  low_contrast: "Kontras foto rendah — pastikan gigi terlihat jelas dari latar belakang.",
  too_blurry: "Foto terlalu buram. Tahan perangkat lebih stabil saat mengambil foto.",
  too_bright: "Foto terlalu terang. Kurangi sumber cahaya atau hindari pantulan langsung.",
  too_dark: "Foto terlalu gelap. Gunakan pencahayaan yang lebih baik saat memotret.",
  too_small: "Resolusi foto terlalu rendah. Gunakan kamera perangkat untuk kualitas lebih baik."
};

function calculateLaplacianVariance(
  luminance: Float32Array,
  width: number,
  height: number
) {
  let sum = 0;
  let squaredSum = 0;
  let count = 0;

  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const index = y * width + x;
      const laplacian =
        luminance[index] * 4 -
        luminance[index - 1] -
        luminance[index + 1] -
        luminance[index - width] -
        luminance[index + width];
      sum += laplacian;
      squaredSum += laplacian * laplacian;
      count += 1;
    }
  }

  if (count === 0) {
    return 0;
  }

  const mean = sum / count;
  return squaredSum / count - mean * mean;
}

function uniqueIssues(issues: ImageQualityIssue[]) {
  return [...new Set(issues)];
}

export async function checkImageQuality(
  input: ImageInput
): Promise<ImageQualityResult> {
  const { canvas, height, width } = await createPreparedImageCanvas(
    input,
    QUALITY_SAMPLE_MAX_SIDE
  );
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) {
    throw new Error("Kualitas foto belum dapat diperiksa.");
  }

  const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
  const pixelCount = canvas.width * canvas.height;
  const luminance = new Float32Array(pixelCount);
  let luminanceSum = 0;

  for (let pixelIndex = 0; pixelIndex < pixelCount; pixelIndex += 1) {
    const dataIndex = pixelIndex * 4;
    const value =
      pixels[dataIndex] * 0.2126 +
      pixels[dataIndex + 1] * 0.7152 +
      pixels[dataIndex + 2] * 0.0722;
    luminance[pixelIndex] = value;
    luminanceSum += value;
  }

  const brightness = luminanceSum / pixelCount;
  let varianceSum = 0;
  for (const value of luminance) {
    const difference = value - brightness;
    varianceSum += difference * difference;
  }

  const contrast = Math.sqrt(varianceSum / pixelCount);
  const blurScore = calculateLaplacianVariance(
    luminance,
    canvas.width,
    canvas.height
  );
  const issues: ImageQualityIssue[] = [];
  const blockingIssues: ImageQualityIssue[] = [];

  if (Math.min(width, height) < MIN_SHORT_SIDE) {
    issues.push("too_small");
    blockingIssues.push("too_small");
  }
  if (brightness < DARK_THRESHOLD) {
    issues.push("too_dark");
    if (brightness < VERY_DARK_THRESHOLD) {
      blockingIssues.push("too_dark");
    }
  } else if (brightness > BRIGHT_THRESHOLD) {
    issues.push("too_bright");
  }
  if (contrast < LOW_CONTRAST_THRESHOLD) {
    issues.push("low_contrast");
  }
  if (blurScore < BLURRY_THRESHOLD) {
    issues.push("too_blurry");
    if (blurScore < VERY_BLURRY_THRESHOLD) {
      blockingIssues.push("too_blurry");
    }
  }

  const finalIssues = uniqueIssues(issues);
  const score = Math.max(
    0,
    Math.round(
      100 -
        finalIssues.length * 12 -
        uniqueIssues(blockingIssues).length * 18
    )
  );

  return {
    blurScore: Math.round(blurScore * 10) / 10,
    brightness: Math.round(brightness * 10) / 10,
    contrast: Math.round(contrast * 10) / 10,
    height,
    issues: finalIssues,
    message: finalIssues[0] ? issueMessages[finalIssues[0]] : undefined,
    ok: blockingIssues.length === 0,
    score,
    width
  };
}
