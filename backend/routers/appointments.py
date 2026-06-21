from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import extract, func
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

# Límite mensual de presupuesto institucional (Ej. $200.000 CLP)
PRESUPUESTO_MENSUAL = 200000.0

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

def check_budget(db: Session, current_month: int, current_year: int):
    # Sumar los honorarios_psicologo de las citas con subsidio en este mes
    total_gasto = db.query(func.sum(Cita.honorario_psicologo)).filter(
        Cita.tipo_pago == 'subsidio_institucional',
        Cita.estado != CitaEstado.cancelada,
        extract('month', Cita.fecha_hora) == current_month,
        extract('year', Cita.fecha_hora) == current_year
    ).scalar()
    return total_gasto or 0.0

@router.post("/")
def create_appointment(request: AppointmentCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if user.role != UserRole.paciente:
        raise HTTPException(status_code=403, detail="Solo pacientes pueden agendar citas.")
    
    paciente_profile = db.query(PacienteProfile).filter(PacienteProfile.user_id == user.id).first()
    psicologo_profile = db.query(PsicologoProfile).filter(PsicologoProfile.id == request.psicologo_id).first()
    
    if not psicologo_profile:
        raise HTTPException(status_code=404, detail="Psicólogo no encontrado.")

    # 1. Verificar si la hora es nocturna/extendida (Ej. entre 19:00 y 05:00)
    hour = request.fecha_hora.hour
    is_extendida = hour >= 19 or hour < 6
    tarifa_actual = psicologo_profile.tarifa_extendida if is_extendida else psicologo_profile.tarifa_diurna
    
    # 2. Lógica de Tiers (Copago vs Institucional)
    now = datetime.now()
    presupuesto_gastado = check_budget(db, now.month, now.year)
    
    requires_payment = False
    tipo_pago = 'copago_alumno'
    monto_total = tarifa_actual
    honorario_psicologo = tarifa_actual * 0.70 # 70% Fee para psicólogo en copago
    
    if paciente_profile.sesiones_gratuitas_restantes > 0:
        # Evaluar presupuesto
        tarifa_base_inst = psicologo_profile.tarifa_base if psicologo_profile.tarifa_base > 0 else (tarifa_actual * 0.60) # Asumir un base del 60%
        if (presupuesto_gastado + tarifa_base_inst) <= PRESUPUESTO_MENSUAL:
            # Subsidio Institucional
            tipo_pago = 'subsidio_institucional'
            monto_total = 0.0
            honorario_psicologo = tarifa_base_inst
            paciente_profile.sesiones_gratuitas_restantes -= 1
        else:
            # Presupuesto agotado
            requires_payment = True
    else:
        # Copago obligatorio
        requires_payment = True

    estado_inicial = CitaEstado.pendiente if requires_payment else CitaEstado.confirmada
    pago_inicial = PagoStatus.pendiente if requires_payment else PagoStatus.aprobado

    new_cita = Cita(
        paciente_id=paciente_profile.id,
        psicologo_id=psicologo_profile.id,
        fecha_hora=request.fecha_hora,
        estado=estado_inicial,
        pago_simulado_status=pago_inicial,
        tipo_pago=tipo_pago,
        monto_total=monto_total,
        honorario_psicologo=honorario_psicologo
    )
    
    db.add(new_cita)
    db.commit()
    db.refresh(new_cita)
    
    return {
        "message": "Cita agendada" if not requires_payment else "Requiere pago para confirmar",
        "cita_id": new_cita.id,
        "requires_payment": requires_payment,
        "monto_a_pagar": monto_total,
        "tipo_pago": tipo_pago,
        "sesiones_restantes": paciente_profile.sesiones_gratuitas_restantes
    }


@router.get("/upcoming")
def get_upcoming_appointment(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if user.role != UserRole.paciente:
        raise HTTPException(status_code=403, detail="Solo pacientes pueden consultar su próxima cita")
        
    profile = db.query(PacienteProfile).filter(PacienteProfile.user_id == user.id).first()
    
    # Buscar la cita más cercana confirmada (para la demo, podemos ignorar si ya pasó por unos minutos, o simplemente >= now)
    cita = db.query(Cita).filter(
        Cita.paciente_id == profile.id,
        Cita.estado == CitaEstado.confirmada,
        Cita.fecha_hora >= datetime.now()
    ).order_by(Cita.fecha_hora.asc()).first()
    
    if not cita:
        return None
        
    psicologo = db.query(PsicologoProfile).filter(PsicologoProfile.id == cita.psicologo_id).first()
    
    return {
        "id": cita.id,
        "fecha_hora": cita.fecha_hora.isoformat(),
        "psicologo_nombre": psicologo.nombre_completo,
        "psicologo_especialidad": psicologo.enfoque_clinico,
        "link_videollamada": "https://meet.google.com/new"
    }

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
                "date": cita.fecha_hora.strftime("%Y-%m-%d"),
                "name": paciente.nickname_anonimo if paciente else "Desconocido",
                "status": cita.estado.value,
                "payment": cita.pago_simulado_status.value,
                "tipo_pago": cita.tipo_pago,
                "honorario": cita.honorario_psicologo
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

# Añadimos un endpoint para las estadísticas del panel de psicólogo
@router.get("/metrics")
def get_psychologist_metrics(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if user.role != UserRole.psicologo:
        raise HTTPException(status_code=403, detail="Solo psicólogos pueden ver sus métricas")
        
    profile = db.query(PsicologoProfile).filter(PsicologoProfile.user_id == user.id).first()
    
    citas_completadas = db.query(Cita).filter(Cita.psicologo_id == profile.id, Cita.estado == CitaEstado.confirmada).all()
    
    ingresos_acumulados = sum(c.honorario_psicologo for c in citas_completadas if c.honorario_psicologo)
    sesiones_realizadas = len(citas_completadas)
    
    return {
        "sesiones_realizadas": sesiones_realizadas,
        "ingresos_acumulados": ingresos_acumulados,
        "en_turno": profile.en_turno
    }
