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
OVERLAY_ALPHA = 0.45
MODEL_PATH = Path(__file__).resolve().parent / "dentray_unet_model.keras"

DISCLAIMER = (
    "DentRay adalah alat bantu skrining awal berbasis AI dan bukan pengganti "
    "pemeriksaan dokter gigi."
)
RECOMMENDATIONS = [
    "Gunakan hasil ini sebagai skrining awal.",
    "Ambil ulang citra jika gambar kurang jelas.",
    "Periksa ke dokter gigi untuk memastikan kondisi gigi.",
]


@lru_cache(maxsize=1)
def load_dentray_model() -> Any:
    if not MODEL_PATH.exists() or not MODEL_PATH.is_file() or MODEL_PATH.stat().st_size == 0:
        raise FileNotFoundError(
            "Model DentRay belum ditemukan. Letakkan dentray_unet_model.keras "
            "di root Space sebagai dentray_unet_model.keras."
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
    red_layer[..., 0] = 255

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


def interpretation_for(percentage: float) -> tuple[str, str]:
    if percentage == 0:
        level = "No visible indication detected"
        text = (
            "DentRay tidak menemukan area yang tersegmentasi sebagai indikasi visual. "
            "Hasil ini hanya skrining awal dan perlu dikonfirmasi oleh dokter gigi."
        )
    elif percentage < 2:
        level = "Low visual indication"
        text = (
            "DentRay menemukan area kecil yang tersegmentasi sebagai indikasi visual. "
            "Hasil ini hanya skrining awal dan perlu dikonfirmasi oleh dokter gigi."
        )
    elif percentage <= 8:
        level = "Moderate visual indication"
        text = (
            "DentRay menemukan area sedang yang tersegmentasi sebagai indikasi visual. "
            "Hasil ini hanya skrining awal dan perlu dikonfirmasi oleh dokter gigi."
        )
    else:
        level = "High visual indication"
        text = (
            "DentRay menemukan area cukup besar yang tersegmentasi sebagai indikasi visual. "
            "Hasil ini hanya skrining awal dan perlu dikonfirmasi oleh dokter gigi."
        )

    return level, text


def analyze_image(image: Image.Image) -> dict[str, Any]:
    original_rgb, batch = preprocess_image(image)
    model = load_dentray_model()
    probability_mask = model.predict(batch, verbose=0)
    binary_mask = probability_to_binary_mask(probability_mask)

    mask_image = binary_mask_image(binary_mask)
    overlay_image = create_red_overlay(original_rgb, binary_mask)
    segmented_pixels = int(np.count_nonzero(binary_mask))
    segmented_percentage = round(
        segmented_pixels / (IMAGE_SIZE[0] * IMAGE_SIZE[1]) * 100,
        2,
    )
    level, interpretation_text = interpretation_for(segmented_percentage)

    return {
        "success": True,
        "original_image": original_rgb,
        "mask_image": mask_image,
        "overlay_image": overlay_image,
        "original_preview": image_to_data_url(original_rgb),
        "predicted_mask": image_to_data_url(mask_image),
        "overlay": image_to_data_url(overlay_image),
        "segmented_area_pixels": segmented_pixels,
        "segmented_area_percentage": segmented_percentage,
        "interpretation_level": level,
        "interpretation_text": interpretation_text,
        "recommendations": RECOMMENDATIONS,
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
        key: value
        for key, value in result.items()
        if key not in {"original_image", "mask_image", "overlay_image"}
    }

    return (
        result["mask_image"],
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

with gr.Blocks(title="DentRay AI Screening") as demo:
    gr.Markdown(
        """
        # DentRay AI Screening
        Unggah citra gigi untuk melihat mask dan overlay area tersegmentasi.

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

    with gr.Row():
        mask_output = gr.Image(label="Mask", type="pil")
        overlay_output = gr.Image(label="Overlay", type="pil")

    json_output = gr.JSON(label="Response JSON", visible=False)

    analyze_button.click(
        fn=predict,
        inputs=[image_input],
        outputs=[
            mask_output,
            overlay_output,
            json_output,
        ],
        api_name="predict",
        api_description=(
            "Menjalankan segmentasi DentRay dan mengembalikan preview, mask, overlay, "
            "metric, interpretasi aman, serta response JSON untuk frontend."
        ),
        concurrency_limit=1,
    )

demo.queue(default_concurrency_limit=1, max_size=8)

if __name__ == "__main__":
    demo.launch(css=SPACE_CSS)
