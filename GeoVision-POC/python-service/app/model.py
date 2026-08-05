import io
from pathlib import Path

import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
from PIL import Image, ImageOps, UnidentifiedImageError
from transformers import AutoImageProcessor, AutoModel


class ProjectionHead(nn.Module):
    """Projection architecture used by the DINOv2 + SupCon model."""

    def __init__(
        self,
        input_dim: int = 768,
        hidden_dim: int = 512,
        output_dim: int = 128,
    ) -> None:
        super().__init__()
        self.network = nn.Sequential(
            nn.LayerNorm(input_dim),
            nn.Linear(input_dim, hidden_dim),
            nn.GELU(),
            nn.Dropout(0.10),
            nn.Linear(hidden_dim, output_dim),
        )

    def forward(self, features: torch.Tensor) -> torch.Tensor:
        return F.normalize(self.network(features), dim=1)


def select_device(requested: str) -> torch.device:
    if requested == "auto":
        return torch.device("cuda" if torch.cuda.is_available() else "cpu")
    device = torch.device(requested)
    if device.type == "cuda" and not torch.cuda.is_available():
        raise RuntimeError("DEVICE requests CUDA, but CUDA is unavailable")
    return device


class DinoV2SupConEncoder:
    """Frozen DINOv2 CLS encoder followed by the trained SupCon head."""

    def __init__(
        self,
        checkpoint_path: Path,
        backbone_name: str,
        requested_device: str,
        image_size: int = 224,
    ) -> None:
        if not checkpoint_path.exists():
            raise FileNotFoundError(
                f"DINOv2 + SupCon checkpoint not found: {checkpoint_path}"
            )

        self.device = select_device(requested_device)
        self.image_size = image_size
        checkpoint = torch.load(
            checkpoint_path,
            map_location="cpu",
            weights_only=False,
        )

        required = {
            "projection_head_state",
            "fingerprint",
            "input_dim",
            "hidden_dim",
            "output_dim",
            "best_epoch",
            "best_validation",
        }
        missing = required - set(checkpoint)
        if missing:
            raise ValueError(
                "DINOv2 + SupCon checkpoint is missing: "
                f"{sorted(missing)}"
            )

        self.fingerprint = dict(checkpoint["fingerprint"])
        self.output_dim = int(checkpoint["output_dim"])
        self.best_epoch = int(checkpoint["best_epoch"])
        best_validation = dict(checkpoint["best_validation"])
        if self.best_epoch != int(best_validation["epoch"]):
            raise ValueError(
                "Checkpoint best_epoch does not match best_validation epoch"
            )

        self.projection = ProjectionHead(
            input_dim=int(checkpoint["input_dim"]),
            hidden_dim=int(checkpoint["hidden_dim"]),
            output_dim=self.output_dim,
        )
        self.projection.load_state_dict(
            checkpoint["projection_head_state"],
            strict=True,
        )
        self.projection.to(self.device).eval()

        # Match the notebook call exactly so preprocessing cannot drift.
        self.processor = AutoImageProcessor.from_pretrained(backbone_name)
        self.backbone = AutoModel.from_pretrained(backbone_name)
        self.backbone.to(self.device).eval()
        for parameter in self.backbone.parameters():
            parameter.requires_grad = False

    @torch.inference_mode()
    def encode(self, image_bytes: bytes) -> np.ndarray:
        try:
            image = Image.open(io.BytesIO(image_bytes))
            image = ImageOps.exif_transpose(image).convert("RGB")
        except (UnidentifiedImageError, OSError) as exc:
            raise ValueError("Uploaded file is not a readable image") from exc

        pixels = self.processor(
            images=image,
            return_tensors="pt",
            size={"height": self.image_size, "width": self.image_size},
        )["pixel_values"]

        if tuple(pixels.shape[-2:]) != (
            self.image_size,
            self.image_size,
        ):
            raise RuntimeError(
                f"Unexpected processor output: {tuple(pixels.shape)}"
            )

        hidden = self.backbone(
            pixel_values=pixels.to(self.device)
        ).last_hidden_state
        cls_features = hidden[:, 0].float()
        return self.projection(cls_features).cpu().numpy()
