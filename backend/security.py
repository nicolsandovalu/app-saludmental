import os
from datetime import datetime, timedelta, timezone
import jwt
from passlib.context import CryptContext

# Configuraciones JWT tomadas de las variables de entorno
SECRET_KEY = os.getenv("SECRET_KEY_JWT", "fallback-secret-para-desarrollo")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Contexto de contraseñas usando bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica si la contraseña en texto plano coincide con el hash guardado."""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Retorna el hash seguro de una contraseña en texto plano."""
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta = None) -> str:
    """
    Genera un token JWT que codifica los datos (como email y rol) 
    con una fecha de expiración.
    """
    to_encode = data.copy()
    
    # Si no se provee un tiempo específico, usar los 30 min por defecto
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        
    to_encode.update({"exp": expire})
    
    # Generamos el JWT cifrado
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
