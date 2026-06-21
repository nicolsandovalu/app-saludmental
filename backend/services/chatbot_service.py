import os
from google import genai
from google.genai import types

# El cliente tomará automáticamente la variable GEMINI_API_KEY de las variables de entorno
client = genai.Client()

BASE_PROMPT = """Eres un asistente virtual potenciado por Gemini AI, tu contención inteligente disponible 24/7, entrenado estrictamente para proveer Primeros Auxilios Psicológicos (PAP).
Tus directrices fundamentales son:
1. Escucha activa y validación emocional constante. Eres empático, acogedor y no juzgas. NUNCA repitas el mismo saludo inicial.
2. Contención breve y centrada en el aquí y el ahora.
3. CERO diagnósticos médicos, psiquiátricos o psicológicos. No eres un médico ni reemplazas a un profesional de la salud.
4. Si detectas en el usuario ideación suicida, autolesiones, riesgo vital inminente, o una crisis severa, tu ÚNICA respuesta debe ser EXACTAMENTE la siguiente cadena de texto: "ACTIVAR_ALERTA_SOS". No añadas ninguna otra palabra, saludo o justificación en ese caso.

Contexto del usuario:
- Nombre / Apodo: {nickname}
- Momento del día: {time_of_day}
- Estado de ánimo reportado: {mood}

Usa el nombre del usuario ({nickname}) de forma natural y cálida al menos una vez, sin ser repetitivo.
Dado que es de {time_of_day}, adapta tu tono a uno pertinente (ej. si es de noche o madrugada, un tono más pausado y acogedor).
Considera que el estado de ánimo actual reportado por el usuario es: {mood}.
"""

async def generar_respuesta_pap(mensaje_usuario: str, historial: list, nickname: str = None, time_of_day: str = None, mood: str = None) -> str:
    """
    Genera una respuesta utilizando Gemini optimizado para Primeros Auxilios Psicológicos.
    
    :param mensaje_usuario: El mensaje actual enviado por el usuario.
    :param historial: Lista de diccionarios con el historial previo de la conversación.
                      Se espera formato: [{"role": "user"|"model", "content": "texto"}, ...]
    :param nickname: Apodo o nombre del usuario.
    :param time_of_day: Momento del día actual (mañana, tarde, noche, madrugada).
    :return: Texto de la respuesta generada o el trigger de emergencia.
    """
    
    # Construir el system prompt dinámico
    safe_nickname = nickname if nickname else "Amigo/a"
    safe_time = time_of_day if time_of_day else "día"
    safe_mood = mood if mood else "no especificado"
    system_instruction = BASE_PROMPT.format(nickname=safe_nickname, time_of_day=safe_time, mood=safe_mood)
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
            system_instruction=system_instruction,
            temperature=0.4, # Ligero aumento para mayor calidez y variación de saludos
            safety_settings=safety_settings,
        )
    )
    
    return response.text
