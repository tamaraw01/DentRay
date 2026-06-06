import numpy as np

from app.core.constants import IMAGE_SIZE, MASK_THRESHOLD


def probability_to_binary_mask(probability_mask: np.ndarray, threshold: float = MASK_THRESHOLD) -> np.ndarray:
    squeezed = np.squeeze(probability_mask)
    if squeezed.ndim != 2:
        raise ValueError("Model output must be convertible to a 2D probability mask.")
    if squeezed.shape != IMAGE_SIZE:
        raise ValueError(f"Model output mask must have shape {IMAGE_SIZE}.")
    return (squeezed >= threshold).astype(np.uint8)


def binary_mask_to_image(binary_mask: np.ndarray) -> "Image.Image":
    from PIL import Image

    return Image.fromarray((binary_mask * 255).astype(np.uint8), mode="L")
