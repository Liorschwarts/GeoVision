from __future__ import annotations

from typing import TYPE_CHECKING

import numpy as np
import pandas as pd
import torch
from sklearn.metrics.pairwise import cosine_similarity

from app.config import settings
from app.model import VibeEncoder
from app.schemas import CityResult

if TYPE_CHECKING:
    from app.config import Settings


def load_cities_lookup(csv_path) -> pd.DataFrame:
    df = pd.read_csv(csv_path)
    required = {"unique_city", "city", "country", "lat", "lng"}
    missing = required - set(df.columns)
    if missing:
        raise ValueError(f"cities.csv is missing columns: {sorted(missing)}")
    return df.set_index("unique_city")


def load_centroids(centroids_path) -> dict[str, np.ndarray]:
    if not centroids_path.exists():
        raise FileNotFoundError(
            f"Centroids not found at {centroids_path}. "
            "Run the export cell in Final_Working_POC.ipynb after building spatial_centroids."
        )

    archive = np.load(centroids_path)
    return {key: archive[key] for key in archive.files}


def load_model(settings_obj: Settings) -> tuple[VibeEncoder, dict[str, np.ndarray], pd.DataFrame, torch.device]:
    device = torch.device(settings_obj.device)
    cities_df = load_cities_lookup(settings_obj.cities_csv_path)
    centroids = load_centroids(settings_obj.centroids_path)
    encoder = VibeEncoder(device=device)
    return encoder, centroids, cities_df, device


def _cosine_to_score(cosine: float) -> float:
    return round(float(np.clip(cosine, 0.0, 1.0) * 100), 1)


@torch.inference_mode()
def predict(
    image_bytes: bytes,
    model: VibeEncoder,
    centroids: dict[str, np.ndarray],
    cities_df: pd.DataFrame,
    device: torch.device,
    top_k: int | None = None,
) -> list[CityResult]:
    top_k = top_k or settings.top_k

    query_vector = model.compute_global_descriptor(image_bytes)
    if query_vector is None:
        raise ValueError("Could not extract features from image")

    query_np = query_vector.detach().cpu().numpy().reshape(1, -1)

    scores: list[tuple[str, float]] = []
    for city_id, centroid in centroids.items():
        if city_id not in cities_df.index:
            continue
        cosine = cosine_similarity(query_np, centroid.reshape(1, -1))[0][0]
        scores.append((city_id, float(cosine)))

    scores.sort(key=lambda item: item[1], reverse=True)

    results: list[CityResult] = []
    for city_id, cosine in scores[:top_k]:
        row = cities_df.loc[city_id]
        results.append(
            CityResult(
                city=str(row["city"]),
                country=str(row["country"]),
                score=_cosine_to_score(cosine),
                lat=float(row["lat"]),
                lng=float(row["lng"]),
            )
        )

    if not results:
        raise ValueError("No matching cities found in cities.csv for saved centroids")

    return results
