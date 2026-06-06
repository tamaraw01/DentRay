ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png"}
ALLOWED_IMAGE_CONTENT_TYPES = {"image/jpeg", "image/png"}


def is_allowed_image_filename(filename: str) -> bool:
    normalized = filename.lower().strip()
    return any(normalized.endswith(extension) for extension in ALLOWED_IMAGE_EXTENSIONS)


def validate_upload_metadata(filename: str | None, content_type: str | None) -> None:
    if not filename or not is_allowed_image_filename(filename):
        raise ValueError("File harus berupa gambar .jpg, .jpeg, atau .png.")
    if content_type and content_type not in ALLOWED_IMAGE_CONTENT_TYPES:
        raise ValueError("Content-Type file harus image/jpeg atau image/png.")
