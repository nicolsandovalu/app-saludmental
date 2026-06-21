import os
import sys
from sqlalchemy.orm import Session
from database import SessionLocal
from models import User, PsicologoProfile, UserRole
from security import get_password_hash

# Mock Data
psicologos = [
    {
        "username": "valentina_silva",
        "email": "valentina@inspirasalud.cl",
        "password": "psico123",
        "profile": {
            "nombre_completo": "Dra. Valentina Silva",
            "presentacion": "Especialidad: Ansiedad y Estrés Académico.",
            "enfoque_clinico": "TCC y Mindfulness",
            "tarifa_base": 25000.0,
            "tarifa_diurna": 25000.0,
            "tarifa_extendida": 30000.0,
            "en_turno": True,
        }
    },
    {
        "username": "andres_rojas",
        "email": "andres@inspirasalud.cl",
        "password": "psico123",
        "profile": {
            "nombre_completo": "Lic. Andrés Rojas",
            "presentacion": "Especialidad: Gestión de Tiempo y Burnout.",
            "enfoque_clinico": "Sistémico",
            "tarifa_base": 20000.0,
            "tarifa_diurna": 20000.0,
            "tarifa_extendida": 25000.0,
            "en_turno": False,
        }
    },
    {
        "username": "camila_torres",
        "email": "camila@inspirasalud.cl",
        "password": "psico123",
        "profile": {
            "nombre_completo": "Ps. Camila Torres",
            "presentacion": "Especialidad: Relaciones Interpersonales y Autoestima.",
            "enfoque_clinico": "Humanista",
            "tarifa_base": 22000.0,
            "tarifa_diurna": 22000.0,
            "tarifa_extendida": 28000.0,
            "en_turno": True,
        }
    },
    {
        "username": "javier_mendez",
        "email": "javier@inspirasalud.cl",
        "password": "psico123",
        "profile": {
            "nombre_completo": "Ps. Javier Méndez",
            "presentacion": "Especialidad: Regulación Emocional nocturna.",
            "enfoque_clinico": "Terapia de Aceptación y Compromiso (ACT)",
            "tarifa_base": 28000.0,
            "tarifa_diurna": 28000.0,
            "tarifa_extendida": 35000.0,
            "en_turno": False,
        }
    }
]

def seed():
    db = SessionLocal()
    try:
        print("Iniciando Database Seeding de Psicólogos...")
        for data in psicologos:
            existing_user = db.query(User).filter(User.email == data["email"]).first()
            if existing_user:
                print(f"[OMITIDO] El usuario {data['email']} ya existe en la base de datos.")
                continue
            
            # Crear User
            hashed_pw = get_password_hash(data["password"])
            new_user = User(
                username=data["username"],
                email=data["email"],
                hashed_password=hashed_pw,
                role=UserRole.psicologo
            )
            db.add(new_user)
            db.flush() # Para obtener el ID

            # Crear Profile
            new_profile = PsicologoProfile(
                user_id=new_user.id,
                **data["profile"]
            )
            db.add(new_profile)
            
            print(f"[CREADO] Psicólogo insertado exitosamente: {data['profile']['nombre_completo']} ({data['email']})")
        
        db.commit()
        print("Seeding completado exitosamente.")
    except Exception as e:
        db.rollback()
        print(f"[ERROR] Ocurrió un error durante el seeding: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed()
