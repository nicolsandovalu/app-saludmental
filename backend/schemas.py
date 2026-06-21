from pydantic import BaseModel, EmailStr, Field, ConfigDict, field_validator
from typing import Optional

# ==========================================
# 1. Esquemas de Usuario Base
# ==========================================

class UserBase(BaseModel):
    email: EmailStr
    role: str

    @field_validator('role')
    @classmethod
    def validate_role(cls, v: str):
        valid_roles = ['paciente', 'psicologo']
        if v not in valid_roles:
            raise ValueError(f"El rol debe ser uno de los siguientes: {valid_roles}")
        return v

class UserCreate(UserBase):
    password: str = Field(..., min_length=8, description="La contraseña debe tener mínimo 8 caracteres.")

class UserResponse(UserBase):
    id: int
    is_active: bool

    # Configuración de Pydantic v2 para leer desde modelos de SQLAlchemy
    model_config = ConfigDict(from_attributes=True)


# ==========================================
# 2. Esquemas de Registro por Rol
# ==========================================

class PacienteRegister(BaseModel):
    username: str = Field(..., description="Nombre de usuario único")
    email: EmailStr
    password: str = Field(..., min_length=8)
    nickname_anonimo: str = Field(..., description="Usuario con el que se identificará en la app")
    carrera: Optional[str] = None
    jornada: str = "vespertino"

class PsicologoRegister(BaseModel):
    username: str = Field(..., description="Nombre de usuario único")
    email: EmailStr
    password: str = Field(..., min_length=8)
    nombre_completo: str
    presentacion: str
    enfoque_clinico: str
    tarifa_diurna: float
    tarifa_extendida: float
    moneda: str = "CLP"
    datos_transferencia: str


# ==========================================
# 3. Esquemas de Autenticación
# ==========================================

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None
