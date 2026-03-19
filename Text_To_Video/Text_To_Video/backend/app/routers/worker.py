from fastapi import APIRouter, Depends, HTTPException, Header, UploadFile, File
from sqlalchemy.orm import Session
import shutil
import os
from .. import models, database

router = APIRouter(prefix="/worker", tags=["worker"])

# In production, use environment variable
WORKER_API_KEY = "my_worker_secret_key"

def verify_worker_key(x_worker_key: str = Header(...)):
    if x_worker_key != WORKER_API_KEY:
        raise HTTPException(status_code=403, detail="Invalid Worker Key")
    return x_worker_key

@router.get("/pending-task")
def get_pending_task(db: Session = Depends(database.get_db), key: str = Depends(verify_worker_key)):
    # Simple FIFO queue
    task = db.query(models.VideoProject).filter(models.VideoProject.status == "pending").order_by(models.VideoProject.created_at.asc()).first()
    if not task:
        return {"task": None}
    
    # Mark as processing so others don't pick it
    task.status = "processing"
    db.commit()
    
    return {
        "task": {
            "id": task.id,
            "prompt": task.prompt,
            "duration": task.duration
        }
    }

@router.post("/tasks/{task_id}/result")
async def submit_result(task_id: int, file: UploadFile = File(...), db: Session = Depends(database.get_db), key: str = Depends(verify_worker_key)):
    task = db.query(models.VideoProject).filter(models.VideoProject.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Save file locally
    media_dir = "media"
    if not os.path.exists(media_dir):
        os.makedirs(media_dir)
        
    file_location = f"{media_dir}/{task_id}_{file.filename}"
    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    task.status = "completed"
    task.video_url = f"/items/{task_id}_{file.filename}" # We will serve this via StaticFiles
    db.commit()
    
    return {"status": "success", "file_path": file_location}

@router.post("/tasks/{task_id}/fail")
def report_failure(task_id: int, reason: str, db: Session = Depends(database.get_db), key: str = Depends(verify_worker_key)):
    task = db.query(models.VideoProject).filter(models.VideoProject.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    task.status = "failed"
    db.commit()
    return {"status": "marked as failed"}
