import io

import torch
import torch.nn as nn
from PIL import Image
from torchvision import models, transforms


class VibeEncoder(nn.Module):

    def __init__(self, device: torch.device) -> None:
        super().__init__()
        self.backbone = models.resnet50(weights=models.ResNet50_Weights.IMAGENET1K_V2)
        self.backbone.fc = nn.Identity()
        self.device = device
        self.to(self.device).eval()

        self.pipeline = transforms.Compose(
            [
                transforms.ToTensor(),
                transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
            ]
        )

    @torch.inference_mode()
    def compute_global_descriptor(self, image_bytes: bytes) -> torch.Tensor | None:
        """Mean-pooled embedding via 224x224 patch tesselation."""
        try:
            img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
            width, height = img.size
            patches: list[torch.Tensor] = []

            for y in range(0, height - 224 + 1, 224):
                for x in range(0, width - 224 + 1, 224):
                    bounding_box = (x, y, x + 224, y + 224)
                    patches.append(self.pipeline(img.crop(bounding_box)))

            if not patches:
                resized = img.resize((224, 224))
                patches.append(self.pipeline(resized))

            batch_tensor = torch.stack(patches).to(self.device)
            local_features = self.backbone(batch_tensor)
            return torch.mean(local_features, dim=0)
        except Exception:
            return None
