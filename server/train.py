"""Simple training script for YOLOv8 using synthetic data."""

from pathlib import Path
from ultralytics import YOLO


def train(data_dir: str, model: str = "yolov8n.pt", epochs: int = 50):
    """Fine-tune YOLOv8 on a custom dataset."""
    data_yaml = Path(data_dir) / "data.yaml"
    if not data_yaml.exists():
        raise FileNotFoundError(f"{data_yaml} not found")
    yolov8 = YOLO(model)
    yolov8.train(data=str(data_yaml), epochs=epochs)


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Train YOLOv8 on custom data")
    parser.add_argument("data_dir", help="Directory containing data.yaml and images")
    parser.add_argument("--model", default="yolov8n.pt", help="Base model weights")
    parser.add_argument("--epochs", type=int, default=50)
    args = parser.parse_args()

    train(args.data_dir, args.model, args.epochs)
