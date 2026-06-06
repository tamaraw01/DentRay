import type { PredictionResponse } from "@/types/prediction";

export type ScanViewType = "front" | "left" | "right" | "upper" | "lower";

export type ScanView = {
  id: ScanViewType;
  title: string;
  instruction: string;
};

export type ScanViewCapture = {
  viewType: ScanViewType;
  title: string;
  file: File;
  previewUrl: string;
};

export type ScanResultItem = {
  viewType: ScanViewType;
  title: string;
  result: PredictionResponse;
};

export type ScanSessionSummary = {
  id: string;
  user_id: string;
  created_at: string;
  total_images: number;
  highest_indication: string | null;
  summary: string | null;
};

export type StoredScanResult = {
  id: string;
  session_id: string;
  user_id?: string;
  view_type: string;
  original_image_url?: string | null;
  mask_image_url?: string | null;
  overlay_image_url?: string | null;
  segmented_area_pixels?: number | null;
  segmented_area_percentage: number | null;
  interpretation_level: string | null;
  interpretation_text: string | null;
  created_at: string;
};
