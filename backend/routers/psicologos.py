from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import PsicologoProfile, User, UserRole
from typing import List

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
            "tarifa_extendida": p.tarifa_extendida
        })
    return result
