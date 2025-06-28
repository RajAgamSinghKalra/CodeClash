from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import numpy as np
import cv2
import io
import os
from pathlib import Path
from ultralytics import YOLO
import torch
import base64
import tempfile

# Initialize FastAPI app
app = FastAPI(title="SpaceSavers API")

# Add CORS middleware to allow requests from frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # NextJS default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the YOLO model at startup
MODEL_PATH = None

@app.on_event("startup")
async def startup_event():
    global MODEL_PATH, model
    
    this_dir = Path(__file__).parent
    detect_path = this_dir / "runs" / "detect"

    # Allow overriding the model path via environment variable
    env_model = os.getenv("MODEL_PATH")

    # Find the latest training folder if runs/detect exists
    train_folders = []
    if detect_path.exists():
        train_folders = [
            f for f in os.listdir(detect_path)
            if (detect_path / f).is_dir() and f.startswith("train")
        ]

    if env_model:
        MODEL_PATH = Path(env_model)
    elif train_folders:
        # Use the latest trained model
        train_folders.sort()
        latest_train_folder = train_folders[-1]
        MODEL_PATH = detect_path / latest_train_folder / "weights" / "best.pt"
    else:
        # Try to use the trained model from Downloads
        downloads_model = Path("/home/agam/Downloads/best.pt")
        if downloads_model.exists():
            MODEL_PATH = downloads_model
        else:
            # Fallback to default model
            MODEL_PATH = Path("yolov8n.pt")

    # Load the model on the appropriate device
    model = YOLO(MODEL_PATH)
    device = "cuda" if torch.cuda.is_available() else "cpu"
    model.to(device)
    print(f"Model loaded from {MODEL_PATH} on {device}")

# Load class names
def get_class_names():
    with open(Path(__file__).parent / "classes.txt", "r") as f:
        return [line.strip() for line in f if line.strip()]

@app.get("/")
async def root():
    return {"message": "Welcome to SpaceSavers Object Detection API"}

@app.post("/detect")
async def detect_objects(file: UploadFile = File(...)):
    # Read image from request
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    # Perform detection
    results = model.predict(img, conf=0.5)
    result = results[0]
    
    # Process detection results
    detections = []
    class_names = get_class_names()
    
    for box in result.boxes:
        # Extract class, confidence, and bounding box coordinates
        class_id = int(box.cls)
        confidence = float(box.conf)
        x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())
        
        # Get class name
        class_name = class_names[class_id] if class_id < len(class_names) else f"Class {class_id}"
        
        # Add detection to result
        detections.append({
            "class_id": class_id,
            "class_name": class_name,
            "confidence": confidence,
            "bbox": [x1, y1, x2, y2]  # x1, y1, x2, y2 format
        })
    
    # Generate output image with bounding boxes
    output_img = result.plot()
    
    # Convert the image to base64 for sending back to frontend
    _, buffer = cv2.imencode('.jpg', output_img)
    img_str = base64.b64encode(buffer).decode()
    
    return JSONResponse({
        "detections": detections,
        "image": img_str,
        "count": len(detections)
    })

@app.post("/detect-video")
async def detect_video(file: UploadFile = File(...)):
    # Create a temporary file to store the uploaded video
    with tempfile.NamedTemporaryFile(delete=False, suffix='.mp4') as temp_file:
        # Write the uploaded file to the temporary file
        temp_file.write(await file.read())
        temp_file_path = temp_file.name
    
    try:
        # Open the video file
        cap = cv2.VideoCapture(temp_file_path)
        if not cap.isOpened():
            return JSONResponse({"error": "Failed to open video file"}, status_code=400)
        
        # Get video properties
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        fps = cap.get(cv2.CAP_PROP_FPS)
        
        # Process every 10th frame to reduce processing time
        frame_interval = 10
        processed_frames = []
        class_counts = {}
        
        frame_number = 0
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
                
            # Process only every nth frame
            if frame_number % frame_interval == 0:
                # Perform detection
                results = model.predict(frame, conf=0.5)
                result = results[0]
                
                # Count detections by class
                class_names = get_class_names()
                
                for box in result.boxes:
                    class_id = int(box.cls)
                    class_name = class_names[class_id] if class_id < len(class_names) else f"Class {class_id}"
                    
                    # Update class counts
                    if class_name in class_counts:
                        class_counts[class_name] += 1
                    else:
                        class_counts[class_name] = 1
                
                # Generate output image with bounding boxes
                output_img = result.plot()
                
                # Convert the image to base64
                _, buffer = cv2.imencode('.jpg', output_img)
                img_str = base64.b64encode(buffer).decode()
                
                # Add to processed frames
                processed_frames.append({
                    "frame_number": frame_number,
                    "image": img_str
                })
            
            frame_number += 1
            
            # Limit the number of processed frames to avoid excessive memory usage
            if len(processed_frames) >= 30:
                break
        
        cap.release()
        
        # Clean up the temporary file
        os.unlink(temp_file_path)
        
        return JSONResponse({
            "total_frames": total_frames,
            "fps": fps,
            "processed_frames": processed_frames,
            "class_counts": class_counts
        })
        
    except Exception as e:
        # Clean up the temporary file in case of error
        if os.path.exists(temp_file_path):
            os.unlink(temp_file_path)
        return JSONResponse({"error": str(e)}, status_code=500)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 