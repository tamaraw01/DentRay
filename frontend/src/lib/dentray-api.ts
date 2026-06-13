import type { PredictionResponse } from "@/types/prediction";

const unreadableResultMessage = "Hasil belum dapat dibaca. Coba lagi.";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseJsonCandidate(value: unknown): Record<string, unknown> | null {
  if (isRecord(value)) {
    return value;
  }

  if (typeof value !== "string") {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(value);
    return isRecord(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function optionalString(value: unknown) {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function optionalNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function optionalStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return undefined;
  }

  return value.filter((item): item is string => typeof item === "string");
}

export function getGradioImageSource(value: unknown): string | undefined {
  const directSource = optionalString(value);
  if (directSource) {
    return directSource;
  }

  if (!isRecord(value)) {
    return undefined;
  }

  return (
    optionalString(value.url) ??
    optionalString(value.path) ??
    optionalString(value.data)
  );
}

export function parseDentRayPayload(
  value: unknown,
  overlayFallback?: unknown
): PredictionResponse {
  const payload = parseJsonCandidate(value);
  const overlay =
    getGradioImageSource(payload?.overlay) ??
    getGradioImageSource(overlayFallback);

  if (payload?.success !== true || !overlay) {
    throw new Error(unreadableResultMessage);
  }

  const modelInput = isRecord(payload.model_input_size)
    ? {
        height: optionalNumber(payload.model_input_size.height),
        width: optionalNumber(payload.model_input_size.width)
      }
    : null;
  const modelInputSize =
    modelInput?.width !== undefined && modelInput.height !== undefined
      ? { height: modelInput.height, width: modelInput.width }
      : undefined;

  return {
    success: true,
    overlay,
    disclaimer: optionalString(payload.disclaimer),
    warnings: optionalStringArray(payload.warnings),
    segmented_area_percentage: optionalNumber(payload.segmented_area_percentage),
    image_width: optionalNumber(payload.image_width),
    image_height: optionalNumber(payload.image_height),
    model_input_size: modelInputSize
  };
}

export function parseDentRayGradioResponse(result: unknown): PredictionResponse {
  const rawData = isRecord(result) && "data" in result ? result.data : result;
  const outputs = Array.isArray(rawData) ? rawData : [rawData];
  const jsonCandidate = outputs.at(-1);
  return parseDentRayPayload(jsonCandidate, outputs[0]);
}
