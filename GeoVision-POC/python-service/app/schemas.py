from typing import Any

from pydantic import BaseModel, Field


class CityResult(BaseModel):
    city: str
    country: str
    score: float = Field(ge=0, le=100)
    cosine_similarity: float = Field(ge=-1, le=1)
    lat: float = Field(ge=-90, le=90)
    lng: float = Field(ge=-180, le=180)


class PredictResponse(BaseModel):
    results: list[CityResult]


class ModelInfo(BaseModel):
    model: str
    fingerprint: dict[str, Any]
    city_count: int
    prototype_count: int
    embedding_dim: int
    best_epoch: int
    device: str


class HealthResponse(BaseModel):
    status: str
    model: str
    city_count: int
    fingerprint: dict[str, Any]
