# Mobile AR Client

This directory contains a sample Unity script (`AROverlay.cs`) that
shows how to render detection results as UI elements on top of the
camera feed. The Unity project should send camera frames to the Python
server over WebSocket and call `UpdateDetections` with the parsed JSON
reply.

The mobile app is expected to:

1. Capture the camera feed using AR Foundation.
2. Encode each frame as JPEG and send it to the server.
3. Receive the detection JSON array and update UI overlays.
