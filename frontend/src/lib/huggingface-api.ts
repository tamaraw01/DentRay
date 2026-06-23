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
    const promise = Client.connect(normalizedSource);
    // Never keep a rejected connection in the cache. Otherwise a single failed
    // attempt (e.g. the Space waking up from sleep) would be reused for every
    // retry and the backend would look permanently down until a full reload.
    void promise.catch(() => {
      if (cachedClient?.promise === promise) {
        cachedClient = null;
      }
    });
    cachedClient = { source: normalizedSource, promise };
  }

  return cachedClient.promise;
}

const unreadableResultMessage = "Hasil belum dapat dibaca. Coba lagi.";

function describeError(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }
  return typeof error === "string" ? error : "kesalahan tidak diketahui";
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
  // Stage 1: connect. A failure here means the URL is wrong or the Space is
  // unreachable/asleep — surface that distinctly from a prediction failure.
  let client: Awaited<ReturnType<typeof getClient>>;
  try {
    client = await getClient(source);
  } catch (connectError) {
    cachedClient = null;
    console.error("[DentRay] connect error:", connectError);
    throw new Error(
      `Tidak dapat terhubung ke backend AI. Periksa URL Space (format https://nama-space.hf.space) dan pastikan Space aktif. (${describeError(connectError)})`
    );
  }

  // Stage 2: predict.
  try {
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
    console.error("[DentRay] predict error:", error);

    if (error instanceof Error && error.message === unreadableResultMessage) {
      throw error;
    }

    throw new Error(`Backend AI gagal memproses gambar. (${describeError(error)})`);
  }
}
