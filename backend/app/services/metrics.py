import numpy as np


def count_segmented_pixels(binary_mask: np.ndarray) -> int:
    return int(np.count_nonzero(binary_mask))


def segmented_area_percentage(binary_mask: np.ndarray) -> float:
    total_pixels = binary_mask.size
    if total_pixels == 0:
        return 0.0
    return round((count_segmented_pixels(binary_mask) / total_pixels) * 100, 2)
