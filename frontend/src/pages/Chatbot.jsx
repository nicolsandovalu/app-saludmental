import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Loader2, AlertTriangle, ShieldAlert } from 'lucide-react';
import api from '../services/api';

import { useAuth } from '../context/AuthContext';

export default function Chatbot() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmergency, setIsEmergency] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, isEmergency]);

  // Efecto para inicializar el saludo empático silenciosamente
  useEffect(() => {
    if (!hasStarted && user) {
      setHasStarted(true);
      const initChat = async () => {
        setIsLoading(true);
        try {
          const hour = new Date().getHours();
          let timeOfDay = 'día';
          if (hour >= 5 && hour < 12) timeOfDay = 'mañana';
          else if (hour >= 12 && hour < 19) timeOfDay = 'tarde';
          else if (hour >= 19 && hour < 23) timeOfDay = 'noche';
          else timeOfDay = 'madrugada';

          const response = await api.post('/chat/pap', {
            mensaje_usuario: "Hola, acabo de abrir el chat. Por favor salúdame de forma empática.",
            historial: [],
            nickname: user.nickname || user.email?.split('@')[0],
            time_of_day: timeOfDay
          });
          setMessages([{ role: 'model', content: response.data.respuesta }]);
        } catch (error) {
          setMessages([{ role: 'model', content: 'Hola. Estoy aquí para escucharte y acompañarte. ¿Cómo te sientes en este momento?' }]);
        } finally {
          setIsLoading(false);
        }
      };
      initChat();
    }
  }, [user, hasStarted]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || isLoading || isEmergency) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const hour = new Date().getHours();
      let timeOfDay = 'día';
      if (hour >= 5 && hour < 12) timeOfDay = 'mañana';
      else if (hour >= 12 && hour < 19) timeOfDay = 'tarde';
      else if (hour >= 19 && hour < 23) timeOfDay = 'noche';
      else timeOfDay = 'madrugada';

      const response = await api.post('/chat/pap', {
        mensaje_usuario: userMessage,
        historial: messages,
        nickname: user?.nickname || user?.email?.split('@')[0],
        time_of_day: timeOfDay
      });

      const modelReply = response.data.respuesta;

      if (modelReply.includes('ACTIVAR_ALERTA_SOS')) {
        setIsEmergency(true);
      } else {
        setMessages(prev => [...prev, { role: 'model', content: modelReply }]);
      }
    } catch (error) {
      console.error("Error en chat:", error);
      setMessages(prev => [...prev, { role: 'model', content: 'Lo siento, estoy teniendo problemas de conexión. ¿Puedes intentar enviar tu mensaje de nuevo?' }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isEmergency) {
    return (
      <div className="fixed inset-0 z-[100] bg-red-900/90 flex flex-col items-center justify-center p-6 text-center backdrop-blur-md">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }} 
          transition={{ type: "spring", bounce: 0.5 }}
          className="bg-[#1a0f14] border-2 border-red-500 rounded-3xl p-8 max-w-lg shadow-[0_0_50px_rgba(239,68,68,0.5)]"
        >
          <ShieldAlert className="h-20 w-20 text-red-500 mx-auto mb-6 animate-pulse" />
          <h1 className="text-3xl font-bold text-white mb-4">No estás solo</h1>
          <p className="text-red-200 text-lg mb-8">
            He detectado que podrías estar pasando por un momento crítico. Es fundamental que hables con un profesional humano inmediatamente.
          </p>
          
          <div className="space-y-4 mb-8">
            <a href="tel:133" className="block w-full py-4 bg-red-600 hover:bg-red-500 rounded-xl font-bold text-white text-xl transition-colors">
              📞 Llamar a Emergencias (133)
            </a>
            <a href="tel:*4141" className="block w-full py-4 bg-white text-red-900 hover:bg-gray-200 rounded-xl font-bold text-xl transition-colors">
              ❤️ Línea de Prevención del Suicidio (*4141)
            </a>
          </div>

          <button 
            onClick={() => setIsEmergency(false)} 
            className="text-gray-400 hover:text-white underline text-sm"
          >
            Entiendo, quiero volver al chat
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-80px)] md:h-[calc(100vh-40px)] flex flex-col p-4 md:p-6 pb-24 md:pb-6">
      {/* Chat Header */}
      <div className="bg-[#151C2C] border border-white/5 rounded-t-3xl p-4 flex items-center shadow-lg z-10 relative">
        <div className="relative">
          <div className="bg-cyan-500/20 p-3 rounded-full mr-4">
            <Bot className="h-6 w-6 text-cyan-400" />
          </div>
          <div className="absolute bottom-0 right-3 w-3 h-3 bg-emerald-500 border-2 border-[#151C2C] rounded-full"></div>
        </div>
        <div>
          <h2 className="font-bold text-white text-lg">Asistente de Contención (PAP)</h2>
          <p className="text-xs text-emerald-400 font-medium">En línea y escuchando</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto bg-[#0D1321] border-x border-white/5 p-4 space-y-6 scrollbar-hide">
        <AnimatePresence>
          {messages.map((msg, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex max-w-[85%] md:max-w-[75%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                
                {/* Avatar */}
                <div className={`flex-shrink-0 flex items-end ${msg.role === 'user' ? 'ml-2' : 'mr-2'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-cyan-500/20 text-cyan-400'}`}>
                    {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                  </div>
                </div>

                {/* Bubble */}
                <div className={`p-4 rounded-2xl ${
                  msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-br-sm' 
                  : 'bg-[#1A2235] text-gray-200 border border-white/5 rounded-bl-sm shadow-md'
                }`}>
                  <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{msg.content}</p>
                </div>

              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="flex flex-row max-w-[85%]">
              <div className="flex-shrink-0 flex items-end mr-2">
                <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
              </div>
              <div className="bg-[#1A2235] text-gray-400 border border-white/5 p-4 rounded-2xl rounded-bl-sm shadow-md flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                <span className="text-sm">Escribiendo...</span>
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-[#151C2C] border border-white/5 rounded-b-3xl p-4 shadow-lg z-10">
        <form onSubmit={handleSend} className="flex gap-2">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe cómo te sientes aquí..."
            className="flex-1 bg-[#0D1321] text-white border border-white/10 rounded-xl px-5 py-4 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder-gray-500"
          />
          <button 
            type="submit"
            disabled={!input.trim() || isLoading}
            className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-700 disabled:text-gray-500 text-white p-4 rounded-xl transition-colors flex items-center justify-center shadow-[0_0_15px_rgba(8,145,178,0.2)]"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
        <p className="text-[10px] text-center text-gray-500 mt-3 flex items-center justify-center">
          <AlertTriangle className="w-3 h-3 mr-1" /> 
          Esta es una IA de apoyo emocional primario. No sustituye terapia profesional.
        </p>
      </div>
    </div>
  );
}
