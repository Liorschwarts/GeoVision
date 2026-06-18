from pydantic import BaseModel, Field


class CityResult(BaseModel):
    city: str
    country: str
    score: float = Field(ge=0, le=100)
    lat: float
    lng: float


class PredictResponse(BaseModel):
    results: list[CityResult]
