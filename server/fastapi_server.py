from pathlib import Path
from fastapi import FastAPI, WebSocket, UploadFile, File
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from ultralytics import YOLO
import torch
import cv2
import numpy as np
import base64
import asyncio

# Paths
REPO_ROOT = Path(__file__).resolve().parents[1]
WEB_DIR = REPO_ROOT / "web"
MODEL_PATH = Path(__file__).with_name("best.pt")

app = FastAPI()
app.mount("/static", StaticFiles(directory=WEB_DIR), name="static")

@app.get("/")
async def get_index():
    index_path = WEB_DIR / "index.html"
    if not index_path.is_file():
        index_path = WEB_DIR / "frontend" / "public" / "index.html"
    return FileResponse(index_path)

DEVICE = 0 if torch.cuda.is_available() else "cpu"
model = YOLO(str(MODEL_PATH))
if DEVICE != "cpu":
    model.to(DEVICE)

@app.post("/api/detect")
async def api_detect(file: UploadFile = File(...)):
    data = await file.read()
    img = cv2.imdecode(np.frombuffer(data, np.uint8), cv2.IMREAD_COLOR)
    res = model.predict(img, conf=0.25, verbose=False, device=DEVICE)[0]
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
    return {"detections": detections}

@app.websocket("/ws")
async def ws_detect(ws: WebSocket):
    await ws.accept()
    while True:
        data = await ws.receive_text()
        header, b64 = data.split(",", 1) if "," in data else ("", data)
        jpg = base64.b64decode(b64)
        img = cv2.imdecode(np.frombuffer(jpg, np.uint8), cv2.IMREAD_COLOR)
        res = model.predict(img, conf=0.25, verbose=False, device=DEVICE)[0]
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
        await asyncio.sleep(0.066)
