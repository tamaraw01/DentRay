export type ImageQualityIssue =
  | "too_blurry"
  | "too_dark"
  | "too_bright"
  | "low_contrast"
  | "too_small";

export type ImageQualityResult = {
  ok: boolean;
  score: number;
  blurScore?: number;
  brightness?: number;
  contrast?: number;
  width: number;
  height: number;
  issues: ImageQualityIssue[];
  message?: string;
};
