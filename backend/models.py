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
    username = Column(String, unique=True, index=True, nullable=False)
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
    
    nombre = Column(String, default="", nullable=False)
    apellido = Column(String, default="", nullable=False)
    nickname_anonimo = Column(String, unique=True, index=True, nullable=False)
    carrera = Column(String, nullable=True)
    jornada = Column(String, default="vespertino")
    sesiones_gratuitas_restantes = Column(Integer, default=3)

    # Relaciones
    user = relationship("User", back_populates="paciente_profile")
    citas = relationship("Cita", back_populates="paciente", cascade="all, delete-orphan")
    mood_logs = relationship("MoodLog", back_populates="paciente", cascade="all, delete-orphan")


class MoodLog(Base):
    __tablename__ = "mood_logs"

    id = Column(Integer, primary_key=True, index=True)
    paciente_id = Column(Integer, ForeignKey("paciente_profiles.id", ondelete="CASCADE"), nullable=False)
    mood = Column(String, nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    # Relación
    paciente = relationship("PacienteProfile", back_populates="mood_logs")


class PsicologoProfile(Base):
    __tablename__ = "psicologo_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    nombre_completo = Column(String, nullable=False)
    presentacion = Column(Text, nullable=True)
    enfoque_clinico = Column(String, nullable=True)
    tarifa_base = Column(Float, default=0.0)
    tarifa_diurna = Column(Float, nullable=False)
    tarifa_extendida = Column(Float, nullable=False)
    en_turno = Column(Boolean, default=False)
    moneda = Column(String, default="CLP", nullable=False)
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
    tipo_pago = Column(String, nullable=True) # 'subsidio_institucional' o 'copago_alumno'
    monto_total = Column(Float, nullable=True)
    honorario_psicologo = Column(Float, nullable=True)

    # Relaciones
    paciente = relationship("PacienteProfile", back_populates="citas")
    psicologo = relationship("PsicologoProfile", back_populates="citas")

class ForumTopic(Base):
    __tablename__ = "forum_topics"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    theme = Column(String, default="General", nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Autor
    author_id = Column(Integer, ForeignKey("paciente_profiles.id", ondelete="CASCADE"), nullable=False)
    author = relationship("PacienteProfile")

    posts = relationship("ForumPost", back_populates="topic", cascade="all, delete-orphan")


class ForumPost(Base):
    __tablename__ = "forum_posts"

    id = Column(Integer, primary_key=True, index=True)
    topic_id = Column(Integer, ForeignKey("forum_topics.id", ondelete="CASCADE"), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Autor
    author_id = Column(Integer, ForeignKey("paciente_profiles.id", ondelete="CASCADE"), nullable=False)
    author = relationship("PacienteProfile")

    topic = relationship("ForumTopic", back_populates="posts")
