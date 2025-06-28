#!/bin/bash

# Check if the trained model file exists in Downloads
if [ -f "/home/agam/Downloads/best.pt" ]; then
    echo "Found trained model at /home/agam/Downloads/best.pt"
    export MODEL_PATH="/home/agam/Downloads/best.pt"
else
    echo "No trained model found in Downloads, will use fallback model"
    # Don't set MODEL_PATH, let the API use its fallback logic
fi

echo "Starting SpaceSavers API..."
echo "API will be available at: http://localhost:8000"
echo "Press Ctrl+C to stop the server"
echo ""

# Start the API server
python3 api.py 