from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import PsicologoProfile, User, UserRole
from pydantic import BaseModel
from typing import List
from routers.auth import get_current_user

router = APIRouter(
    prefix="/api/psicologos",
    tags=["Psicologos Directory"]
)

@router.get("/")
def get_psicologos(db: Session = Depends(get_db)):
    # Traemos todos los psicólogos con sus perfiles (en el futuro se puede filtrar por is_active)
    psicologos = db.query(PsicologoProfile).join(User).filter(User.role == UserRole.psicologo, User.is_active == True).all()
    
    result = []
    for p in psicologos:
        result.append({
            "id": p.id,
            "nombre_completo": p.nombre_completo,
            "presentacion": p.presentacion or "Especialista en salud mental.",
            "enfoque_clinico": p.enfoque_clinico or "Psicología Clínica",
            "tarifa_diurna": p.tarifa_diurna,
            "tarifa_extendida": p.tarifa_extendida,
            "en_turno": p.en_turno
        })
    return result

class TurnoUpdate(BaseModel):
    en_turno: bool

@router.put("/me/turno")
def update_turno(turno_data: TurnoUpdate, user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    if user["role"] != "psicologo":
        raise HTTPException(status_code=403, detail="Solo psicólogos pueden actualizar esto")
        
    profile = db.query(PsicologoProfile).filter(PsicologoProfile.user_id == user["id"]).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Perfil no encontrado")
        
    profile.en_turno = turno_data.en_turno
    db.commit()
    return {"en_turno": profile.en_turno}
