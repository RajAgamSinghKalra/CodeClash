# Cross-Platform AR Object Spotter

This project is a starting point for an Unreal Engine application that streams camera frames to a YOLOv8 server. The Python service runs on an Ubuntu machine with ROCm GPU acceleration and returns bounding boxes that the client overlays in real time.

## Components

* `server/` – FastAPI WebSocket service running YOLOv8 inference.
* `unreal/` – Example files for integrating detection results inside Unreal Engine.
* `requirements.txt` – Python package list for the server environment.

## Quick start

1. Install Python packages:
   ```bash
   pip install -r requirements.txt
   ```
2. Run the detection server:
   ```bash
   uvicorn server.fastapi_server:app --host 0.0.0.0 --port 8000
   ```
3. Build the Unreal project for Android or Windows and send JPEG frames to `/detect`.

Place your training dataset under `server/data/` with a `data.yaml` file. The files `server/train.py` and `server/predict.py` are empty placeholders where you can add your own training and evaluation code.
