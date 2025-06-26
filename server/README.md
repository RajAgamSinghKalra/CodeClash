# YOLOv8 Detection Server

This directory contains the FastAPI backend that performs object detection. When started with `uvicorn`, the server also serves the website located in `../web`.

## Usage

Install dependencies from the project root and run the server:

```bash
pip install -r requirements.txt
uvicorn server.fastapi_server:app --host 0.0.0.0 --port 8000
```

Open `http://<server-ip>:8000` in a browser. The `/api/detect` endpoint accepts image uploads via POST and `/ws` provides a WebSocket interface for real-time streaming.
