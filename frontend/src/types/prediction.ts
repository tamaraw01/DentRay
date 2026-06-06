export type ScreeningStatus = "idle" | "ready" | "analyzing" | "result" | "error";

export type PredictionResponse = {
  success: true;
  original_preview: string;
  predicted_mask: string;
  overlay: string;
  segmented_area_pixels: number;
  segmented_area_percentage: number;
  interpretation_level: string;
  interpretation_text: string;
  recommendations: string[];
  disclaimer: string;
  warnings: string[];
};

export type SelectedImage = {
  file: File;
  previewUrl: string;
  source: "camera" | "upload";
};
