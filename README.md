# SpaceSavers

A fast and simple AI-powered safety equipment detector.

## Quick Start

### Prerequisites

* Python 3.8+
* Node.js 18+
* Trained `best.pt` model file

### Backend Setup

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```
2. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```
3. Start the API server:

   ```bash
   ./start_api.sh
   # or
   MODEL_PATH="/path/to/best.pt" python3 api.py
   ```

   The API runs at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```
2. Install dependencies:

   ```bash
   npm install
   ```
3. Start the development server:

   ```bash
   npm run dev
   ```

   The app runs at `http://localhost:3000`

## Usage

1. Open `http://localhost:3000` in your browser.
2. Upload an image, webcam feed, or video.
3. See detected equipment with bounding boxes.
4. Optionally, add items to inventory.

## Features

* Real-time detection with YOLOv8 (`best.pt`).
* Image, webcam, and video modes.
* Simple inventory tracking.

## Project Structure

```
backend/
  ├─ api.py
  ├─ start_api.sh
  └─ requirements.txt
frontend/
  ├─ src/app/
  ├─ src/components/
  └─ package.json
README.md
```

## Troubleshooting

* **Model not found**: Verify `best.pt` path.
* **Port in use**: Change port in `api.py` or stop the running process.
* **Build errors**: Use Node.js 18+, React 18.
* **API errors**: Ensure backend is running on port 8000.
