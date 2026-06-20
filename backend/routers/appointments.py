from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Cita, CitaEstado, PagoStatus, User, UserRole, PsicologoProfile, PacienteProfile
from pydantic import BaseModel
from typing import List
import jwt
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import os
from datetime import datetime

router = APIRouter(
    prefix="/api/appointments",
    tags=["Appointments"]
)

security = HTTPBearer()
SECRET_KEY = os.getenv("SECRET_KEY_JWT", "fallback-secret-para-desarrollo")
ALGORITHM = "HS256"

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
        
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


class AppointmentCreate(BaseModel):
    psicologo_id: int
    fecha_hora: datetime

@router.post("/")
def create_appointment(request: AppointmentCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if user.role != UserRole.paciente:
        raise HTTPException(status_code=403, detail="Solo pacientes pueden agendar citas.")
    
    paciente_profile = db.query(PacienteProfile).filter(PacienteProfile.user_id == user.id).first()
    
    new_cita = Cita(
        paciente_id=paciente_profile.id,
        psicologo_id=request.psicologo_id,
        fecha_hora=request.fecha_hora,
        estado=CitaEstado.pendiente,
        pago_simulado_status=PagoStatus.pendiente
    )
    db.add(new_cita)
    db.commit()
    db.refresh(new_cita)
    return {"message": "Cita agendada con éxito", "cita_id": new_cita.id}


@router.get("/")
def get_appointments(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if user.role == UserRole.psicologo:
        profile = db.query(PsicologoProfile).filter(PsicologoProfile.user_id == user.id).first()
        citas = db.query(Cita).filter(Cita.psicologo_id == profile.id).all()
        # Mapear para la UI
        result = []
        for cita in citas:
            paciente = db.query(PacienteProfile).filter(PacienteProfile.id == cita.paciente_id).first()
            result.append({
                "id": cita.id,
                "time": cita.fecha_hora.strftime("%H:%M"),
                "name": paciente.nickname_anonimo if paciente else "Desconocido",
                "status": cita.estado.value,
                "payment": cita.pago_simulado_status.value
            })
        return result
    else:
        profile = db.query(PacienteProfile).filter(PacienteProfile.user_id == user.id).first()
        citas = db.query(Cita).filter(Cita.paciente_id == profile.id).all()
        return citas

class PaymentRequest(BaseModel):
    cita_id: int

@router.post("/pay")
def simulate_payment(request: PaymentRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if user.role != UserRole.paciente:
        raise HTTPException(status_code=403, detail="Solo pacientes pueden realizar pagos.")
        
    cita = db.query(Cita).filter(Cita.id == request.cita_id).first()
    if not cita:
        raise HTTPException(status_code=404, detail="Cita no encontrada")
        
    # Simular procesamiento de pago exitoso
    cita.pago_simulado_status = PagoStatus.aprobado
    cita.estado = CitaEstado.confirmada
    db.commit()
    
    return {"message": "Pago simulado procesado exitosamente", "status": "aprobado"}
