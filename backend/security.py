import os
from datetime import datetime, timedelta, timezone
import jwt
import bcrypt

# Configuraciones JWT tomadas de las variables de entorno
SECRET_KEY = os.getenv("SECRET_KEY_JWT", "fallback-secret-para-desarrollo")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica si la contraseña en texto plano coincide con el hash guardado."""
    password_bytes = plain_password.encode('utf-8')
    if len(password_bytes) > 72:
        password_bytes = password_bytes[:72]
    
    # bcrypt.checkpw requiere que ambos argumentos sean bytes
    return bcrypt.checkpw(password_bytes, hashed_password.encode('utf-8'))

def get_password_hash(password: str) -> str:
    """Retorna el hash seguro de una contraseña en texto plano."""
    password_bytes = password.encode('utf-8')
    if len(password_bytes) > 72:
        password_bytes = password_bytes[:72]
        
    # Usamos rounds=4 (el mínimo de bcrypt) para eliminar el retraso extremo en el login durante desarrollo
    salt = bcrypt.gensalt(rounds=4)
    hashed_bytes = bcrypt.hashpw(password_bytes, salt)
    return hashed_bytes.decode('utf-8')

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
