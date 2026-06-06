from io import BytesIO

from PIL import Image, UnidentifiedImageError


def decode_image_to_rgb(image_bytes: bytes) -> Image.Image:
    try:
        image = Image.open(BytesIO(image_bytes))
        image.verify()
    except (UnidentifiedImageError, OSError) as exc:
        raise ValueError("File gambar rusak atau tidak dapat dibaca.") from exc

    try:
        return Image.open(BytesIO(image_bytes)).convert("RGB")
    except (UnidentifiedImageError, OSError) as exc:
        raise ValueError("File gambar tidak dapat dikonversi ke RGB.") from exc
