"use client";

import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { ScanSessionSummary, StoredScanResult } from "@/types/scan";

type CreateScanSessionInput = {
  userId: string;
  totalImages: number;
  highestIndication?: string | null;
  summary: string;
};

type CreateScanResultInput = {
  sessionId: string;
  userId: string;
  viewType: string;
  originalImageUrl?: string | null;
  maskImageUrl?: string | null;
  overlayImageUrl?: string | null;
  segmentedAreaPixels?: number | null;
  segmentedAreaPercentage?: number | null;
  interpretationLevel?: string | null;
  interpretationText?: string | null;
};

function ensureSupabase() {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase belum dikonfigurasi.");
  }

  return createClient();
}

function mapDatabaseError(error: { message?: string }) {
  const detail = error.message ? ` ${error.message}` : "";
  return new Error(`Data riwayat belum siap. Jalankan SQL schema DentRay di Supabase SQL Editor.${detail}`);
}

export async function getScanSessions(userId: string): Promise<ScanSessionSummary[]> {
  const supabase = ensureSupabase();
  const { data, error } = await supabase
    .from("scan_sessions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw mapDatabaseError(error);
  }

  return (data ?? []) as ScanSessionSummary[];
}

export async function createScanSession(input: CreateScanSessionInput): Promise<ScanSessionSummary> {
  const supabase = ensureSupabase();
  const { data, error } = await supabase
    .from("scan_sessions")
    .insert({
      highest_indication: input.highestIndication ?? null,
      summary: input.summary,
      total_images: input.totalImages,
      user_id: input.userId
    })
    .select()
    .single();

  if (error) {
    throw mapDatabaseError(error);
  }

  return data as ScanSessionSummary;
}

export async function createScanResult(input: CreateScanResultInput | CreateScanResultInput[]) {
  const supabase = ensureSupabase();
  const rows = (Array.isArray(input) ? input : [input]).map((item) => ({
    interpretation_level: item.interpretationLevel ?? null,
    interpretation_text: item.interpretationText ?? null,
    mask_image_url: item.maskImageUrl ?? null,
    original_image_url: item.originalImageUrl ?? null,
    overlay_image_url: item.overlayImageUrl ?? null,
    segmented_area_pixels: item.segmentedAreaPixels ?? null,
    segmented_area_percentage: item.segmentedAreaPercentage ?? null,
    session_id: item.sessionId,
    user_id: item.userId,
    view_type: item.viewType
  }));

  const { error } = await supabase.from("scan_results").insert(rows);

  if (error) {
    throw mapDatabaseError(error);
  }
}

export async function getScanSessionDetail(sessionId: string): Promise<{
  session: ScanSessionSummary | null;
  results: StoredScanResult[];
}> {
  const supabase = ensureSupabase();
  const { data: session, error: sessionError } = await supabase.from("scan_sessions").select("*").eq("id", sessionId).maybeSingle();

  if (sessionError) {
    throw mapDatabaseError(sessionError);
  }

  const { data: results, error: resultsError } = await supabase
    .from("scan_results")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  if (resultsError) {
    throw mapDatabaseError(resultsError);
  }

  return {
    results: (results ?? []) as StoredScanResult[],
    session: session as ScanSessionSummary | null
  };
}
