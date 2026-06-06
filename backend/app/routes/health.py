from fastapi import APIRouter

from app.core.config import settings
from app.services.model_loader import MODEL_MISSING_MESSAGE, get_model_status

router = APIRouter(tags=["health"])


@router.get("/health")
def health_check() -> dict:
    model_status = get_model_status()
    model_path = model_status["model_path"]
    if not model_status["model_exists"]:
        return {
            "app_name": settings.app_name,
            "status": "model_missing",
            "model_path": model_path,
            "model_exists": False,
            "message": MODEL_MISSING_MESSAGE,
        }

    return {
        "app_name": settings.app_name,
        "status": "ok",
        "model_path": model_path,
        "model_exists": True,
        "model_format": "keras",
    }
