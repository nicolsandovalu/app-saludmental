from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
from services.chatbot_service import generar_respuesta_pap

router = APIRouter(
    tags=["Chat"]
)

class ChatRequest(BaseModel):
    mensaje_usuario: str
    historial: List[Dict[str, Any]] = []

@router.post("/api/chat/pap")
async def chat_pap_endpoint(request: ChatRequest):
    try:
        respuesta = await generar_respuesta_pap(
            mensaje_usuario=request.mensaje_usuario,
            historial=request.historial
        )
        return {"respuesta": respuesta}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
