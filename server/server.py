import asyncio
import base64
import json
from io import BytesIO

import cv2
import numpy as np
from ultralytics import YOLO
from websockets import serve


class YoloDetector:
    """Wraps a YOLOv8 model for easy prediction."""

    def __init__(self, weights: str = "yolov8n.pt"):
        self.model = YOLO(weights)
        self.names = self.model.model.names

    def predict(self, img: np.ndarray):
        """Run inference on an image array and return detection dicts."""
        results = self.model.predict(img, verbose=False)[0]
        detections = []
        h, w = img.shape[:2]
        for box in results.boxes:
            x1, y1, x2, y2 = box.xyxy[0].tolist()
            detections.append({
                "class": self.names[int(box.cls[0])],
                "confidence": float(box.conf[0]),
                "bbox": [x1 / w, y1 / h, x2 / w, y2 / h],
            })
        return detections


detector = YoloDetector()


async def handle_connection(websocket):
    async for message in websocket:
        # Expect base64-encoded image bytes
        img_bytes = base64.b64decode(message)
        data = np.frombuffer(img_bytes, dtype=np.uint8)
        frame = cv2.imdecode(data, cv2.IMREAD_COLOR)
        if frame is None:
            await websocket.send(json.dumps({"error": "bad_image"}))
            continue
        detections = detector.predict(frame)
        await websocket.send(json.dumps(detections))


def main(host="0.0.0.0", port=8765):
    loop = asyncio.get_event_loop()
    ws_server = serve(handle_connection, host, port)
    loop.run_until_complete(ws_server)
    print(f"Server listening on ws://{host}:{port}")
    loop.run_forever()


if __name__ == "__main__":
    main()
