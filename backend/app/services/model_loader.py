from functools import lru_cache
from pathlib import Path
from typing import Any

from app.core.config import settings

MODEL_MISSING_MESSAGE = (
    "Model DentRay belum ditemukan. Letakkan file dentray_unet_model.keras di backend/models/."
)


def _is_valid_model_file(path: Path) -> bool:
    return path.exists() and path.is_file() and path.stat().st_size > 0


def get_preferred_model_path() -> Path | None:
    keras_path = settings.primary_model_path
    if _is_valid_model_file(keras_path):
        return keras_path
    return None


def get_model_status() -> dict:
    keras_path = settings.primary_model_path
    preferred_path = get_preferred_model_path()
    model_exists = _is_valid_model_file(keras_path)
    return {
        "model_path": settings.primary_model_display_path,
        "model_exists": model_exists,
        "model_format": "keras" if model_exists else None,
        "keras_path": str(keras_path),
        "keras_exists": keras_path.exists(),
        "keras_valid": _is_valid_model_file(keras_path),
        "selected_model": str(preferred_path) if preferred_path else None,
        "selected_model_format": preferred_path.suffix.lstrip(".") if preferred_path else None,
        "loaded": load_unet_model.cache_info().currsize > 0,
    }


@lru_cache(maxsize=1)
def load_unet_model() -> Any:
    model_path = get_preferred_model_path()
    if model_path is None:
        raise FileNotFoundError(MODEL_MISSING_MESSAGE)

    try:
        from tensorflow.keras.models import load_model

        return load_model(model_path, compile=False)
    except Exception as exc:
        raise RuntimeError(f"Model DentRay tidak dapat dimuat dari {model_path}.") from exc
