import { siteConfig } from "@/config/site";
import type { PredictionResponse } from "@/types/prediction";

export async function getHealth() {
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

export async function predictImage(file: File): Promise<PredictionResponse> {
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

  return payload as PredictionResponse;
}
