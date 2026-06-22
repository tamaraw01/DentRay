import { Client, handle_file } from "@gradio/client";

import {
  getGradioImageSource,
  parseDentRayGradioResponse
} from "@/lib/dentray-api";
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
      promise: Client.connect(normalizedSource, { hf_token: "" })
    };
  }

  return cachedClient.promise;
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
    const prediction = parseDentRayGradioResponse(result);

    if (process.env.NODE_ENV === "development") {
      const data = Array.isArray(result.data) ? result.data : [result.data];
      const jsonCandidate = data.at(-1);
      let parsedJson = jsonCandidate;
      if (typeof jsonCandidate === "string") {
        try {
          parsedJson = JSON.parse(jsonCandidate) as unknown;
        } catch {
          parsedJson = null;
        }
      }

      console.log("[DentRay] Gradio result.data", result.data);
      console.log("[DentRay] Parsed JSON", parsedJson);
      console.log("[DentRay] Overlay source", prediction.overlay || getGradioImageSource(data[0]));
    }

    return prediction;
  } catch (error) {
    // Temporary debug logging to help surface raw Gradio/connection errors in browser console
    // Remove this after debugging once the issue is resolved.
    // eslint-disable-next-line no-console
    console.error("[DentRay] predict error:", error);
    if (error instanceof Error && error.message === "Hasil belum dapat dibaca. Coba lagi.") {
      throw error;
    }

    throw new Error("Backend AI sedang tidak tersedia. Tunggu beberapa saat, lalu coba kembali.");
  }
}
