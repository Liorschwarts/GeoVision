# GeoVision

GeoVision connects the React interface to the selected DINOv2 + SupCon model:

```text
React -> Express /api/analyze -> FastAPI /predict
      -> frozen DINOv2 Base -> SupCon projection head
      -> four prototypes per city -> Top-5 city matches
```

No database is required. Uploaded images are processed in memory, and browser
history remains local to the frontend.

## Model bundle

`python-service/models/dinov2_supcon/final/` contains the deployed bundle:

- `checkpoint.pth` — trained 768→512→128 projection head.
- `prototype_index.npz` — four prototypes per city and the training fingerprint.
- `config.json` — backbone and training configuration.
- `cities.csv` — country and map coordinates for all 39 indexed cities.

The service refuses to start if checkpoint epochs, fingerprints, dimensions, or
city names disagree. Prototype similarities are aggregated into one score per
city before the API returns the five highest-scoring distinct cities.

## Run with Docker

From `GeoVision-POC`:

```bash
docker compose up --build
```

The first start downloads `facebook/dinov2-base` into the persistent
`huggingface-cache` Docker volume. Open `http://localhost` for the UI.

Useful endpoints:

- `GET http://localhost:3001/api/health`
- `GET http://localhost:3001/api/model-info`
- `POST http://localhost:3001/api/analyze` with multipart field `image`

The displayed score is non-negative cosine similarity multiplied by 100. It is
a visual similarity score, not a calibrated probability or confidence estimate.

## Run services without Docker

Start the Python service from `python-service`:

```bash
python -m pip install -r requirements.txt
python run.py
```

Then start the Express backend and Vite frontend in their respective folders.
