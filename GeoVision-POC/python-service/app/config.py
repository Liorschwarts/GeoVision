from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    centroids_path: Path = Path("models/spatial_centroids.npz")
    cities_csv_path: Path = Path("data/cities.csv")
    device: str = "cpu"
    top_k: int = 5
    host: str = "0.0.0.0"
    port: int = 8000


settings = Settings()
