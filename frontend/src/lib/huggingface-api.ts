import { Client, handle_file } from "@gradio/client";

import type { PredictionResponse } from "@/types/prediction";

type CachedClient = {
  source: string;
  promise: ReturnType<typeof Client.connect>;
};

let cachedClient: CachedClient | null = null;

function normalizeSource(source: string) {
  return source.trim().replace(/\/+$/, "");
}

function getClient(source: string) {
  const normalizedSource = normalizeSource(source);
  if (!normalizedSource) {
    throw new Error("URL backend AI Hugging Face belum dikonfigurasi.");
  }

  if (!cachedClient || cachedClient.source !== normalizedSource) {
    cachedClient = {
      source: normalizedSource,
      promise: Client.connect(normalizedSource)
    };
  }

  return cachedClient.promise;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parsePayload(value: unknown): PredictionResponse {
  const parsed =
    typeof value === "string"
      ? (() => {
          try {
            return JSON.parse(value) as unknown;
          } catch {
            return null;
          }
        })()
      : value;

  if (
    !isRecord(parsed) ||
    parsed.success !== true ||
    typeof parsed.original_preview !== "string" ||
    typeof parsed.predicted_mask !== "string" ||
    typeof parsed.overlay !== "string" ||
    typeof parsed.segmented_area_pixels !== "number" ||
    typeof parsed.segmented_area_percentage !== "number" ||
    typeof parsed.interpretation_level !== "string" ||
    typeof parsed.interpretation_text !== "string" ||
    typeof parsed.disclaimer !== "string" ||
    !Array.isArray(parsed.recommendations) ||
    !Array.isArray(parsed.warnings)
  ) {
    throw new Error("Response backend AI Hugging Face tidak sesuai format DentRay.");
  }

  return parsed as PredictionResponse;
}

export async function checkHuggingFaceBackend(source: string) {
  const client = await getClient(source);
  await client.view_api();
  return {
    app_name: "DentRay",
    backend: "huggingface",
    status: "ok"
  };
}

export async function predictWithHuggingFace(file: File, source: string): Promise<PredictionResponse> {
  try {
    const client = await getClient(source);
    const result = await client.predict<unknown[]>("/predict", [handle_file(file)]);
    const output = Array.isArray(result.data) ? result.data.at(-1) : result.data;
    return parsePayload(output);
  } catch (error) {
    if (error instanceof Error && error.message.includes("format DentRay")) {
      throw error;
    }

    throw new Error(
      "Backend AI Hugging Face belum dapat dihubungi. Space mungkin sedang memulai ulang. Coba beberapa saat lagi."
    );
  }
}
