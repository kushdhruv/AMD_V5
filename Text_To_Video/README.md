# AI Text-to-Video Generator

The AI Text-to-Video Generator is an application that allows users to generate cohesive video clips from text prompts. It uses a FastAPI backend alongside a distributed worker node architecture to handle video generation tasks asynchronously.

## Features

- **Asynchronous Task Processing**: Uses a backend-worker architecture to handle computationally intensive video generation asynchronously.
- **Worker Nodes setup**: Worker nodes continuously poll the backend for rendering tasks, generate the clips based on the chosen ML handler, stitch them together, and upload the final video back to the backend.
- **Clip Generation & Stitching**: Automatically splits longer duration requests into smaller segments (e.g., 4 seconds) to fit ML generator constraints and seamlessly stitches them together.

## Tech Stack

- **Backend**: Python, FastAPI, SQLite (via SQLAlchemy)
- **Worker**: Python, Requests, AnimateDiff (or similar ML video generation handler)
- **Video Processing**: FFmpeg / OpenCV via `video_utils`

## Getting Started

### Backend
1. Navigate to the `backend` directory.
2. Install dependencies (e.g., `pip install -r requirements.txt`).
3. Start the FastAPI server:
   ```bash
   uvicorn app.main:app --port 8000 --reload
   ```

### Worker
1. Navigate to the `backend/worker` directory.
2. Run the worker node script:
   ```bash
   python worker_node.py
   ```

### Frontend
- Located in the `frontend` directory. Check its specific sub-README or `package.json` for how to run the frontend server (usually `npm start` or `npm run dev`).
