from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
from .. import models, database, auth_utils

router = APIRouter(prefix="/auth", tags=["auth"])

class UserCreate(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

@router.post("/register", response_model=Token)
def register(user: UserCreate, db: Session = Depends(database.get_db)):
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    hashed_password = auth_utils.get_password_hash(user.password)
    new_user = models.User(username=user.username, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    access_token = auth_utils.create_access_token(data={"sub": new_user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    if not user or not auth_utils.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = auth_utils.create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

# Simple service-key auth (bypasses bcrypt for internal service-to-service calls)
SERVICE_KEY = "amd_video_service_key_2026"

class ServiceAuth(BaseModel):
    service_key: str
    username: str

@router.post("/service-token", response_model=Token)
def get_service_token(auth: ServiceAuth, db: Session = Depends(database.get_db)):
    if auth.service_key != SERVICE_KEY:
        raise HTTPException(status_code=403, detail="Invalid service key")
    user = db.query(models.User).filter(models.User.username == auth.username).first()
    if not user:
        # Auto-create the service user
        hashed = auth_utils.get_password_hash("service_password_123")
        user = models.User(username=auth.username, hashed_password=hashed)
        db.add(user)
        db.commit()
        db.refresh(user)
    access_token = auth_utils.create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

