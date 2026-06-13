import base64
from functools import lru_cache
from io import BytesIO
from pathlib import Path
from typing import Any

import gradio as gr
import numpy as np
from PIL import Image

IMAGE_SIZE = (256, 256)
MASK_THRESHOLD = 0.5
OVERLAY_COLOR = (239, 68, 68)
OVERLAY_ALPHA = 0.42
MODEL_PATH = (
    Path(__file__).resolve().parent / "models" / "dentray_unet_model.keras"
)

DISCLAIMER = (
    "Hasil ini adalah skrining awal dan bukan pengganti pemeriksaan dokter gigi."
)


@lru_cache(maxsize=1)
def load_dentray_model() -> Any:
    if not MODEL_PATH.exists() or not MODEL_PATH.is_file() or MODEL_PATH.stat().st_size == 0:
        raise FileNotFoundError(
            "Model DentRay belum ditemukan. Letakkan dentray_unet_model.keras "
            "di models/dentray_unet_model.keras."
        )

    from tensorflow.keras.models import load_model

    return load_model(MODEL_PATH, compile=False)


def preprocess_image(image: Image.Image) -> tuple[Image.Image, np.ndarray]:
    original_rgb = image.convert("RGB")
    resized_rgb = original_rgb.resize(IMAGE_SIZE)
    normalized = np.asarray(resized_rgb, dtype=np.float32) / 255.0
    batch = np.expand_dims(normalized, axis=0)
    return original_rgb, batch


def probability_to_binary_mask(probability_mask: np.ndarray) -> np.ndarray:
    squeezed = np.squeeze(np.asarray(probability_mask, dtype=np.float32))
    if squeezed.ndim != 2 or squeezed.shape != IMAGE_SIZE:
        raise ValueError(
            f"Output model harus dapat diubah menjadi mask berukuran {IMAGE_SIZE}."
        )
    return (squeezed >= MASK_THRESHOLD).astype(np.uint8)


def binary_mask_image(binary_mask: np.ndarray) -> Image.Image:
    return Image.fromarray((binary_mask * 255).astype(np.uint8))


def create_red_overlay(original_rgb: Image.Image, binary_mask: np.ndarray) -> Image.Image:
    mask = binary_mask_image(binary_mask).resize(original_rgb.size)
    base = np.asarray(original_rgb, dtype=np.float32)
    red_layer = np.zeros_like(base)
    red_layer[...] = OVERLAY_COLOR

    mask_alpha = (np.asarray(mask, dtype=np.float32) / 255.0)[..., None]
    blended = base * (1 - mask_alpha * OVERLAY_ALPHA) + red_layer * (
        mask_alpha * OVERLAY_ALPHA
    )
    return Image.fromarray(np.clip(blended, 0, 255).astype(np.uint8))


def image_to_data_url(image: Image.Image) -> str:
    buffer = BytesIO()
    image.save(buffer, format="PNG")
    encoded = base64.b64encode(buffer.getvalue()).decode("utf-8")
    return f"data:image/png;base64,{encoded}"


def analyze_image(image: Image.Image) -> dict[str, Any]:
    original_rgb, batch = preprocess_image(image)
    model = load_dentray_model()
    probability_mask = model.predict(batch, verbose=0)
    binary_mask = probability_to_binary_mask(probability_mask)

    overlay_image = create_red_overlay(original_rgb, binary_mask)
    segmented_pixels = int(np.count_nonzero(binary_mask))
    segmented_percentage = round(
        segmented_pixels / (IMAGE_SIZE[0] * IMAGE_SIZE[1]) * 100,
        2,
    )
    image_width, image_height = original_rgb.size

    return {
        "success": True,
        "overlay_image": overlay_image,
        "overlay": image_to_data_url(overlay_image),
        "image_width": image_width,
        "image_height": image_height,
        "model_input_size": {
            "width": IMAGE_SIZE[0],
            "height": IMAGE_SIZE[1],
        },
        "segmented_area_percentage": segmented_percentage,
        "disclaimer": DISCLAIMER,
        "warnings": [],
    }


def predict(image: Image.Image | None):
    if image is None:
        raise gr.Error("Pilih citra gigi terlebih dahulu.")

    try:
        result = analyze_image(image)
    except (FileNotFoundError, ValueError) as exc:
        raise gr.Error(str(exc)) from exc
    except Exception as exc:
        raise gr.Error("Analisis belum dapat dijalankan. Coba lagi.") from exc

    api_response = {
        key: value for key, value in result.items() if key != "overlay_image"
    }

    return (
        result["overlay_image"],
        api_response,
    )


SPACE_CSS = """
.gradio-container {
  max-width: 1120px !important;
  margin: 0 auto !important;
}
.dentray-note {
  border: 1px solid #dbeafe;
  border-radius: 16px;
  background: #f8fbff;
  padding: 14px 16px;
}
"""

with gr.Blocks(title="DentRay AI Backend") as demo:
    gr.Markdown(
        """
        # DentRay AI Backend
        Unggah citra gigi untuk melihat overlay area tersegmentasi.

        <div class="dentray-note">
        Hasil hanya untuk skrining awal dan bukan pengganti pemeriksaan dokter gigi.
        </div>
        """
    )

    image_input = gr.Image(
        label="Citra gigi",
        sources=["upload", "webcam"],
        type="pil",
        image_mode="RGB",
    )
    analyze_button = gr.Button("Analisis", variant="primary")

    overlay_output = gr.Image(label="Overlay", type="pil")

    json_output = gr.JSON(label="Response JSON", visible=False)

    analyze_button.click(
        fn=predict,
        inputs=[image_input],
        outputs=[
            overlay_output,
            json_output,
        ],
        api_name="predict",
        api_description=(
            "Menjalankan segmentasi DentRay dan mengembalikan overlay serta response "
            "JSON untuk frontend."
        ),
        concurrency_limit=1,
    )

demo.queue(default_concurrency_limit=1, max_size=8)

if __name__ == "__main__":
    demo.launch(css=SPACE_CSS)
