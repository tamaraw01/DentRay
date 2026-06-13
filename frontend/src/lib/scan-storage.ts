"use client";

import { createScanResult, createScanSession, getScanSessionDetail as getRemoteScanSessionDetail, getScanSessions } from "@/lib/supabase/scans";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import type { ScanResultItem, ScanSessionSummary, StoredScanResult } from "@/types/scan";
import type { DentRayUser } from "@/types/user";

const localSessionsKey = "dentray.scan_sessions";
const localResultsKey = "dentray.scan_results";

function readLocal<T>(key: string): T[] {
  if (typeof window === "undefined") {
    return [];
  }
  const raw = window.localStorage.getItem(key);
  if (!raw) {
    return [];
  }
  try {
    return JSON.parse(raw) as T[];
  } catch {
    return [];
  }
}

function writeLocal<T>(key: string, value: T[]) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

export async function saveScanSession(user: DentRayUser | null, results: ScanResultItem[]) {
  const summary = `${results.length} citra. Overlay tersimpan.`;

  if (isSupabaseConfigured() && user) {
    const session = await createScanSession({
      highestIndication: null,
      summary,
      totalImages: results.length,
      userId: user.id
    });

    await createScanResult(results.map((item) => ({
      interpretationLevel: null,
      interpretationText: null,
      maskImageUrl: null,
      originalImageUrl: null,
      overlayImageUrl: item.result.overlay,
      segmentedAreaPixels: null,
      segmentedAreaPercentage: item.result.segmented_area_percentage ?? null,
      sessionId: session.id,
      userId: user.id,
      viewType: item.title
    })));

    return session.id;
  }

  const id = `local-${Date.now()}`;
  const session: ScanSessionSummary = {
    id,
    user_id: user?.id ?? "",
    created_at: new Date().toISOString(),
    total_images: results.length,
    highest_indication: null,
    summary
  };
  const storedResults: StoredScanResult[] = results.map((item, index) => ({
    id: `${id}-${index}`,
    session_id: id,
    view_type: item.title,
    original_image_url: null,
    mask_image_url: null,
    overlay_image_url: item.result.overlay,
    segmented_area_pixels: null,
    segmented_area_percentage: item.result.segmented_area_percentage ?? null,
    interpretation_level: null,
    interpretation_text: null,
    created_at: session.created_at
  }));

  writeLocal(localSessionsKey, [session, ...readLocal<ScanSessionSummary>(localSessionsKey)]);
  writeLocal(localResultsKey, [...storedResults, ...readLocal<StoredScanResult>(localResultsKey)]);
  return id;
}

export async function listScanSessions(user: DentRayUser | null): Promise<ScanSessionSummary[]> {
  if (isSupabaseConfigured() && user) {
    return getScanSessions(user.id);
  }

  return readLocal<ScanSessionSummary>(localSessionsKey);
}

export async function getScanSessionDetail(sessionId: string) {
  if (isSupabaseConfigured() && !sessionId.startsWith("local-")) {
    return getRemoteScanSessionDetail(sessionId);
  }

  return {
    session: readLocal<ScanSessionSummary>(localSessionsKey).find((session) => session.id === sessionId) ?? null,
    results: readLocal<StoredScanResult>(localResultsKey).filter((result) => result.session_id === sessionId)
  };
}
