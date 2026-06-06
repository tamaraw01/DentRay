import numpy as np
from PIL import Image


def create_red_overlay(original_rgb: Image.Image, binary_mask: np.ndarray, alpha: float = 0.45) -> Image.Image:
    mask_image = Image.fromarray((binary_mask * 255).astype(np.uint8)).resize(original_rgb.size)
    base = np.asarray(original_rgb, dtype=np.float32)
    red_layer = np.zeros_like(base)
    red_layer[..., 0] = 255

    mask = (np.asarray(mask_image, dtype=np.float32) / 255.0)[..., None]
    blended = base * (1 - mask * alpha) + red_layer * (mask * alpha)
    return Image.fromarray(np.clip(blended, 0, 255).astype(np.uint8))

