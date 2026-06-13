export type ScreeningStatus = "idle" | "ready" | "analyzing" | "result" | "error";

export type ModelInputSize = {
  width: number;
  height: number;
};

export type DentRayResult = {
  success: boolean;
  overlay: string;
  disclaimer?: string;
  warnings?: string[];
  segmented_area_percentage?: number;
  image_width?: number;
  image_height?: number;
  model_input_size?: ModelInputSize;
};

export type PredictionResponse = DentRayResult;

export type SelectedImage = {
  file: File;
  previewUrl: string;
  source: "camera" | "upload";
};
