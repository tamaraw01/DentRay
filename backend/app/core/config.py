from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "DentRay"
    app_env: str = "development"
    frontend_origin: str = "http://localhost:3000"
    allowed_origins: str = ""
    model_dir: str = "models"
    model_keras_filename: str = "dentray_unet_model.keras"
    model_path: str = ""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    @property
    def model_directory(self) -> Path:
        return Path(self.model_dir)

    @property
    def primary_model_path(self) -> Path:
        if self.model_path:
            return Path(self.model_path)
        return self.model_directory / self.model_keras_filename

    @property
    def primary_model_display_path(self) -> str:
        path = self.primary_model_path
        if path.is_absolute():
            return str(path)
        normalized = str(path)
        if normalized.startswith("backend/"):
            return normalized
        return str(Path("backend") / normalized)

    @property
    def cors_origins(self) -> list[str]:
        origins = self.allowed_origins or self.frontend_origin
        return [origin.strip() for origin in origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
