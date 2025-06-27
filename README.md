# AstroGuard

AstroGuard is an advanced object detection system designed to identify and locate critical equipment in the International Space Station (ISS) environment. Using Yolov8 and FALCON by duality AI, the system can detect fire extinguishers, toolboxes, oxygen tanks, and other vital equipment in images and realtime.

## Detailed Report

- [Detailed Information of Model Training](https://drive.google.com/file/d/1ZTnfG7WOkH7ENyFE3ghk2wor01mcN-Ua/view?usp=sharing)

## Demo Video
- [Demo Video Of The Prototype](https://www.youtube.com/watch?v=YrEeXRXBT90)


## Overview

AstroGuard helps astronauts and ground control maintain awareness of safety equipment locations aboard the ISS, ensuring quick access during emergencies and efficient inventory management.

- **Object Detection:** Powered by FALCON AI from duality AI, trained on specialized ISS equipment imagery
- **Real-time Analysis:** Process live camera feeds or uploaded images
- **Inventory Management:** Track available safety equipment quantities

## Documentation


## Architecture

The system consists of two main components:

1. **Backend:** Python-based FastAPI server with YOLOv8 object detection model
2. **Frontend:** Next.js web application with modern UI for image upload and results visualization

## Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16.8.0+

### Backend Setup
```bash
cd backend
python -m venv venv
# On Windows
venv\Scripts\activate
# On macOS/Linux
source venv/bin/activate
pip install -r requirements.txt
python api.py
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Access the application at [http://localhost:3000](http://localhost:3000)

## Features

- **Object Detection**: Identify critical ISS equipment with high accuracy
- **Visual Feedback**: View detection results with bounding boxes and confidence scores
- **User-Friendly Interface**: Easy-to-use web application for uploading and analyzing images
- **Fast Processing**: Optimized for quick results with minimal latency

## Technologies Used

- **Backend**:
  - Python 3.x
  - FastAPI
  - YOLOv8 (Ultralytics)
  - OpenCV
  
- **Frontend**:
  - Next.js 15
  - React 19
  - Tailwind CSS
  - Shadcn UI

## Project Structure

```
AstroGuard/
├── backend/              # Python FastAPI backend
│   ├── api.py            # API server
│   ├── predict.py        # YOLOv8 prediction utilities
│   ├── train.py          # Model training script
│   └── ...
│
└── frontend/             # Next.js frontend
    ├── src/              # Source code
    │   ├── app/          # Next.js app pages
    │   ├── components/   # Reusable components
    │   └── ...
    └── ...
```


## Acknowledgements

- [Duality AI](https://duality.ai) - For Everything 💝
- [Ultralytics YOLOv8](https://github.com/ultralytics/ultralytics) for the object detection model
- [FastAPI](https://fastapi.tiangolo.com/) for the backend framework
- [Next.js](https://nextjs.org/)
- [Shadcn UI](https://ui.shadcn.com/) for the UI components 
