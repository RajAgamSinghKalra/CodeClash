from fastapi import FastAPI, WebSocket
from ultralytics import YOLO
import cv2
import numpy as np
import base64

app = FastAPI()
model = YOLO("/home/agam/Downloads/codeclash/git/server/best.pt")  # your trained checkpoint

@app.websocket("/detect")
async def detect(ws: WebSocket):
    await ws.accept()
    while True:
        jpg_b64 = await ws.receive_text()
        jpg = base64.b64decode(jpg_b64)
        img = cv2.imdecode(np.frombuffer(jpg, np.uint8), cv2.IMREAD_COLOR)
        res = model.predict(img, conf=0.25, verbose=False)[0]
        detections = [
            {
                "cls": int(b.cls),
                "x1": float(b.xyxy[0][0]),
                "y1": float(b.xyxy[0][1]),
                "x2": float(b.xyxy[0][2]),
                "y2": float(b.xyxy[0][3]),
            }
            for b in res.boxes
        ]
        await ws.send_json(detections)
