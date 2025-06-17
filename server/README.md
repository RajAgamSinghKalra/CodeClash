# YOLOv8 Detection Server

This folder contains a lightweight WebSocket server that runs YOLOv8
object detection. The server expects base64-encoded JPEG images from a
client and returns detection results as JSON.

## Usage

Install dependencies from the project root:

```bash
pip install -r requirements.txt
```

Run the server (downloads YOLOv8 weights on first launch):

```bash
python server/server.py
```

The server listens on port `8765`. Each message from the client should
be a base64 string representing an image. The reply is a JSON array of
detections with class names, confidences, and normalized bounding box
coordinates.
