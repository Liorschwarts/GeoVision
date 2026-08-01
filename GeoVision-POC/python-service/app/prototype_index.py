import json
from dataclasses import dataclass
from pathlib import Path

import numpy as np


def l2_normalize(values: np.ndarray, eps: float = 1e-12) -> np.ndarray:
    values = np.asarray(values, dtype=np.float32)
    norms = np.linalg.norm(values, axis=-1, keepdims=True)
    return values / np.maximum(norms, eps)


@dataclass(frozen=True)
class PrototypeIndex:
    prototypes: np.ndarray
    prototype_city: np.ndarray
    city_names: list[str]
    metadata: dict

    @classmethod
    def load(cls, path: Path) -> "PrototypeIndex":
        if not path.exists():
            raise FileNotFoundError(f"Prototype index not found: {path}")

        with np.load(path, allow_pickle=False) as payload:
            required = {"prototypes", "prototype_city", "city_names"}
            missing = required - set(payload.files)
            if missing:
                raise ValueError(
                    f"Prototype index is missing: {sorted(missing)}"
                )

            metadata = (
                json.loads(str(payload["metadata"].item()))
                if "metadata" in payload.files
                else {}
            )
            prototypes = l2_normalize(payload["prototypes"])
            owners = np.asarray(
                payload["prototype_city"],
                dtype=np.int64,
            )
            city_names = payload["city_names"].astype(str).tolist()

        if len(prototypes) != len(owners):
            raise ValueError("Prototype and owner counts do not match")
        if not city_names:
            raise ValueError("Prototype index contains no cities")
        if owners.min(initial=0) < 0 or owners.max(initial=-1) >= len(city_names):
            raise ValueError("Prototype index contains an invalid city owner")
        if set(owners.tolist()) != set(range(len(city_names))):
            raise ValueError("Every indexed city must own at least one prototype")
        if not np.isfinite(prototypes).all():
            raise ValueError("Prototype index contains non-finite values")

        return cls(prototypes, owners, city_names, metadata)

    @property
    def fingerprint(self) -> dict:
        value = self.metadata.get("fingerprint")
        if not isinstance(value, dict):
            raise ValueError("Prototype index fingerprint is missing")
        return value

    def city_scores(self, embeddings: np.ndarray) -> np.ndarray:
        similarities = l2_normalize(embeddings) @ self.prototypes.T
        scores = np.full(
            (len(similarities), len(self.city_names)),
            -np.inf,
            dtype=np.float32,
        )
        for city_id in range(len(self.city_names)):
            scores[:, city_id] = similarities[
                :,
                self.prototype_city == city_id,
            ].max(axis=1)
        return scores
