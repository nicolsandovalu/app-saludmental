import random
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm

from database import get_db
from models import User, PacienteProfile, PsicologoProfile, UserRole
from schemas import PacienteRegister, PsicologoRegister, Token
from security import get_password_hash, verify_password, create_access_token

router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"]
)

@router.post("/register/paciente", response_model=Token)
def register_paciente(paciente_data: PacienteRegister, db: Session = Depends(get_db)):
    # 1. Verificar si el correo ya existe
    db_user = db.query(User).filter(User.email == paciente_data.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="El email ya está registrado.")
    
    # 2. Crear el Usuario Base
    new_user = User(
        email=paciente_data.email,
        hashed_password=get_password_hash(paciente_data.password),
        role=UserRole.paciente
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Generar un nickname anónimo aleatorio para el paciente
    nickname = f"Anónimo #{random.randint(1000, 9999)}"
    
    # 3. Crear el Perfil del Paciente vinculado al Usuario Base
    new_profile = PacienteProfile(
        user_id=new_user.id,
        nickname_anonimo=nickname,
        carrera=paciente_data.carrera,
        jornada=paciente_data.jornada
    )
    db.add(new_profile)
    db.commit()
    
    # 4. Generar el Token de Acceso
    access_token = create_access_token(data={"email": new_user.email, "role": new_user.role})
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/register/psicologo", response_model=Token)
def register_psicologo(psicologo_data: PsicologoRegister, db: Session = Depends(get_db)):
    # 1. Verificar si el correo ya existe
    db_user = db.query(User).filter(User.email == psicologo_data.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="El email ya está registrado.")
        
    # 2. Crear el Usuario Base
    new_user = User(
        email=psicologo_data.email,
        hashed_password=get_password_hash(psicologo_data.password),
        role=UserRole.psicologo
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # 3. Crear el Perfil del Psicólogo
    new_profile = PsicologoProfile(
        user_id=new_user.id,
        nombre_completo=psicologo_data.nombre_completo,
        presentacion=psicologo_data.presentacion,
        enfoque_clinico=psicologo_data.enfoque_clinico,
        tarifa_diurna=psicologo_data.tarifa_diurna,
        tarifa_extendida=psicologo_data.tarifa_extendida,
        datos_transferencia=psicologo_data.datos_transferencia
    )
    db.add(new_profile)
    db.commit()
    
    # 4. Generar el Token de Acceso
    access_token = create_access_token(data={"email": new_user.email, "role": new_user.role})
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # Buscar al usuario por correo (OAuth2PasswordRequestForm usa el campo 'username' por defecto)
    user = db.query(User).filter(User.email == form_data.username).first()
    
    # Si no existe o la contraseña es incorrecta, lanzar error
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Retornar token validado
    access_token = create_access_token(data={"email": user.email, "role": user.role})
    return {"access_token": access_token, "token_type": "bearer"}
