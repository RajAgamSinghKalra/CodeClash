# SpaceSavers - AI-Powered Safety Equipment Detection

Advanced AI-Powered Safety Equipment Detection System for Space Missions - Built for CodeClash 2.0 Hackathon

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 18+
- Your trained `best.pt` model file

### Backend Setup (API Server)

1. **Navigate to the backend directory:**
```bash
cd backend
   ```

2. **Install Python dependencies:**
   ```bash
pip install -r requirements.txt
   ```

3. **Start the API server with your best.pt model:**
   ```bash
   # Option 1: Use the provided script (recommended)
   ./start_api.sh
   
   # Option 2: Manual command
   MODEL_PATH="/home/agam/Downloads/best.pt" python3 api.py
```

   The API will be available at `http://localhost:8000`

### Frontend Setup (Web Application)

1. **Navigate to the frontend directory:**
```bash
cd frontend
   ```

2. **Install Node.js dependencies:**
   ```bash
npm install
   ```

3. **Start the development server:**
   ```bash
npm run dev
```

   The web application will be available at `http://localhost:3000`

## 🎯 How to Use

1. **Open your browser** and go to `http://localhost:3000`
2. **Click "Launch Analysis"** on the landing page or home page
3. **Upload an image** containing safety equipment
4. **View the detection results** with bounding boxes and confidence scores
5. **Add detected items to inventory** if needed

## 🔧 Features

- **Real-time Object Detection**: Uses your custom-trained YOLO model (`best.pt`)
- **Multiple Detection Modes**: Image upload, webcam, and video analysis
- **Inventory Management**: Track detected safety equipment
- **Space-themed UI**: Modern, responsive design with cosmic aesthetics
- **API Integration**: RESTful API for detection and data management

## 📁 Project Structure

```
webtesting-main/
├── backend/                 # Python FastAPI backend
│   ├── api.py              # Main API server
│   ├── classes.txt         # Class names for detection
│   ├── start_api.sh        # Startup script
│   └── requirements.txt    # Python dependencies
├── frontend/               # Next.js frontend
│   ├── src/app/           # Next.js app router
│   ├── src/components/    # React components
│   └── package.json       # Node.js dependencies
└── README.md              # This file
```

## 🎨 Technology Stack

- **Backend**: FastAPI, Ultralytics YOLO, OpenCV, PyTorch
- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **AI Model**: Custom-trained YOLOv8 model (`best.pt`)
- **Database**: JSON-based local storage
- **Styling**: Custom space-themed design with cosmic gradients

## 🔍 Detection Classes

The system detects the following safety equipment classes:
- **FireExtinguisher**: Fire extinguishers and safety equipment
- **ToolBox**: Toolboxes and maintenance equipment  
- **OxygenTank**: Oxygen tanks and life support equipment

## 🚨 Troubleshooting

### Backend Issues
- **Model not found**: Ensure your `best.pt` file is in the correct location
- **Port already in use**: Change the port in `api.py` or kill existing processes
- **CUDA errors**: The system will automatically fall back to CPU if GPU is unavailable

### Frontend Issues
- **Build errors**: Make sure you're using Node.js 18+ and React 18
- **API connection errors**: Ensure the backend server is running on port 8000
- **Styling issues**: Clear browser cache and restart the dev server

## 📝 CodeClash 2.0 Hackathon

This project was developed for **CodeClash 2.0**, a student-run national hackathon at Google's Gurugram campus. The system demonstrates advanced AI integration, modern web development practices, and innovative UI/UX design.

## 🤝 Contributing

This is a hackathon project. For questions or issues, please refer to the project documentation or contact the development team.

---

**SpaceSavers** - Making space missions safer with AI-powered detection! 🚀
