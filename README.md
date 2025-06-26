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
2. Start the server (uses the bundled `best.pt` and runs on CPU by default):
   ```bash
   uvicorn server.fastapi_server:app --host 0.0.0.0 --port 8000
   ```
3. Open `http://<server-ip>:8000` in your browser and upload an image to test detection.

4. (Optional) Run the React frontend in development mode. From `web/frontend`:
   ```bash
   yarn install
   REACT_APP_BACKEND_URL=http://localhost:8000 yarn start
   ```

   The app will open at `http://localhost:3000` and connect to the FastAPI backend for live detection.

   To create a production build served by FastAPI, run:
   ```bash
   yarn build
   cp -r build/* ..
   ```

Place your training dataset under `server/data/` with a `data.yaml` file. The files `server/train.py` and `server/predict.py` contain example scripts you can adapt for training and evaluation on your ROCm GPU.

## Offline GPU inference

If you want to run the trained model locally without starting the FastAPI server,
use the helper script `server/detect_local.py`. It performs detection on a single
image using your GPU and optionally saves the annotated result.

```bash
python server/detect_local.py path/to/image.jpg -o output.jpg
```

Use `--device -1` to run on CPU if a GPU is not available.
