import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Users, Plus, ArrowLeft, Search, Heart, MessageCircle, Send, Phone } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';

const MOCK_THEMES = [
  { id: 'all', label: 'Todos' },
  { id: 'estres', label: 'Estrés', neon: 'text-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)] border-amber-500/50' },
  { id: 'depresion', label: 'Depresión', neon: 'text-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.5)] border-blue-500/50' },
  { id: 'academico', label: 'Carga Académica', neon: 'text-indigo-400 shadow-[0_0_10px_rgba(129,140,248,0.5)] border-indigo-500/50' },
  { id: 'ansiedad', label: 'Ansiedad', neon: 'text-[#4FD1C5] shadow-[0_0_10px_rgba(79,209,197,0.5)] border-[#4FD1C5]/50' },
];

const MOCK_THREADS = [
  {
    id: 1,
    title: "¿Cómo lidian con la culpa de descansar?",
    author: "EstudianteAnónimo_23",
    theme: "academico",
    content: "Siento que cada vez que me tomo un domingo libre, estoy perdiendo el tiempo y voy a reprobar todo. ¿Alguien más se siente así? ¿Cómo lo manejan?",
    replies: 14,
    likes: 32,
    time: "Hace 2 horas",
    messages: [
      { id: 101, author: "Noctambulo99", content: "Me pasa lo mismo. Empecé a usar la regla de 'descanso obligatorio' y agendarlo como si fuera una clase más. Si no descanso, rindo menos al día siguiente.", time: "Hace 1 hora", isOwn: false },
      { id: 102, author: "GatoEstudioso", content: "El descanso es productivo. Tu cerebro necesita asimilar lo que estudiaste. No eres una máquina.", time: "Hace 45 min", isOwn: false }
    ]
  },
  {
    id: 2,
    title: "Ataques de pánico antes de disertar",
    author: "User_8492",
    theme: "ansiedad",
    content: "Mañana tengo presentación de tesis y no puedo respirar bien de solo pensarlo. Algún tip de emergencia?",
    replies: 8,
    likes: 45,
    time: "Hace 5 horas",
    messages: []
  },
  {
    id: 3,
    title: "Me siento estancado y sin motivación",
    author: "BlueSky",
    theme: "depresion",
    content: "Ya voy en tercer año y no le veo sentido a la carrera, no me levanto con ganas. Quería desahogarme porque mi familia no me entiende.",
    replies: 22,
    likes: 67,
    time: "Hace 1 día",
    messages: []
  }
];

export default function Comunidad() {
  const [activeTheme, setActiveTheme] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedThread, setSelectedThread] = useState(null);
  const [activeMessages, setActiveMessages] = useState([]);
  
  // States for new reply
  const [replyInput, setReplyInput] = useState('');
  
  // Create Thread modal
  const [isCreating, setIsCreating] = useState(false);
  
  // Extraer función de contexto del Layout para abrir el SOS modal
  const context = useOutletContext() || {};
  const setShowSOS = context.setShowSOS || (() => {});

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (selectedThread) {
      scrollToBottom();
    }
  }, [activeMessages, selectedThread]);

  const filteredThreads = MOCK_THREADS.filter(thread => {
    const matchesTheme = activeTheme === 'all' || thread.theme === activeTheme;
    const matchesSearch = thread.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTheme && matchesSearch;
  });

  const handleOpenThread = (thread) => {
    setSelectedThread(thread);
    setActiveMessages(thread.messages);
  };

  const handleSendReply = (e) => {
    e.preventDefault();
    if (!replyInput.trim()) return;
    
    const newMessage = {
      id: Date.now(),
      author: "Tú",
      content: replyInput.trim(),
      time: "Ahora",
      isOwn: true
    };
    
    setActiveMessages(prev => [...prev, newMessage]);
    setReplyInput('');
  };

  const getThemeNeonClass = (themeId) => {
    const theme = MOCK_THEMES.find(t => t.id === themeId);
    return theme?.neon || 'text-[#94A3B8] border-white/10';
  };
  
  const getThemeLabel = (themeId) => {
    const theme = MOCK_THEMES.find(t => t.id === themeId);
    return theme?.label || 'General';
  };

  if (selectedThread) {
    return (
      <div className="flex flex-col bg-[#0B1321] font-sans w-full max-w-4xl mx-auto h-[calc(100dvh-96px)] md:h-[calc(100vh-120px)]">
        {/* Header / Thread Info (Fixed Top) */}
        <div className="bg-[#1A2639] border-b border-white/5 p-4 shadow-md z-10 shrink-0 max-w-4xl mx-auto w-full">
          <button 
            onClick={() => setSelectedThread(null)}
            className="flex items-center text-[#94A3B8] hover:text-[#E2E8F0] mb-2 transition-colors w-fit text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Volver
          </button>

          <div className="flex items-center space-x-3 mb-3">
            <span className={`px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold border ${getThemeNeonClass(selectedThread.theme)}`}>
              {getThemeLabel(selectedThread.theme)}
            </span>
            <span className="text-[#94A3B8] text-xs font-medium">{selectedThread.time}</span>
          </div>
          
          <h1 className="text-xl sm:text-2xl font-bold text-[#E2E8F0] mb-2 leading-tight">{selectedThread.title}</h1>
          
          <p className="text-[#94A3B8] leading-relaxed text-sm sm:text-[15px] p-3 sm:p-4 bg-[#0B1321] rounded-2xl border border-white/5 mt-3 line-clamp-3 hover:line-clamp-none transition-all">
            <span className="font-bold text-[#E2E8F0] mr-2">{selectedThread.author}:</span>
            {selectedThread.content}
          </p>
        </div>

        {/* Scrollable Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scrollbar-hide bg-[#0B1321] w-full max-w-4xl mx-auto">
          {activeMessages.length > 0 ? (
            activeMessages.map(msg => (
              <div key={msg.id} className={`flex w-full ${msg.isOwn ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex max-w-[85%] sm:max-w-[75%] ${msg.isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                  
                  {/* Avatar */}
                  <div className={`flex-shrink-0 flex items-end ${msg.isOwn ? 'ml-3' : 'mr-3'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${msg.isOwn ? 'bg-[#4FD1C5]/20 text-[#4FD1C5]' : 'bg-[#1A2639] text-[#94A3B8] border border-white/10'}`}>
                      {msg.author.substring(0,2).toUpperCase()}
                    </div>
                  </div>

                  {/* Bubble */}
                  <div className="flex flex-col">
                    <div className={`flex items-center space-x-2 mb-1 ${msg.isOwn ? 'justify-end' : 'justify-start'}`}>
                      <span className="font-bold text-[#E2E8F0] text-xs">{msg.author}</span>
                      <span className="text-[10px] text-[#94A3B8]">{msg.time}</span>
                    </div>
                    
                    <div className={`p-4 rounded-2xl shadow-sm ${
                      msg.isOwn 
                      ? 'bg-[#1A2639] text-[#E2E8F0] rounded-br-sm border border-[#4FD1C5]/20' 
                      : 'bg-[#1A2639] text-[#94A3B8] rounded-bl-sm border border-white/5'
                    }`}>
                      <p className="text-[14px] sm:text-[15px] leading-relaxed">{msg.content}</p>
                    </div>
                  </div>

                </div>
              </div>
            ))
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-center text-[#94A3B8] bg-[#1A2639] px-6 py-4 rounded-2xl border border-white/5 border-dashed">
                Sé el primero en aportar a esta conversación.
              </p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input para responder (Fixed Bottom) */}
        <div className="bg-[#1A2639] border-t border-white/5 p-3 shrink-0 z-10 shadow-[0_-10px_40px_rgba(0,0,0,0.3)] w-full max-w-4xl mx-auto">
          <form onSubmit={handleSendReply} className="flex items-end gap-2">
            <textarea 
              value={replyInput}
              onChange={(e) => setReplyInput(e.target.value)}
              placeholder="Aporta a la conversación..."
              className="w-full bg-[#0B1321] text-[#E2E8F0] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#4FD1C5]/50 resize-none h-12 max-h-32 text-sm placeholder-[#94A3B8] scrollbar-hide"
            />
            <button 
              type="submit"
              disabled={!replyInput.trim()} 
              className="bg-[#4FD1C5] hover:bg-[#38B2AC] disabled:opacity-50 disabled:bg-[#1A2639] text-[#0B1321] disabled:text-[#94A3B8] p-3 rounded-xl transition-colors flex-shrink-0 flex items-center justify-center shadow-lg"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto pb-32 md:pb-8 font-sans space-y-8 bg-[#0B1321]">
      
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-[#E2E8F0] mb-2 flex items-center">
            <Users className="mr-3 h-8 w-8 text-[#4FD1C5]" /> Foros de Comunidad
          </h1>
          <p className="text-[#94A3B8] max-w-xl">Un espacio seguro y anónimo para compartir experiencias, dudas y apoyo mutuo. Todos merecemos ser escuchados.</p>
        </div>

        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3">
          <button 
            onClick={() => setShowSOS(true)}
            className="flex md:hidden w-full sm:w-auto py-3.5 px-6 bg-[#FC8181]/10 border border-[#FC8181]/50 text-[#FC8181] rounded-xl font-bold hover:bg-[#FC8181]/20 transition-all items-center justify-center shadow-[0_0_15px_rgba(252,129,129,0.2)]"
          >
            <Phone className="w-5 h-5 mr-2 animate-pulse" /> SOS
          </button>
          <button 
            onClick={() => setIsCreating(true)}
            className="w-full sm:w-auto py-3.5 px-6 bg-[#1A2639] hover:bg-[#1A2639]/80 border border-[#4FD1C5]/30 text-[#4FD1C5] rounded-xl font-bold shadow-[0_0_15px_rgba(79,209,197,0.1)] transition-all flex items-center justify-center"
          >
            <Plus className="w-5 h-5 mr-2" /> Iniciar Tema
          </button>
        </div>
      </div>

      {/* Buscador */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94A3B8]" />
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar conversaciones..."
          className="w-full bg-[#1A2639] text-[#E2E8F0] border border-white/5 rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:border-[#4FD1C5]/50 focus:ring-1 focus:ring-[#4FD1C5]/50 transition-all placeholder-[#94A3B8]"
        />
      </div>

      {/* Temáticas Neon */}
      <div>
        <h3 className="text-sm font-bold text-[#94A3B8] uppercase tracking-wider mb-4">Filtrar por Temática</h3>
        <div className="flex flex-wrap gap-3">
          {MOCK_THEMES.map(theme => (
            <button
              key={theme.id}
              onClick={() => setActiveTheme(theme.id)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 border ${
                activeTheme === theme.id 
                ? theme.neon || 'bg-white/10 text-[#E2E8F0] border-white/20'
                : 'bg-[#1A2639] text-[#94A3B8] border-white/5 hover:border-white/20 hover:bg-[#1A2639]/80'
              }`}
            >
              {theme.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Foros (Threads) */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredThreads.map(thread => (
            <motion.div 
              key={thread.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={() => handleOpenThread(thread)}
              className="bg-[#1A2639] border border-white/5 hover:border-[#4FD1C5]/30 rounded-2xl p-5 md:p-6 cursor-pointer transition-all group shadow-lg"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${getThemeNeonClass(thread.theme)}`}>
                      {getThemeLabel(thread.theme)}
                    </span>
                    <span className="text-[#94A3B8] text-xs font-medium">{thread.time}</span>
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-[#E2E8F0] group-hover:text-[#4FD1C5] transition-colors mb-2 leading-snug">
                    {thread.title}
                  </h3>
                  <p className="text-[#94A3B8] text-sm line-clamp-2 leading-relaxed">
                    {thread.content}
                  </p>
                </div>
                
                {/* Stats */}
                <div className="flex items-center gap-4 md:flex-col md:items-end md:gap-2 border-t border-white/5 md:border-t-0 pt-4 md:pt-0 shrink-0">
                  <div className="flex items-center text-[#94A3B8] bg-[#0B1321] px-3 py-1.5 rounded-lg border border-white/5">
                    <MessageCircle className="w-4 h-4 mr-1.5 text-[#4FD1C5]" /> 
                    <span className="text-xs font-bold text-[#E2E8F0]">{thread.replies}</span>
                  </div>
                  <div className="flex items-center text-[#94A3B8] bg-[#0B1321] px-3 py-1.5 rounded-lg border border-white/5">
                    <Heart className="w-4 h-4 mr-1.5 text-pink-400" /> 
                    <span className="text-xs font-bold text-[#E2E8F0]">{thread.likes}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          {filteredThreads.length === 0 && (
            <div className="text-center py-16 bg-[#1A2639] rounded-3xl border border-white/5">
              <p className="text-[#94A3B8] font-medium">No hay foros activos en esta categoría aún.</p>
              <button onClick={() => setIsCreating(true)} className="mt-4 text-[#4FD1C5] font-bold hover:underline">¡Sé el primero en crear uno!</button>
            </div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
