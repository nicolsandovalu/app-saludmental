import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv  # <-- 1. Importamos la librería

# 2. Cargamos las variables del archivo .env en el entorno de ejecución
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    # Fallback temporal si por alguna razón no lee el .env
    DATABASE_URL = "sqlite:///./saludmental_dev.db"
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    # Configuración de producción para PostgreSQL (Neon)
    engine = create_engine(DATABASE_URL, pool_pre_ping=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    """
    Dependencia de FastAPI que creará una sesión de Base de Datos por cada petición
    y se asegurará de cerrarla al terminar.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()