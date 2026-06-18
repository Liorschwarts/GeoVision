from contextlib import asynccontextmanager
from typing import Annotated

from fastapi import FastAPI, File, HTTPException, UploadFile

from app.config import settings
from app.predict import load_model, predict
from app.schemas import PredictResponse

_encoder = None
_centroids = None
_cities_df = None
_device = None


@asynccontextmanager
async def lifespan(_: FastAPI):
    global _encoder, _centroids, _cities_df, _device
    _encoder, _centroids, _cities_df, _device = load_model(settings)
    yield


app = FastAPI(title="GeoVision Model Service", lifespan=lifespan)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/predict", response_model=PredictResponse)
async def predict_endpoint(
    image: Annotated[UploadFile, File(description="Image to analyze")],
) -> PredictResponse:
    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be an image")

    image_bytes = await image.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="Empty image file")

    try:
        results = predict(
            image_bytes=image_bytes,
            model=_encoder,
            centroids=_centroids,
            cities_df=_cities_df,
            device=_device,
            top_k=settings.top_k,
        )
    except FileNotFoundError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Inference failed: {exc}") from exc

    return PredictResponse(results=results)
