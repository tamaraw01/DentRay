from dataclasses import dataclass

import numpy as np
from PIL import Image

from app.core.constants import IMAGE_SIZE
from app.utils.image_io import decode_image_to_rgb


@dataclass(frozen=True)
class PreprocessedImage:
    original_rgb: Image.Image
    resized_rgb: Image.Image
    batch: np.ndarray


def preprocess_image_bytes(image_bytes: bytes) -> PreprocessedImage:
    original = decode_image_to_rgb(image_bytes)
    resized = original.resize(IMAGE_SIZE)
    array = np.asarray(resized, dtype=np.float32) / 255.0
    batch = np.expand_dims(array, axis=0)

    return PreprocessedImage(original_rgb=original, resized_rgb=resized, batch=batch)
