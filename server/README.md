# YOLOv8 Detection Server

This folder contains a FastAPI WebSocket server that runs YOLOv8 object detection. Clients send base64-encoded JPEG images and receive detection results as JSON.

## Usage

Install dependencies from the project root:

```bash
pip install -r requirements.txt
```

Run the server (downloads YOLOv8 weights on first launch):

```bash
uvicorn server.fastapi_server:app --host 0.0.0.0 --port 8000
```

The server exposes a WebSocket endpoint at `/detect`. Send a base64 JPEG string and you will receive a JSON array of detections with class IDs and pixel coordinates.
