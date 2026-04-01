from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from .routers import auth, tasks, worker
from . import models, database

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="AI Text-to-Video Generator")

# CORS for frontend (if running on different port/domain)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(tasks.router)
app.include_router(worker.router)

# Mount media directory to serve generated videos
import os
import threading
import sys

def start_worker():
    print("Starting ML background worker...")
    try:
        worker_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "worker")
        if worker_dir not in sys.path:
            sys.path.append(worker_dir)
        import worker_node
        worker_node.main()
    except Exception as e:
        print(f"Failed to start ML worker: {e}")

@app.on_event("startup")
def startup_event():
    worker_thread = threading.Thread(target=start_worker, daemon=True)
    worker_thread.start()

if not os.path.exists("media"):
    os.makedirs("media")
app.mount("/items", StaticFiles(directory="media"), name="media")

# Serve frontend
# If running from project root (D:\Hackathon\AMD\Text_To_Video), frontend is in "frontend"
# If running from backend directory, it is in "../frontend"
# We make it absolute based on this file's location: backend/app/main.py -> up 2 levels -> frontend
base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
frontend_dir = os.path.join(base_dir, "frontend")

if os.path.exists(frontend_dir):
    app.mount("/", StaticFiles(directory=frontend_dir, html=True), name="frontend")
else:
    print(f"Warning: Frontend directory not found at {frontend_dir}")
