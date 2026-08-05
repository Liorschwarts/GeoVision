from contextlib import asynccontextmanager
from typing import Annotated

from fastapi import FastAPI, File, HTTPException, UploadFile

from app.config import settings
from app.predict import GeoVisionRuntime, load_runtime, predict
from app.schemas import HealthResponse, ModelInfo, PredictResponse

_runtime: GeoVisionRuntime | None = None


def get_runtime() -> GeoVisionRuntime:
    if _runtime is None:
        raise HTTPException(
            status_code=503,
            detail="Model service is not ready",
        )
    return _runtime


@asynccontextmanager
async def lifespan(_: FastAPI):
    global _runtime
    _runtime = load_runtime(settings)
    yield
    _runtime = None


app = FastAPI(
    title="GeoVision DINOv2 + SupCon Model Service",
    version="2.0.0",
    lifespan=lifespan,
)


@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    runtime = get_runtime()
    info = runtime.model_info
    return HealthResponse(
        status="ok",
        model=info.model,
        city_count=info.city_count,
        fingerprint=info.fingerprint,
    )


@app.get("/model-info", response_model=ModelInfo)
def model_info() -> ModelInfo:
    return get_runtime().model_info


@app.post("/predict", response_model=PredictResponse)
async def predict_endpoint(
    image: Annotated[UploadFile, File(description="Image to analyze")],
) -> PredictResponse:
    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail="Uploaded file must be an image",
        )

    maximum = settings.max_upload_mb * 1024 * 1024
    image_bytes = await image.read(maximum + 1)
    if not image_bytes:
        raise HTTPException(status_code=400, detail="Empty image file")
    if len(image_bytes) > maximum:
        raise HTTPException(
            status_code=413,
            detail=f"Image exceeds {settings.max_upload_mb} MB",
        )

    try:
        results = predict(
            image_bytes=image_bytes,
            runtime=get_runtime(),
            top_k=settings.top_k,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail="Inference failed",
        ) from exc

    return PredictResponse(results=results)
