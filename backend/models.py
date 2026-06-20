import enum
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Float, Enum
from sqlalchemy.orm import relationship, declarative_base
from sqlalchemy.sql import func

Base = declarative_base()

class UserRole(str, enum.Enum):
    paciente = "paciente"
    psicologo = "psicologo"

class CitaEstado(str, enum.Enum):
    pendiente = "pendiente"
    confirmada = "confirmada"
    cancelada = "cancelada"

class PagoStatus(str, enum.Enum):
    pendiente = "pendiente"
    aprobado = "aprobado"
    rechazado = "rechazado"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(UserRole), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relaciones bidireccionales (One-to-One)
    paciente_profile = relationship("PacienteProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    psicologo_profile = relationship("PsicologoProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")


class PacienteProfile(Base):
    __tablename__ = "paciente_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    nickname_anonimo = Column(String, unique=True, index=True, nullable=False)
    carrera = Column(String, nullable=True)
    jornada = Column(String, default="vespertino")

    # Relaciones
    user = relationship("User", back_populates="paciente_profile")
    citas = relationship("Cita", back_populates="paciente", cascade="all, delete-orphan")


class PsicologoProfile(Base):
    __tablename__ = "psicologo_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    nombre_completo = Column(String, nullable=False)
    presentacion = Column(Text, nullable=True)
    enfoque_clinico = Column(String, nullable=True)
    tarifa_diurna = Column(Float, nullable=False)
    tarifa_extendida = Column(Float, nullable=False)
    datos_transferencia = Column(Text, nullable=True)

    # Relaciones
    user = relationship("User", back_populates="psicologo_profile")
    citas = relationship("Cita", back_populates="psicologo", cascade="all, delete-orphan")


class Cita(Base):
    __tablename__ = "citas"

    id = Column(Integer, primary_key=True, index=True)
    paciente_id = Column(Integer, ForeignKey("paciente_profiles.id", ondelete="CASCADE"), nullable=False)
    psicologo_id = Column(Integer, ForeignKey("psicologo_profiles.id", ondelete="CASCADE"), nullable=False)
    
    fecha_hora = Column(DateTime(timezone=True), nullable=False)
    estado = Column(Enum(CitaEstado), default=CitaEstado.pendiente, nullable=False)
    pago_simulado_status = Column(Enum(PagoStatus), default=PagoStatus.pendiente, nullable=False)

    # Relaciones
    paciente = relationship("PacienteProfile", back_populates="citas")
    psicologo = relationship("PsicologoProfile", back_populates="citas")
