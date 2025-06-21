# Unreal Client

This folder outlines how to connect an Unreal Engine project to the YOLOv8 server. Create a Blueprint Function Library (for example `BP_ImageStreamer`) that captures the camera texture each tick, encodes it as JPEG and sends it to `/detect` via WebSocket. The JSON reply contains bounding box coordinates which can be drawn using UMG widgets.

See the repository root README for an overview of the entire system.
