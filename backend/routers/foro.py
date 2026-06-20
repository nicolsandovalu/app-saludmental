from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database import get_db
from models import ForumTopic, ForumPost, User, PacienteProfile
from .auth import get_current_user

router = APIRouter(
    prefix="/api/foro",
    tags=["Comunidad"]
)

# Placeholder para filtro de moderación (puedes ampliarlo o conectarlo a una IA después)
PALABRAS_PROHIBIDAS = ["odio", "insulto", "estúpido", "tonto", "inútil", "matar", "suicidio"]

def moderar_contenido(texto: str):
    texto_lower = texto.lower()
    for palabra in PALABRAS_PROHIBIDAS:
        if palabra in texto_lower:
            raise HTTPException(
                status_code=400, 
                detail="Tu mensaje no cumple con nuestras normas de convivencia y espacio seguro."
            )
    return texto

class TopicCreate(BaseModel):
    title: str
    content: str

class PostCreate(BaseModel):
    topic_id: int
    content: str

@router.get("/")
def get_topics(db: Session = Depends(get_db)):
    topics = db.query(ForumTopic).order_by(ForumTopic.created_at.desc()).all()
    result = []
    for t in topics:
        result.append({
            "id": t.id,
            "title": t.title,
            "author_nickname": t.author.nickname_anonimo,
            "created_at": t.created_at,
            "replies_count": len(t.posts) - 1 # El primer post es el creador del topic
        })
    return result

@router.get("/{topic_id}")
def get_topic_details(topic_id: int, db: Session = Depends(get_db)):
    topic = db.query(ForumTopic).filter(ForumTopic.id == topic_id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Tema no encontrado")
        
    posts_data = []
    for p in topic.posts:
        posts_data.append({
            "id": p.id,
            "content": p.content,
            "author_nickname": p.author.nickname_anonimo,
            "created_at": p.created_at
        })
        
    return {
        "id": topic.id,
        "title": topic.title,
        "author_nickname": topic.author.nickname_anonimo,
        "created_at": topic.created_at,
        "posts": posts_data
    }

@router.post("/topic")
def create_topic(topic_data: TopicCreate, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    # Moderación
    moderar_contenido(topic_data.title)
    moderar_contenido(topic_data.content)
    
    # Obtener perfil del paciente
    paciente = db.query(PacienteProfile).filter(PacienteProfile.user_id == current_user["id"]).first()
    if not paciente:
        raise HTTPException(status_code=403, detail="Solo los pacientes pueden crear temas")

    new_topic = ForumTopic(title=topic_data.title, author_id=paciente.id)
    db.add(new_topic)
    db.commit()
    db.refresh(new_topic)
    
    # Crear el primer post del topic
    first_post = ForumPost(topic_id=new_topic.id, content=topic_data.content, author_id=paciente.id)
    db.add(first_post)
    db.commit()

    return {"message": "Tema creado con éxito", "topic_id": new_topic.id}

@router.post("/post")
def create_post(post_data: PostCreate, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    # Moderación
    moderar_contenido(post_data.content)
    
    # Validar topic
    topic = db.query(ForumTopic).filter(ForumTopic.id == post_data.topic_id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Tema no encontrado")

    # Obtener perfil del paciente
    paciente = db.query(PacienteProfile).filter(PacienteProfile.user_id == current_user["id"]).first()
    if not paciente:
        raise HTTPException(status_code=403, detail="Solo los pacientes pueden responder")

    new_post = ForumPost(topic_id=topic.id, content=post_data.content, author_id=paciente.id)
    db.add(new_post)
    db.commit()
    
    return {"message": "Respuesta publicada con éxito"}
