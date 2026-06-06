from fastapi import APIRouter, File, HTTPException, UploadFile, status

from app.core.constants import MAX_UPLOAD_BYTES
from app.schemas.prediction import PredictionResponse
from app.services.inference import run_unet_inference
from app.services.interpretation import build_safe_interpretation
from app.services.metrics import count_segmented_pixels, segmented_area_percentage
from app.services.model_loader import load_unet_model
from app.services.overlay import create_red_overlay
from app.services.postprocessing import binary_mask_to_image, probability_to_binary_mask
from app.services.preprocessing import preprocess_image_bytes
from app.utils.base64_utils import image_to_png_data_url
from app.utils.validation import validate_upload_metadata

router = APIRouter(tags=["prediction"])


@router.post("/predict", response_model=PredictionResponse)
async def predict(file: UploadFile = File(...)) -> PredictionResponse:
    try:
        validate_upload_metadata(file.filename, file.content_type)
        image_bytes = await file.read()
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    if not image_bytes:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="File gambar kosong.")
    if len(image_bytes) > MAX_UPLOAD_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Ukuran file terlalu besar. Gunakan gambar maksimal 8 MB.",
        )

    try:
        preprocessed = preprocess_image_bytes(image_bytes)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    try:
        model = load_unet_model()
    except FileNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc

    try:
        probability_mask = run_unet_inference(model, preprocessed.batch)
        binary_mask = probability_to_binary_mask(probability_mask)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc)) from exc

    mask_image = binary_mask_to_image(binary_mask)
    overlay_image = create_red_overlay(preprocessed.original_rgb, binary_mask)
    segmented_pixels = count_segmented_pixels(binary_mask)
    segmented_percentage = segmented_area_percentage(binary_mask)
    interpretation = build_safe_interpretation(segmented_percentage)

    return PredictionResponse(
        success=True,
        original_preview=image_to_png_data_url(preprocessed.original_rgb),
        predicted_mask=image_to_png_data_url(mask_image),
        overlay=image_to_png_data_url(overlay_image),
        segmented_area_pixels=segmented_pixels,
        segmented_area_percentage=segmented_percentage,
        interpretation_level=interpretation["interpretation_level"],
        interpretation_text=interpretation["interpretation_text"],
        recommendations=interpretation["recommendations"],
        disclaimer=interpretation["disclaimer"],
        warnings=[],
    )
