from __future__ import annotations

import base64
import json
import logging
import os
import uuid
from datetime import datetime
from pathlib import Path
from typing import List

import asyncio

import cv2
import numpy as np
from dotenv import load_dotenv
from fastapi import APIRouter, FastAPI, File, UploadFile, WebSocket
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field
from starlette.middleware.cors import CORSMiddleware
from ultralytics import YOLO
import torch

# --- Paths and environment ----------------------------------------------------
REPO_ROOT = Path(__file__).resolve().parents[1]
WEB_DIR = REPO_ROOT / "web"
MODEL_PATH = REPO_ROOT / "server" / "best.pt"
load_dotenv(REPO_ROOT / ".env")

# --- Database ----------------------------------------------------------------
mongo_url = os.getenv("MONGO_URL", "mongodb://localhost:27017")
client = AsyncIOMotorClient(mongo_url)
db = client[os.getenv("DB_NAME", "codeclash")]

# --- FastAPI setup ------------------------------------------------------------
app = FastAPI(title="CodeClash API")
api = APIRouter(prefix="/api")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic models ----------------------------------------------------------
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

# --- REST routes --------------------------------------------------------------
@api.get("/")
async def root() -> dict[str, str]:
    return {"message": "Hello World"}

@api.post("/status", response_model=StatusCheck)
async def create_status_check(body: StatusCheckCreate) -> StatusCheck:
    doc = StatusCheck(**body.dict())
    await db.status_checks.insert_one(doc.dict())
    return doc

@api.get("/status", response_model=List[StatusCheck])
async def get_status_checks() -> List[StatusCheck]:
    cursor = db.status_checks.find()
    return [StatusCheck(**d) async for d in cursor]

# --- YOLOv8 model -------------------------------------------------------------
yolo_device = 0 if torch.cuda.is_available() else "cpu"
yolo = YOLO(str(MODEL_PATH))
if yolo_device != "cpu":
    yolo.to(yolo_device)

@api.post("/detect")
async def api_detect(file: UploadFile = File(...)) -> dict[str, List[dict]]:
    data = await file.read()
    img = cv2.imdecode(np.frombuffer(data, np.uint8), cv2.IMREAD_COLOR)
    res = yolo.predict(img, verbose=False, device=yolo_device)[0]
    dets = [
        {
            "bbox": list(map(int, xyxy)),
            "conf": round(float(conf), 4),
            "cls": int(cls),
        }
        for xyxy, conf, cls in zip(
            res.boxes.xyxy.cpu().numpy(),
            res.boxes.conf.cpu().numpy(),
            res.boxes.cls.cpu().numpy(),
        )
    ]
    return {"detections": dets}

# --- WebSocket: /ws -----------------------------------------------------------
@app.websocket("/ws")
async def detect_stream(ws: WebSocket) -> None:
    await ws.accept()
    try:
        while True:
            data = await ws.receive_text()
            header, b64 = data.split(",", 1) if "," in data else ("", data)
            img_np = cv2.imdecode(
                np.frombuffer(base64.b64decode(b64), np.uint8), cv2.IMREAD_COLOR
            )
            res = yolo.predict(img_np, verbose=False, device=yolo_device)[0]
            dets = [
                {
                    "x1": int(xyxy[0]),
                    "y1": int(xyxy[1]),
                    "x2": int(xyxy[2]),
                    "y2": int(xyxy[3]),
                    "conf": round(float(conf), 4),
                    "cls": int(cls),
                }
                for xyxy, conf, cls in zip(
                    res.boxes.xyxy.cpu().numpy(),
                    res.boxes.conf.cpu().numpy(),
                    res.boxes.cls.cpu().numpy(),
                )
            ]
            await ws.send_text(json.dumps(dets))
            await asyncio.sleep(0.066)
    except Exception:
        await ws.close()

# --- Static files -------------------------------------------------------------
if WEB_DIR.exists():
    app.mount("/static", StaticFiles(directory=WEB_DIR), name="static")

    @app.get("/")
    async def get_index() -> FileResponse:
        return FileResponse(WEB_DIR / "index.html")

# --- Attach router and shutdown ----------------------------------------------
app.include_router(api)

@app.on_event("shutdown")
async def _shutdown() -> None:
    client.close()

# --- Logging -----------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)

