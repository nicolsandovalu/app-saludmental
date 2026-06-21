import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Loader2, AlertTriangle, ShieldAlert, ArrowRight } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLocation, useNavigate, useOutletContext } from 'react-router-dom';

export default function Chatbot() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmergency, setIsEmergency] = useState(false);
  const { setShowSOS } = useOutletContext();

  // Triage States
  const [triagePhase, setTriagePhase] = useState('greeting'); // 'greeting', 'branching', 'free'
  const [showTriageSuggestions, setShowTriageSuggestions] = useState(true);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, isEmergency]);

  // Efecto para inicializar el saludo empático silenciosamente
  useEffect(() => {
    const initChat = async () => {
      if (messages.length > 0) return;

      const initialMsg = location.state?.initialMessage;
      if (initialMsg) {
        setMessages([{ role: 'user', content: initialMsg }]);
        setTriagePhase('free');
        setShowTriageSuggestions(false);
        handleSendFreeText(initialMsg, true);
      } else {
        // Step 1: Saludo inicial empático
        const nombre = user?.nombre || user?.nombre_completo || user?.nickname || user?.email?.split('@')[0] || "Usuario";
        setMessages([{
          role: 'model',
          content: `Hola, ${nombre}. ¿Cómo te sientes hoy? Estoy aquí para escucharte y acompañarte.`
        }]);
      }
    };
    initChat();
  }, [user, location.state]);

  const handleTriageSelection = (selection) => {
    setShowTriageSuggestions(false);
    setMessages(prev => [...prev, { role: 'user', content: selection }]);
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      if (selection === "Estresado Académico" || selection === "Ansioso") {
        setMessages(prev => [...prev, {
          role: 'model',
          content: "Entiendo perfectamente, estudiar de madrugada o tener mucha carga puede ser agotador. ¿Te gustaría realizar un ejercicio breve de respiración guiada para calmar la mente?"
        }]);
      } else if (selection === "Triste" || selection === "Necesito un Especialista") {
        setMessages(prev => [...prev, {
          role: 'model',
          content: "Siento mucho escuchar eso. Para este nivel de malestar, lo mejor es conectar con un humano. Te sugiero ver nuestros especialistas disponibles para telemedicina ahora mismo.",
          isRedirect: true
        }]);
      }
      setTriagePhase('free');
    }, 1500);
  };

  const handleSendFreeText = async (messageText, isInitial = false) => {
    const userMessage = messageText.trim();
    if (!userMessage) return;

    if (!isInitial) {
      setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
      setShowTriageSuggestions(false);
      setTriagePhase('free');
    }

    setIsLoading(true);

    try {
      const hour = new Date().getHours();
      let timeOfDay = 'día';
      if (hour >= 5 && hour < 12) timeOfDay = 'mañana';
      else if (hour >= 12 && hour < 19) timeOfDay = 'tarde';
      else if (hour >= 19 && hour < 23) timeOfDay = 'noche';
      else timeOfDay = 'madrugada';

      const userMood = localStorage.getItem('user_mood') || 'no especificado';

      const response = await api.post('/chat/pap', {
        mensaje_usuario: userMessage,
        historial: messages.filter(m => !m.isRedirect),
        nickname: user?.nombre || user?.nombre_completo || user?.nickname || user?.email?.split('@')[0],
        time_of_day: timeOfDay,
        mood: userMood
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

  const onSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading || isEmergency) return;
    const currentInput = input;
    setInput('');
    handleSendFreeText(currentInput);
  };

  if (isEmergency) {
    return (
      <div className="fixed inset-0 z-[100] bg-red-900/90 flex flex-col items-center justify-center p-6 text-center backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="bg-[#1a0f14] border-2 border-red-500 rounded-3xl p-8 w-full max-w-lg shadow-[0_0_50px_rgba(239,68,68,0.5)]"
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
              ❤️ Línea Prevención del Suicidio (*4141)
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
    <div className="w-full max-w-4xl mx-auto h-[calc(100dvh-80px)] md:h-[calc(100vh-40px)] flex flex-col font-sans">
      {/* Chat Header */}
      <div className="bg-[#1A2639] border-b border-white/5 md:rounded-t-3xl p-4 sm:p-5 flex items-center shadow-lg z-10 relative">
        <div className="relative">
          <div className="bg-cyan-500/20 p-3 rounded-full mr-4">
            <Bot className="h-6 w-6 text-cyan-400" />
          </div>
          <div className="absolute bottom-0 right-3 w-3 h-3 bg-emerald-500 border-2 border-[#1A2639] rounded-full"></div>
        </div>
        <div className="flex-1">
          <h2 className="font-bold text-[#E2E8F0] text-base sm:text-lg leading-tight">Asistente de Contención</h2>
          <p className="text-[11px] sm:text-xs text-emerald-400 font-medium">En línea y escuchando</p>
        </div>
        <button 
          onClick={() => setShowSOS(true)}
          className="ml-2 bg-[#FC8181] hover:bg-[#F56565] text-white px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-black tracking-widest shadow-md transition-colors border border-white/20"
        >
          SOS
        </button>
      </div>

      <div className="bg-gradient-to-r from-[#0B1321] to-[#1A2639] p-2 text-center text-[10px] sm:text-xs text-[#94A3B8] shadow-inner border-b border-white/5">
        Este asistente está potenciado por <span className="font-semibold text-[#A855F7]">Gemini AI</span>, tu contención inteligente disponible 24/7.
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto bg-[#0B1321] p-4 sm:p-6 space-y-6 scrollbar-hide md:border-x border-white/5">
        <AnimatePresence>
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex w-full ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>

                {/* Avatar */}
                <div className={`flex-shrink-0 flex items-end ${msg.role === 'user' ? 'ml-2' : 'mr-2'}`}>
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-cyan-500/20 text-cyan-400'}`}>
                    {msg.role === 'user' ? <User className="w-4 h-4 sm:w-5 sm:h-5" /> : <Bot className="w-4 h-4 sm:w-5 sm:h-5" />}
                  </div>
                </div>

                {/* Bubble */}
                <div className="max-w-[85%] sm:max-w-[75%] flex flex-col">
                  <div className={`px-4 py-3 sm:px-5 sm:py-4 rounded-3xl ${msg.role === 'user'
                    ? 'bg-gradient-to-tr from-[#6366F1] to-[#818CF8] text-white rounded-br-sm shadow-md'
                    : 'bg-[#1A2639] text-[#E2E8F0] border border-white/5 rounded-bl-sm shadow-[0_4px_20px_rgba(0,0,0,0.2)]'
                    }`}>
                    <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{msg.content}</p>
                  </div>

                  {msg.isRedirect && (
                    <button
                      onClick={() => navigate('/dashboard/especialistas')}
                      className="mt-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl py-3 px-4 font-bold flex items-center justify-center shadow-lg transition-colors text-sm"
                    >
                      Buscar Especialistas Ahora <ArrowRight className="ml-2 w-4 h-4" />
                    </button>
                  )}
                </div>

              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="flex flex-row w-full max-w-[85%] sm:max-w-[75%]">
              <div className="flex-shrink-0 flex items-end mr-2">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
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
      <div className="bg-[#1A2639] md:rounded-b-3xl p-4 sm:p-5 shadow-[0_-10px_40px_rgba(0,0,0,0.3)] z-10 border-t border-white/5 relative">

        {/* Triage Suggestions */}
        <AnimatePresence>
          {showTriageSuggestions && triagePhase === 'greeting' && !isLoading && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-wrap gap-2 mb-4 justify-center"
            >
              {["Estresado Académico", "Ansioso", "Triste", "Necesito un Especialista"].map((sug, i) => (
                <button
                  key={i}
                  onClick={() => handleTriageSelection(sug)}
                  className="px-4 py-2.5 bg-[#4FD1C5]/10 text-[#4FD1C5] border border-[#4FD1C5]/30 rounded-full text-xs sm:text-sm font-semibold hover:bg-[#4FD1C5]/20 hover:scale-105 transition-all shadow-sm"
                >
                  {sug}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={onSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe tu mensaje aquí..."
            className="w-full bg-[#0B1321] text-[#E2E8F0] border border-white/10 rounded-full pl-5 pr-12 py-3 sm:py-4 focus:outline-none focus:border-[#4FD1C5]/50 focus:ring-1 focus:ring-[#4FD1C5]/50 transition-all placeholder-[#64748B] text-[15px]"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="flex-shrink-0 bg-[#4FD1C5] hover:bg-[#38B2AC] disabled:bg-gray-700 disabled:text-gray-500 text-[#0B1321] h-12 w-12 sm:h-14 sm:w-14 rounded-full transition-all flex items-center justify-center shadow-[0_0_15px_rgba(79,209,197,0.3)] ml-2"
          >
            <Send className="w-5 h-5 ml-1" />
          </button>
        </form>
        <p className="text-[10px] text-center text-gray-500 mt-2 sm:mt-3 flex items-center justify-center">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Esta es una IA de apoyo emocional primario. No sustituye terapia profesional.
        </p>
      </div>
    </div>
  );
}
