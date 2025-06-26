#!/usr/bin/env python3
"""Simple YOLOv8 inference script for local testing.

Runs object detection on a single image using the trained model and your GPU.
The results image with bounding boxes can be saved if an output path is
provided.

Example:
    python detect_local.py path/to/image.jpg -o output.jpg
"""

import argparse
from pathlib import Path
import cv2
from ultralytics import YOLO

# Locate the checkpoint that ships with the repository
MODEL_PATH = Path(__file__).with_name("best.pt")


def run_detection(img_path: Path, out_path: Path | None = None, device: int = 0):
    """Run YOLOv8 on ``img_path`` using ``device`` (0=GPU) and optionally save."""
    model = YOLO(str(MODEL_PATH))
    result = model.predict(source=str(img_path), device=device, conf=0.25, verbose=False)[0]

    if out_path:
        out_path.parent.mkdir(parents=True, exist_ok=True)
        cv2.imwrite(str(out_path), result.plot())
    else:
        for b in result.boxes:
            cls = int(b.cls)
            conf = float(b.conf)
            xyxy = [float(x) for x in b.xyxy[0]]
            print({"cls": cls, "conf": conf, "xyxy": xyxy})


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Run YOLOv8 on a single image")
    parser.add_argument("image", type=Path, help="Path to image file")
    parser.add_argument("-o", "--output", type=Path, help="Optional output image")
    parser.add_argument("--device", type=int, default=0, help="Device index for inference (GPU=0, CPU=-1)")
    args = parser.parse_args()

    run_detection(args.image, args.output, args.device)
