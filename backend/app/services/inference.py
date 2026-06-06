from typing import Protocol

import numpy as np


class PredictiveModel(Protocol):
    def predict(self, batch: np.ndarray, verbose: int = 0) -> np.ndarray:
        ...


def run_unet_inference(model: PredictiveModel, batch: np.ndarray) -> np.ndarray:
    prediction = model.predict(batch, verbose=0)
    probability_mask = np.asarray(prediction, dtype=np.float32)
    if probability_mask.size == 0:
        raise ValueError("Model returned an empty prediction mask.")
    return probability_mask
