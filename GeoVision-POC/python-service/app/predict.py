from __future__ import annotations

import csv
import json
from dataclasses import dataclass
from pathlib import Path

import numpy as np

from app.config import Settings
from app.model import Option2Encoder
from app.prototype_index import PrototypeIndex
from app.schemas import CityResult, ModelInfo


@dataclass(frozen=True)
class CityMetadata:
    country: str
    lat: float
    lng: float


@dataclass(frozen=True)
class GeoVisionRuntime:
    encoder: Option2Encoder
    index: PrototypeIndex
    cities: dict[str, CityMetadata]
    model_name: str

    @property
    def model_info(self) -> ModelInfo:
        return ModelInfo(
            model=self.model_name,
            fingerprint=self.index.fingerprint,
            city_count=len(self.index.city_names),
            prototype_count=len(self.index.prototypes),
            embedding_dim=int(self.index.prototypes.shape[1]),
            best_epoch=self.encoder.best_epoch,
            device=str(self.encoder.device),
        )


def load_training_config(path: Path) -> dict:
    if not path.exists():
        raise FileNotFoundError(f"Training config not found: {path}")
    with path.open(encoding="utf-8") as handle:
        config = json.load(handle)
    if "shared" not in config or "training" not in config:
        raise ValueError("Training config has an invalid structure")
    return config


def load_city_metadata(path: Path) -> dict[str, CityMetadata]:
    if not path.exists():
        raise FileNotFoundError(f"City metadata not found: {path}")

    with path.open(encoding="utf-8", newline="") as handle:
        reader = csv.DictReader(handle)
        required = {"city", "country", "lat", "lng"}
        missing = required - set(reader.fieldnames or [])
        if missing:
            raise ValueError(
                f"cities.csv is missing columns: {sorted(missing)}"
            )

        cities: dict[str, CityMetadata] = {}
        for row in reader:
            city = row["city"].strip()
            if not city:
                raise ValueError("cities.csv contains a blank city")
            if city in cities:
                raise ValueError(f"Duplicate city metadata: {city}")
            cities[city] = CityMetadata(
                country=row["country"].strip(),
                lat=float(row["lat"]),
                lng=float(row["lng"]),
            )
    return cities


def load_runtime(settings: Settings) -> GeoVisionRuntime:
    training_config = load_training_config(settings.training_config_path)
    shared_config = training_config["shared"]
    model_config = training_config["training"]

    encoder = Option2Encoder(
        checkpoint_path=settings.checkpoint_path,
        backbone_name=str(shared_config["backbone_name"]),
        requested_device=settings.device,
        image_size=int(shared_config["image_size"]),
    )
    index = PrototypeIndex.load(settings.prototype_index_path)
    cities = load_city_metadata(settings.cities_path)

    if encoder.fingerprint != index.fingerprint:
        raise ValueError(
            "Checkpoint and prototype index fingerprints do not match"
        )
    if index.prototypes.shape[1] != encoder.output_dim:
        raise ValueError(
            "Prototype dimension does not match projection output dimension"
        )
    if int(model_config["output_dim"]) != encoder.output_dim:
        raise ValueError(
            "Training config output dimension does not match checkpoint"
        )

    indexed_cities = set(index.city_names)
    metadata_cities = set(cities)
    if indexed_cities != metadata_cities:
        missing = sorted(indexed_cities - metadata_cities)
        extra = sorted(metadata_cities - indexed_cities)
        raise ValueError(
            "City metadata does not match prototype index; "
            f"missing={missing}, extra={extra}"
        )

    return GeoVisionRuntime(
        encoder=encoder,
        index=index,
        cities=cities,
        model_name=(
            "Option 2 - frozen DINOv2 Base + 768-512-128 SupCon"
        ),
    )


def cosine_to_display_score(cosine: float) -> float:
    """Display non-negative cosine similarity on a 0-100 scale."""

    return round(float(np.clip(cosine, 0.0, 1.0) * 100.0), 1)


def predict(
    image_bytes: bytes,
    runtime: GeoVisionRuntime,
    top_k: int,
) -> list[CityResult]:
    embedding = runtime.encoder.encode(image_bytes).numpy()
    scores = runtime.index.city_scores(embedding)[0]
    count = min(top_k, len(runtime.index.city_names))
    order = np.argsort(-scores, kind="stable")[:count]

    results = []
    for city_id in order:
        city = runtime.index.city_names[int(city_id)]
        metadata = runtime.cities[city]
        cosine = float(scores[int(city_id)])
        results.append(
            CityResult(
                city=city,
                country=metadata.country,
                score=cosine_to_display_score(cosine),
                cosine_similarity=cosine,
                lat=metadata.lat,
                lng=metadata.lng,
            )
        )
    return results
