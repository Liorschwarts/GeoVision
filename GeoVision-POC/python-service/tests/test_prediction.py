import unittest

import numpy as np

from app.predict import (
    CityMetadata,
    GeoVisionRuntime,
    cosine_to_display_score,
    predict,
)
from app.prototype_index import PrototypeIndex


class FakeEncoder:
    fingerprint = {"dataset_name": "test", "city_count": 2}
    output_dim = 2
    best_epoch = 1
    device = "cpu"

    def __init__(self, embedding: np.ndarray) -> None:
        self.embedding = embedding

    def encode(self, image_bytes: bytes) -> np.ndarray:
        if not image_bytes:
            raise ValueError("Image bytes are required")
        return self.embedding


class PredictionTests(unittest.TestCase):
    def setUp(self) -> None:
        index = PrototypeIndex(
            prototypes=np.asarray(
                [
                    [1.0, 0.0],
                    [0.8, 0.2],
                    [0.0, 1.0],
                    [0.2, 0.8],
                ],
                dtype=np.float32,
            ),
            prototype_city=np.asarray([0, 0, 1, 1]),
            city_names=["Alpha", "Beta"],
            metadata={"fingerprint": FakeEncoder.fingerprint},
        )
        self.runtime = GeoVisionRuntime(
            encoder=FakeEncoder(
                np.asarray([[1.0, 0.0]], dtype=np.float32)
            ),
            index=index,
            cities={
                "Alpha": CityMetadata("AA", 10.0, 20.0),
                "Beta": CityMetadata("BB", 30.0, 40.0),
            },
            model_name="test-model",
        )

    def test_prediction_uses_max_prototype_score_and_stable_order(self) -> None:
        results = predict(b"image", self.runtime, top_k=2)

        self.assertEqual(
            [result.city for result in results],
            ["Alpha", "Beta"],
        )
        self.assertEqual(results[0].score, 100.0)
        self.assertAlmostEqual(results[0].cosine_similarity, 1.0)
        self.assertEqual(results[0].country, "AA")

    def test_top_k_is_capped_by_city_count(self) -> None:
        results = predict(b"image", self.runtime, top_k=99)
        self.assertEqual(len(results), 2)
        self.assertEqual(len({result.city for result in results}), 2)

    def test_display_score_is_clipped_and_not_a_probability(self) -> None:
        self.assertEqual(cosine_to_display_score(-0.5), 0.0)
        self.assertEqual(cosine_to_display_score(0.456), 45.6)
        self.assertEqual(cosine_to_display_score(2.0), 100.0)


if __name__ == "__main__":
    unittest.main()
