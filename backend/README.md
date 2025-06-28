# AstroGuard Backend API

This directory contains the FastAPI server for AstroGuard object detection service, which uses YOLOv8 to detect objects in images. The model is trained to detect objects in the International Space Station (ISS) environment such as fire extinguishers, toolboxes, and oxygen tanks.

## Features

- Object detection for space station equipment using YOLOv8
- RESTful API built with FastAPI
- Easy integration with frontend applications
- CORS support for cross-origin requests

## Project Structure

```
backend/
├── api.py                # FastAPI server implementation
├── predict.py            # Prediction utilities for YOLOv8 model
├── train.py              # Training script for YOLOv8 model
├── visualize.py          # Visualization utilities
├── classes.txt           # Class definitions for object detection
├── yolo_params.yaml      # YOLOv8 model parameters
├── requirements.txt      # Python dependencies
├── runs/                 # Training runs and model weights
├── predictions/          # Saved predictions
└── data/                 # Training and testing data
```

## Setup

1. Create a virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   # On Windows
   venv\Scripts\activate
   # On macOS/Linux
   source venv/bin/activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Running the Server

Run the FastAPI server with:
```bash
python api.py
```

Or alternatively:
```bash
uvicorn api:app --reload
```

The server will be available at http://localhost:8000

The API loads a YOLOv8 model at startup. By default it searches for the latest
training run under `runs/detect/train*/weights/best.pt`. You can override the
model path by setting the `MODEL_PATH` environment variable:

```bash
MODEL_PATH=/path/to/best.pt python api.py
```

If no trained weights are found and `MODEL_PATH` is not set, the server will fail
to start. Ensure you have trained the model or provide the path to the weights.

## API Endpoints

- `GET /`: Root endpoint, returns a welcome message
- `POST /detect`: Upload an image for object detection
  - Accepts: Form data with a file field
  - Returns: JSON with detected objects, bounding boxes, and a base64-encoded image with drawn bounding boxes

## Swagger Documentation

After starting the server, you can access the interactive API documentation at:
http://localhost:8000/docs

## Model Training

To train the model with custom data:

1. Organize your data in the format specified in `yolo_params.yaml`
2. Run the training script:
   ```bash
   python train.py --epochs 10 --lr0 0.001
   ```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request 