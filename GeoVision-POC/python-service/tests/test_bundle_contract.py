import csv
import json
import unittest
import zipfile
from pathlib import Path

import numpy as np

from app.prototype_index import PrototypeIndex


SERVICE_DIR = Path(__file__).resolve().parents[1]
BUNDLE_DIR = SERVICE_DIR / "models" / "option2"


class BundleContractTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.index = PrototypeIndex.load(
            BUNDLE_DIR / "prototype_index.npz"
        )
        with (BUNDLE_DIR / "config.json").open(encoding="utf-8") as handle:
            cls.config = json.load(handle)
        with (BUNDLE_DIR / "cities.csv").open(
            encoding="utf-8",
            newline="",
        ) as handle:
            cls.city_rows = list(csv.DictReader(handle))

    def test_bundle_files_exist(self) -> None:
        for name in (
            "checkpoint.pth",
            "prototype_index.npz",
            "config.json",
            "cities.csv",
        ):
            self.assertTrue((BUNDLE_DIR / name).is_file(), name)

    def test_checkpoint_is_a_valid_torch_archive(self) -> None:
        self.assertTrue(
            zipfile.is_zipfile(BUNDLE_DIR / "checkpoint.pth")
        )

    def test_index_matches_training_configuration(self) -> None:
        output_dim = int(self.config["training"]["output_dim"])
        prototypes_per_city = int(
            self.config["shared"]["prototypes_per_city"]
        )
        self.assertEqual(self.index.prototypes.shape[1], output_dim)
        counts = np.bincount(self.index.prototype_city)
        self.assertTrue(np.all(counts == prototypes_per_city))

    def test_metadata_matches_index_exactly(self) -> None:
        metadata_cities = [row["city"] for row in self.city_rows]
        self.assertEqual(
            sorted(metadata_cities),
            sorted(self.index.city_names),
        )
        self.assertEqual(len(metadata_cities), len(set(metadata_cities)))

    def test_prototype_self_query_ranks_its_city_first(self) -> None:
        for city_id in range(len(self.index.city_names)):
            prototype = self.index.prototypes[
                self.index.prototype_city == city_id
            ][0:1]
            scores = self.index.city_scores(prototype)[0]
            self.assertEqual(int(np.argmax(scores)), city_id)

    def test_bundle_fingerprint_matches_bundle_contents(self) -> None:
        fingerprint = self.index.fingerprint
        self.assertEqual(
            fingerprint["dataset_name"],
            self.config["shared"]["dataset_name"],
        )
        self.assertEqual(
            fingerprint["city_count"],
            len(self.index.city_names),
        )
        self.assertGreaterEqual(
            fingerprint["image_count"],
            fingerprint["city_count"],
        )
        self.assertTrue(fingerprint["split_fingerprint"])


if __name__ == "__main__":
    unittest.main()
