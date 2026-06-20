from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI(title="Salud Mental API")

# 1. Configuración CORS Inmediata
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from routers import chat, auth, mood, appointments, psicologos, foro
from database import engine
import models

# Crea automáticamente las tablas en PostgreSQL (o SQLite según el entorno) si no existen
models.Base.metadata.create_all(bind=engine)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Mental Health API"}

app.include_router(chat.router)
app.include_router(auth.router)
app.include_router(mood.router)
app.include_router(appointments.router)
app.include_router(psicologos.router)
app.include_router(foro.router)
