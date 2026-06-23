import { siteConfig } from "@/config/site";
import { parseDentRayPayload } from "@/lib/dentray-api";
import { checkHuggingFaceBackend } from "@/lib/huggingface-api";
import type { PredictionResponse } from "@/types/prediction";

export async function getHealth() {
  if (!siteConfig.configuredApiBaseUrl && siteConfig.aiBackendUrl) {
    return checkHuggingFaceBackend(siteConfig.aiBackendUrl);
  }

  const response = await fetch(`${siteConfig.apiBaseUrl}/health`, {
    method: "GET",
    headers: {
      Accept: "application/json"
    }
  });

  if (!response.ok) {
    throw new Error("Backend DentRay belum dapat dihubungi.");
  }

  return response.json();
}

function getErrorMessage(payload: unknown, fallback: string) {
  if (typeof payload === "object" && payload !== null && "detail" in payload) {
    const detail = (payload as { detail: unknown }).detail;
    if (typeof detail === "string") {
      return detail;
    }
  }

  return fallback;
}

function getHfErrorMessage(payload: unknown, fallback: string) {
  if (typeof payload === "object" && payload !== null && "error" in payload) {
    const message = (payload as { error: unknown }).error;
    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }

  return fallback;
}

export async function predictImage(file: File): Promise<PredictionResponse> {
  // Hugging Face backend: proxy through our own server route so the request is
  // server-to-server (no browser CORS) and survives Space cold starts.
  if (!siteConfig.configuredApiBaseUrl && siteConfig.aiBackendUrl) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/predict", {
      method: "POST",
      body: formData
    });

    const payload: unknown = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(
        getHfErrorMessage(payload, "Backend AI sedang tidak tersedia. Tunggu beberapa saat, lalu coba kembali.")
      );
    }

    return payload as PredictionResponse;
  }

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${siteConfig.apiBaseUrl}/predict`, {
    method: "POST",
    body: formData
  });

  const payload: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(getErrorMessage(payload, "Analisis DentRay gagal. Coba ulangi dengan gambar yang lebih jelas."));
  }

  return parseDentRayPayload(payload);
}
