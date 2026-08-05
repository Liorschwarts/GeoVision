from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Runtime configuration for a replaceable GeoVision model bundle."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    model_dir: Path = Path("models/dinov2_supcon/final")
    device: str = "auto"
    top_k: int = 5
    max_upload_mb: int = 10
    host: str = "0.0.0.0"
    port: int = 8000

    @property
    def checkpoint_path(self) -> Path:
        return self.model_dir / "checkpoint.pth"

    @property
    def prototype_index_path(self) -> Path:
        return self.model_dir / "prototype_index.npz"

    @property
    def training_config_path(self) -> Path:
        return self.model_dir / "config.json"

    @property
    def cities_path(self) -> Path:
        return self.model_dir / "cities.csv"

settings = Settings()
