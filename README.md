# Space Station AR Maintenance Assistant

This project provides a prototype for an augmented-reality maintenance
helper. A YOLOv8 object detector runs on a PC and communicates with a
mobile AR application. The phone streams camera frames to the PC where
object detection is performed. Detected items are sent back to the phone
and rendered as overlays.

## Components

* `server/` – Python WebSocket service running YOLOv8 inference.
* `mobile/` – Example Unity script for drawing bounding boxes.
* `requirements.txt` – Python package list for the PC server.

## Quick start

1. Install Python packages:
   ```bash
   pip install -r requirements.txt
   ```
2. Run the detection server:
   ```bash
   python server/server.py
   ```
3. Build a Unity mobile app that sends frames over WebSocket and uses
   `AROverlay` to display results.
