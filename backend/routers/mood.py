from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import MoodLog, User, UserRole, PacienteProfile
from pydantic import BaseModel
from typing import List
import jwt
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import os

router = APIRouter(
    prefix="/api/mood",
    tags=["Mood Telemetry"]
)

security = HTTPBearer()
SECRET_KEY = os.getenv("SECRET_KEY_JWT", "fallback-secret-para-desarrollo")
ALGORITHM = "HS256"

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
        
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

class MoodRequest(BaseModel):
    mood: str

@router.post("/")
def log_mood(request: MoodRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if user.role != UserRole.paciente:
        raise HTTPException(status_code=403, detail="Solo pacientes pueden registrar su estado de ánimo.")
        
    paciente_profile = db.query(PacienteProfile).filter(PacienteProfile.user_id == user.id).first()
    if not paciente_profile:
        raise HTTPException(status_code=404, detail="Perfil de paciente no encontrado")

    new_log = MoodLog(
        paciente_id=paciente_profile.id,
        mood=request.mood
    )
    db.add(new_log)
    db.commit()
    return {"message": "Estado de ánimo registrado exitosamente", "mood": request.mood}
