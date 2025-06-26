# YOLOv8 Detection Web Service

This project provides a simple FastAPI backend that performs object detection with YOLOv8 on an Ubuntu machine with ROCm GPU acceleration. A lightweight website served from the `web/` directory allows you to upload images and view detection results.

## Components

* `server/` – FastAPI service performing YOLOv8 inference via HTTP or WebSocket.
* `web/` – Placeholder directory for your website files. `index.html` demonstrates uploading an image.
* `requirements.txt` – Python package list for the server environment.

## Quick start

1. Install Python packages:
   ```bash
   pip install -r requirements.txt
   ```
2. Start the server:
   ```bash
   uvicorn server.fastapi_server:app --host 0.0.0.0 --port 8000
   ```
3. Open `http://<server-ip>:8000` in your browser and upload an image to test detection.

Place your training dataset under `server/data/` with a `data.yaml` file. The files `server/train.py` and `server/predict.py` contain example scripts you can adapt for training and evaluation on your ROCm GPU.
