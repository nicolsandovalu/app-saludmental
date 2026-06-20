import os
from google import genai
from google.genai import types

# El cliente tomará automáticamente la variable GEMINI_API_KEY de las variables de entorno
client = genai.Client()

SYSTEM_PROMPT = """Eres un asistente virtual entrenado estrictamente para proveer Primeros Auxilios Psicológicos (PAP).
Tus directrices fundamentales son:
1. Escucha activa y validación emocional constante.
2. Contención breve, empática y centrada en el aquí y el ahora.
3. CERO diagnósticos médicos, psiquiátricos o psicológicos. No eres un médico ni reemplazas a un profesional de la salud.
4. Si detectas en el usuario ideación suicida, autolesiones, riesgo vital inminente, o una crisis severa, tu ÚNICA respuesta debe ser EXACTAMENTE la siguiente cadena de texto: "ACTIVAR_ALERTA_SOS". No añadas ninguna otra palabra, saludo o justificación en ese caso.

Mantén tus respuestas compasivas, concisas y no juzgues al usuario en ningún momento."""

async def generar_respuesta_pap(mensaje_usuario: str, historial: list) -> str:
    """
    Genera una respuesta utilizando Gemini optimizado para Primeros Auxilios Psicológicos.
    
    :param mensaje_usuario: El mensaje actual enviado por el usuario.
    :param historial: Lista de diccionarios con el historial previo de la conversación.
                      Se espera formato: [{"role": "user"|"model", "content": "texto"}, ...]
    :return: Texto de la respuesta generada o el trigger de emergencia.
    """
    contents = []
    
    # Procesar el historial previo para darle contexto a Gemini
    for msg in historial:
        role = msg.get("role", "user")
        # Asegurarnos de que el rol sea "user" o "model"
        if role not in ["user", "model"]:
            role = "user"
            
        texto = msg.get("content", "")
        if texto:
            contents.append(
                types.Content(role=role, parts=[types.Part.from_text(text=texto)])
            )
            
    # Añadir el mensaje actual del usuario
    contents.append(
        types.Content(role="user", parts=[types.Part.from_text(text=mensaje_usuario)])
    )

    # Configuración de los filtros de seguridad al nivel más estricto
    safety_settings = [
        types.SafetySetting(
            category=types.HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold=types.HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
        ),
        types.SafetySetting(
            category=types.HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold=types.HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
        ),
        types.SafetySetting(
            category=types.HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold=types.HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
        ),
        types.SafetySetting(
            category=types.HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold=types.HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
        ),
    ]

    # Generación asíncrona de la respuesta
    response = await client.aio.models.generate_content(
        model='gemini-2.5-flash',
        contents=contents,
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPT,
            temperature=0.2, # Baja creatividad para respuestas clínicas, consistentes y evitar alucinaciones
            safety_settings=safety_settings,
        )
    )
    
    return response.text
