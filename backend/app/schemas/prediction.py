from pydantic import BaseModel, Field


class PredictionResponse(BaseModel):
    success: bool = True
    original_preview: str
    predicted_mask: str
    overlay: str
    segmented_area_pixels: int
    segmented_area_percentage: float
    interpretation_level: str
    interpretation_text: str
    recommendations: list[str]
    disclaimer: str
    warnings: list[str] = Field(default_factory=list)


class PredictionErrorResponse(BaseModel):
    success: bool = False
    error: str
    warnings: list[str] = Field(default_factory=list)
