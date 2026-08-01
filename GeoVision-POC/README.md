# GeoVision POC

The POC connects the React interface to the approved GeoVision Option 2 model:

```text
React -> Express /api/analyze -> FastAPI /predict
      -> frozen DINOv2 Base -> SupCon projection head
      -> four prototypes per city -> Top-5 city matches
```

No database is required. Uploaded images are processed in memory, and browser
history remains local to the frontend.

## Model bundle

`python-service/models/option2/` is a replaceable bundle:

- `checkpoint.pth` — trained 768→512→128 projection head.
- `prototype_index.npz` — four prototypes per city plus the dataset fingerprint.
- `config.json` — backbone and training configuration.
- `cities.csv` — country and map coordinates for every indexed city.

The service refuses to start if checkpoint epochs, fingerprints, dimensions, or
city names disagree. The current bundle is the verified 21-city development
run. After the final 40-city run, replace all four files together; the frontend
and API do not change.

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
a similarity score, not a calibrated probability or confidence estimate.

## Run services without Docker

Start the Python service from `python-service`:

```bash
python -m pip install -r requirements.txt
python run.py
```

Then start the Express backend and Vite frontend in their respective folders.
