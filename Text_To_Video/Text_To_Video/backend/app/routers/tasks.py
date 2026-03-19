from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from .. import models, database, auth_utils

router = APIRouter(prefix="/tasks", tags=["tasks"])

class TaskCreate(BaseModel):
    prompt: str
    duration: int = 5

from datetime import datetime

from typing import List, Optional

class TaskResponse(BaseModel):
    id: int
    prompt: str
    duration: int
    status: str
    video_url: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

@router.post("/", response_model=TaskResponse)
def create_task(task: TaskCreate, current_user: models.User = Depends(auth_utils.get_current_user), db: Session = Depends(database.get_db)):
    if task.duration not in [5, 10, 15, 30]:
        raise HTTPException(status_code=400, detail="Invalid duration. Must be 5, 10, 15, or 30.")
    
    new_task = models.VideoProject(
        user_id=current_user.id,
        prompt=task.prompt,
        duration=task.duration,
        status="pending",
        created_at=datetime.utcnow()
    )
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    return new_task

@router.get("/", response_model=List[TaskResponse])
def get_my_tasks(current_user: models.User = Depends(auth_utils.get_current_user), db: Session = Depends(database.get_db)):
    return db.query(models.VideoProject).filter(models.VideoProject.user_id == current_user.id).order_by(models.VideoProject.created_at.desc()).all()

@router.get("/{task_id}", response_model=TaskResponse)
def get_task(task_id: int, current_user: models.User = Depends(auth_utils.get_current_user), db: Session = Depends(database.get_db)):
    task = db.query(models.VideoProject).filter(models.VideoProject.id == task_id, models.VideoProject.user_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task
