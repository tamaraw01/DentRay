from app.core.constants import DISCLAIMER


def get_interpretation_level(segmented_area_percentage: float) -> str:
    if segmented_area_percentage == 0:
        return "No visible indication detected"
    if segmented_area_percentage < 2:
        return "Low visual indication"
    if segmented_area_percentage <= 8:
        return "Moderate visual indication"
    return "High visual indication"


def build_screening_recommendations() -> list[str]:
    return [
        "Gunakan hasil ini sebagai skrining awal, bukan diagnosis akhir.",
        "Ambil ulang foto jika gambar terlihat kurang jelas.",
        "Konsultasikan ke dokter gigi untuk konfirmasi klinis.",
    ]


def _interpretation_text(level: str) -> str:
    if level == "No visible indication detected":
        return (
            "DentRay tidak menemukan area yang tersegmentasi sebagai indikasi visual. "
            "Hasil ini hanya skrining awal dan perlu dikonfirmasi oleh dokter gigi."
        )
    if level == "Low visual indication":
        return (
            "DentRay menemukan area kecil yang tersegmentasi sebagai indikasi visual. "
            "Hasil ini hanya skrining awal dan perlu dikonfirmasi oleh dokter gigi."
        )
    if level == "Moderate visual indication":
        return (
            "DentRay menemukan area sedang yang tersegmentasi sebagai indikasi visual. "
            "Hasil ini hanya skrining awal dan perlu dikonfirmasi oleh dokter gigi."
        )
    return (
        "DentRay menemukan area cukup besar yang tersegmentasi sebagai indikasi visual. "
        "Hasil ini hanya skrining awal dan perlu dikonfirmasi oleh dokter gigi."
    )


def build_safe_interpretation(segmented_area_percentage: float) -> dict:
    level = get_interpretation_level(segmented_area_percentage)
    return {
        "interpretation_level": level,
        "interpretation_text": _interpretation_text(level),
        "recommendations": build_screening_recommendations(),
        "disclaimer": DISCLAIMER,
    }
