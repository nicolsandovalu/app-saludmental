from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from services.chatbot_service import generar_respuesta_pap

router = APIRouter(
    tags=["Chat"]
)

class ChatRequest(BaseModel):
    mensaje_usuario: str
    historial: List[Dict[str, Any]] = []
    nickname: Optional[str] = None
    time_of_day: Optional[str] = None

@router.post("/api/chat/pap")
async def chat_pap_endpoint(request: ChatRequest):
    try:
        respuesta = await generar_respuesta_pap(
            mensaje_usuario=request.mensaje_usuario,
            historial=request.historial,
            nickname=request.nickname,
            time_of_day=request.time_of_day
        )
        return {"respuesta": respuesta}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
