import random
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
import jwt

from database import get_db
from models import User, PacienteProfile, PsicologoProfile, UserRole
from schemas import PacienteRegister, PsicologoRegister, Token
from security import get_password_hash, verify_password, create_access_token, SECRET_KEY, ALGORITHM

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
    
    try:
        # 2. Crear el Usuario Base
        new_user = User(
            username=paciente_data.username,
            email=paciente_data.email,
            hashed_password=get_password_hash(paciente_data.password),
            role=UserRole.paciente
        )
        db.add(new_user)
        db.flush()
        
        # 3. Crear el Perfil del Paciente vinculado al Usuario Base usando el nickname provisto
        new_profile = PacienteProfile(
            user_id=new_user.id,
            nombre=paciente_data.nombre,
            apellido=paciente_data.apellido,
            nickname_anonimo=paciente_data.nickname_anonimo,
            carrera=paciente_data.carrera,
            jornada=paciente_data.jornada
        )
        db.add(new_profile)
        db.commit()
        db.refresh(new_user)
        
        # 4. Generar el Token de Acceso (Importante usar .value en el Enum)
        access_token = create_access_token(
            data={"sub": new_user.email, "role": new_user.role.value, "username": new_user.username, "nickname": paciente_data.nickname_anonimo, "nombre_completo": f"{paciente_data.nombre} {paciente_data.apellido}", "nombre": paciente_data.nombre}
        )
        return {"access_token": access_token, "token_type": "bearer"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")


@router.post("/register/psicologo", response_model=Token)
def register_psicologo(psicologo_data: PsicologoRegister, db: Session = Depends(get_db)):
    # 1. Verificar si el correo ya existe
    db_user = db.query(User).filter(User.email == psicologo_data.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="El email ya está registrado.")
        
    try:
        # 2. Crear el Usuario Base
        new_user = User(
            username=psicologo_data.username,
            email=psicologo_data.email,
            hashed_password=get_password_hash(psicologo_data.password),
            role=UserRole.psicologo
        )
        db.add(new_user)
        db.flush() # Flush asegura que new_user.id se genere sin hacer commit definitivo
        
        # 3. Crear el Perfil del Psicólogo
        new_profile = PsicologoProfile(
            user_id=new_user.id,
            nombre_completo=psicologo_data.nombre_completo,
            presentacion=psicologo_data.presentacion,
            enfoque_clinico=psicologo_data.enfoque_clinico,
            tarifa_diurna=psicologo_data.tarifa_diurna,
            tarifa_extendida=psicologo_data.tarifa_extendida,
            moneda=psicologo_data.moneda,
            datos_transferencia=psicologo_data.datos_transferencia
        )
        db.add(new_profile)
        db.commit()
        db.refresh(new_user)
        
        # 4. Generar el Token
        access_token = create_access_token(
            data={"sub": new_user.email, "role": new_user.role.value, "username": new_user.username, "nickname": psicologo_data.nombre_completo}
        )
        return {"access_token": access_token, "token_type": "bearer"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error en base de datos: {str(e)}")


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
    
    # Obtener el nombre/nickname según el perfil
    nickname = "Usuario"
    nombre_completo = "Usuario"
    nombre = "Usuario"
    if user.role == UserRole.paciente and user.paciente_profile:
        nickname = user.paciente_profile.nickname_anonimo
        nombre_completo = f"{user.paciente_profile.nombre} {user.paciente_profile.apellido}"
        nombre = user.paciente_profile.nombre
    elif user.role == UserRole.psicologo and user.psicologo_profile:
        nickname = user.psicologo_profile.nombre_completo
        nombre_completo = user.psicologo_profile.nombre_completo
        nombre = user.psicologo_profile.nombre_completo.split()[0] if user.psicologo_profile.nombre_completo else "Psicólogo"

    # Retornar token validado
    access_token = create_access_token(
        data={"sub": user.email, "role": user.role.value, "username": user.username, "nickname": nickname, "nombre_completo": nombre_completo, "nombre": nombre}
    )
    return {"access_token": access_token, "token_type": "bearer"}

# ==========================================
# Autenticación y Extracción del Usuario
# ==========================================

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudieron validar las credenciales o el token ha expirado",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception
        
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
        
    # Retornamos un diccionario con los datos básicos
    return {
        "id": user.id,
        "email": user.email,
        "username": user.username,
        "role": user.role.value
    }
