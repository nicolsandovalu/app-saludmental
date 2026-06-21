import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Users, Search, BookHeart, Send, Video, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const moodData = [
  { id: 'calma', emoji: '😌', label: 'Calma' },
  { id: 'neutro', emoji: '😐', label: 'Neutro' },
  { id: 'triste', emoji: '😔', label: 'Triste' },
  { id: 'ansioso', emoji: '😰', label: 'Ansioso' },
  { id: 'estres', emoji: '😫', label: 'Estrés' }
];

export default function PacienteDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [selectedMood, setSelectedMood] = useState(null);
  const [moodNote, setMoodNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Triage state
  const [triageStep, setTriageStep] = useState(0);
  const [customSearch, setCustomSearch] = useState('');

  // Agenda Modal state
  const [showAgenda, setShowAgenda] = useState(false);
  const [upcomingCita, setUpcomingCita] = useState(null);

  React.useEffect(() => {
    const fetchUpcoming = async () => {
      try {
        const response = await api.get('/appointments/upcoming');
        setUpcomingCita(response.data); // will be null if no appointment
      } catch (error) {
        console.error('Error fetching upcoming appointment:', error);
      }
    };
    fetchUpcoming();
  }, []);

  // Bitácora history state
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('bitacora_history');
    return saved ? JSON.parse(saved) : [];
  });

  const userName = user?.nickname || user?.email?.split('@')[0] || "Usuario";

  const hour = new Date().getHours();
  let greeting = 'Buenas noches';
  if (hour >= 6 && hour < 12) greeting = 'Buenos días';
  else if (hour >= 12 && hour < 19) greeting = 'Buenas tardes';

  const handleSaveBitacora = async () => {
    if (!selectedMood) return;
    setIsSaving(true);
    
    const newEntry = {
      mood: selectedMood,
      nota: moodNote,
      date: new Date().toISOString()
    };
    
    try {
      await api.post('/mood/', { mood: selectedMood, nota: moodNote });
      
      const newHistory = [newEntry, ...history].slice(0, 2);
      setHistory(newHistory);
      localStorage.setItem('bitacora_history', JSON.stringify(newHistory));

      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setSelectedMood(null);
        setMoodNote('');
      }, 3000);
    } catch (error) {
      console.error("Error guardando la bitácora:", error);
      // Fallback para demo
      const newHistory = [newEntry, ...history].slice(0, 2);
      setHistory(newHistory);
      localStorage.setItem('bitacora_history', JSON.stringify(newHistory));

      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setSelectedMood(null);
        setMoodNote('');
      }, 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6 font-sans pb-32 md:pb-8 relative">
      
      {/* ZONA SUPERIOR: El Asistente IA de Bienvenida (Triage) */}
      <motion.div initial="hidden" animate="visible" variants={cardVariants} className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-[#E2E8F0] tracking-tight mb-1">
            {greeting}, <span className="text-[#C3DAFE]">{userName}</span>
          </h1>
          <p className="text-[#94A3B8] text-base md:text-lg">Un nuevo día para cuidar de ti.</p>
        </div>

        <div className="bg-[#1A2639] border border-white/5 rounded-3xl p-5 md:p-6 shadow-2xl relative overflow-hidden min-h-[220px] transition-all">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#6366F1]/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
          
          <AnimatePresence mode="wait">
            {triageStep === 0 ? (
              <motion.div key="step0" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="relative z-10">
                <div className="flex items-start space-x-3 mb-5">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#6366F1] to-[#A855F7] flex items-center justify-center flex-shrink-0 shadow-[0_0_20px_rgba(99,102,241,0.3)]">
                    <MessageCircle className="h-6 w-6 text-white" />
                  </div>
                  <div className="pt-1">
                    <h2 className="text-[#E2E8F0] text-lg font-bold mb-0.5">¿Cómo puedo apoyarte hoy?</h2>
                    <p className="text-[#94A3B8] text-sm">Estoy aquí para escucharte y guiarte hacia el mejor recurso.</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <button 
                    onClick={() => setTriageStep(1)}
                    className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#0B1321]/50 border border-white/5 hover:border-[#818CF8]/50 hover:bg-[#818CF8]/10 transition-all group shadow-sm"
                  >
                    <div className="h-10 w-10 rounded-full bg-[#818CF8]/20 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <Search className="h-5 w-5 text-[#818CF8]" />
                    </div>
                    <span className="text-[#E2E8F0] font-semibold text-center text-xs">Especialista</span>
                  </button>

                  <button 
                    onClick={() => navigate('/dashboard/chat')}
                    className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#0B1321]/50 border border-white/5 hover:border-[#4FD1C5]/50 hover:bg-[#4FD1C5]/10 transition-all group shadow-sm"
                  >
                    <div className="h-10 w-10 rounded-full bg-[#4FD1C5]/20 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <MessageCircle className="h-5 w-5 text-[#4FD1C5]" />
                    </div>
                    <span className="text-[#E2E8F0] font-semibold text-center text-xs">Asistente IA</span>
                  </button>

                  <button 
                    onClick={() => navigate('/dashboard/comunidad')}
                    className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#0B1321]/50 border border-white/5 hover:border-[#C084FC]/50 hover:bg-[#C084FC]/10 transition-all group shadow-sm"
                  >
                    <div className="h-10 w-10 rounded-full bg-[#C084FC]/20 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <Users className="h-5 w-5 text-[#C084FC]" />
                    </div>
                    <span className="text-[#E2E8F0] font-semibold text-center text-xs">Comunidad</span>
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="relative z-10">
                <div className="flex items-start space-x-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#6366F1] to-[#A855F7] flex items-center justify-center flex-shrink-0 shadow-[0_0_20px_rgba(99,102,241,0.3)]">
                    <MessageCircle className="h-6 w-6 text-white" />
                  </div>
                  <div className="pt-1">
                    <h2 className="text-[#E2E8F0] text-lg font-bold mb-0.5">Entiendo. ¿Qué buscas?</h2>
                    <p className="text-[#94A3B8] text-sm">¿Sobre qué tema te gustaría conversar con un especialista?</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4 pl-14">
                  {['Ansiedad', 'Depresión', 'Sobrecarga académica', 'Autoestima', 'Estrés'].map((opt) => (
                    <button 
                      key={opt}
                      onClick={() => navigate('/dashboard/especialistas', { state: { filtro: opt } })}
                      className="px-4 py-2 bg-[#0B1321]/60 hover:bg-[#818CF8]/20 text-[#C3DAFE] text-sm font-medium rounded-full border border-white/5 hover:border-[#818CF8]/40 transition-colors"
                    >
                      {opt}
                    </button>
                  ))}
                </div>

                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (customSearch.trim()) navigate('/dashboard/especialistas', { state: { filtro: customSearch } });
                  }}
                  className="pl-14 mb-4 relative max-w-xs"
                >
                  <input 
                    type="text" 
                    value={customSearch}
                    onChange={(e) => setCustomSearch(e.target.value)}
                    placeholder="O escribe lo que sientes..."
                    className="w-full bg-[#0B1321]/50 text-[#E2E8F0] border border-white/10 rounded-full pl-4 pr-10 py-2 focus:outline-none focus:border-[#818CF8]/50 focus:ring-1 focus:ring-[#818CF8]/50 transition-all placeholder-[#475569] text-sm"
                  />
                  <button type="submit" disabled={!customSearch.trim()} className="absolute right-2 top-1.5 p-1 text-[#818CF8] hover:text-[#C3DAFE] disabled:opacity-50 transition-colors">
                    <Send className="h-4 w-4" />
                  </button>
                </form>
                
                <div className="pl-14">
                  <button 
                    onClick={() => { setTriageStep(0); setCustomSearch(''); }}
                    className="text-xs font-semibold text-[#94A3B8] hover:text-[#E2E8F0] underline underline-offset-2 transition-colors"
                  >
                    Volver a las opciones
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* ZONA MEDIA: Próxima Sesión */}
      {upcomingCita && (
        <motion.div initial="hidden" animate="visible" variants={cardVariants} transition={{ delay: 0.05 }}>
          <div className="bg-gradient-to-r from-[#1A2639] to-[#1E293B] border border-white/5 rounded-3xl p-5 md:p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative overflow-hidden">
            {/* Adorno visual */}
            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-[#4FD1C5]/10 rounded-full blur-2xl pointer-events-none"></div>

            <div className="flex items-center space-x-4 relative z-10">
              <div className="bg-[#4FD1C5]/20 p-3.5 rounded-2xl shadow-[0_0_15px_rgba(79,209,197,0.2)]">
                <Calendar className="h-7 w-7 text-[#4FD1C5]" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#4FD1C5] uppercase tracking-wider mb-1">Próxima sesión agendada</p>
                <h3 className="text-xl md:text-2xl font-bold text-white leading-none mb-1.5">
                  {new Date(upcomingCita.fecha_hora).toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })} - {new Date(upcomingCita.fecha_hora).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })} hrs
                </h3>
                <p className="text-[#94A3B8] text-sm font-medium">con {upcomingCita.psicologo_nombre}</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row w-full md:w-auto gap-2 relative z-10">
              <a 
                href={upcomingCita.link_videollamada}
                target="_blank" 
                rel="noopener noreferrer"
                className="flex-1 md:flex-none px-6 py-3 bg-[#4FD1C5] hover:bg-[#38B2AC] text-[#0B1321] rounded-xl font-bold text-sm transition-all flex items-center justify-center shadow-[0_0_20px_rgba(79,209,197,0.3)] hover:scale-[1.02]"
              >
                <Video className="w-4 h-4 mr-2" /> Conectarse
              </a>
              <button 
                onClick={() => setShowAgenda(true)}
                className="flex-1 md:flex-none px-6 py-3 bg-[#0D1321] border border-white/10 hover:border-white/20 text-[#E2E8F0] rounded-xl font-bold text-sm transition-all flex items-center justify-center hover:bg-[#151C2C]"
              >
                Mi agenda
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* ZONA INFERIOR: Mi Bitácora Emocional Diaria */}
      <motion.div initial="hidden" animate="visible" variants={cardVariants} transition={{ delay: 0.1 }}>
        <div className="bg-[#1A2639] border border-white/5 rounded-3xl p-5 md:p-6 shadow-xl">
          <div className="flex items-center space-x-2 mb-4">
            <BookHeart className="h-5 w-5 text-[#F6AD55]" />
            <h3 className="text-lg font-bold text-[#E2E8F0]">Mi Bitácora Emocional</h3>
          </div>

          {/* Selector de Emojis Horizontal */}
          <div className="flex overflow-x-auto snap-x scrollbar-hide gap-2 pb-3 mb-2 -mx-2 px-2 md:mx-0 md:px-0">
            {moodData.map((mood) => {
              const isSelected = selectedMood === mood.id;
              const isDimmed = selectedMood && !isSelected;
              return (
                <button
                  key={mood.id}
                  onClick={() => setSelectedMood(mood.id)}
                  className={`flex flex-col items-center justify-center py-3 px-4 rounded-3xl transition-all duration-300 group shrink-0 min-w-[70px] snap-center ${
                    isSelected 
                    ? 'bg-[#F6AD55]/20 border border-[#F6AD55]/50 scale-105 shadow-[0_0_15px_rgba(246,173,85,0.2)]' 
                    : 'bg-[#0B1321]/50 border border-white/5 hover:bg-[#0B1321]'
                  } ${isDimmed ? 'opacity-30 hover:opacity-100' : 'opacity-100'}`}
                >
                  <span className={`text-3xl transition-transform duration-300 ${isSelected ? 'scale-110 drop-shadow-md' : 'group-hover:-translate-y-1'}`}>
                    {mood.emoji}
                  </span>
                  <span className={`text-xs mt-2 font-medium tracking-wide ${isSelected ? 'text-[#F6AD55]' : 'text-[#94A3B8] group-hover:text-[#E2E8F0]'}`}>
                    {mood.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Campo de Texto (Textarea) */}
          <div className="mb-4 relative">
            <textarea 
              value={moodNote}
              onChange={(e) => setMoodNote(e.target.value)}
              placeholder="Escribe aquí lo que quieras descargar de hoy..."
              className="w-full bg-[#0B1321]/50 text-[#E2E8F0] placeholder-[#475569] border border-white/10 rounded-2xl p-4 focus:outline-none focus:border-[#F6AD55]/50 focus:ring-1 focus:ring-[#F6AD55]/50 resize-none h-20 transition-all text-sm leading-relaxed"
            />
          </div>

          {/* Botón Guardar */}
          <button 
            onClick={handleSaveBitacora}
            disabled={!selectedMood || isSaving}
            className={`w-full py-3 rounded-2xl font-bold text-sm transition-all flex items-center justify-center space-x-2 ${
              saveSuccess 
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
              : !selectedMood 
                ? 'bg-[#0B1321] text-[#475569] border border-white/5 cursor-not-allowed'
                : 'bg-[#F6AD55] hover:bg-[#ED8936] text-[#0B1321] shadow-[0_0_20px_rgba(246,173,85,0.3)] hover:shadow-[0_0_25px_rgba(246,173,85,0.5)]'
            }`}
          >
            {saveSuccess ? (
              <span>¡Guardado exitosamente! ✓</span>
            ) : isSaving ? (
              <span className="animate-pulse">Guardando...</span>
            ) : (
              <>
                <Send className="h-5 w-5" />
                <span>Guardar en mi Bitácora</span>
              </>
            )}
          </button>

          {/* Historial Reciente */}
          {history.length > 0 && (
            <div className="mt-6 pt-5 border-t border-white/5 space-y-3">
              <h4 className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-3">Tus últimos registros</h4>
              {history.map((entry, idx) => {
                const moodObj = moodData.find(m => m.id === entry.mood) || moodData[1];
                return (
                  <div key={idx} className="bg-[#0B1321]/40 rounded-xl p-3 flex items-start space-x-3 border border-white/5">
                    <div className="text-2xl">{moodObj.emoji}</div>
                    <div>
                      <p className="text-[#E2E8F0] text-sm leading-snug">
                        {entry.nota ? entry.nota : <span className="italic text-[#475569]">Sin nota adicional</span>}
                      </p>
                      <span className="text-[#475569] text-[10px] uppercase font-bold tracking-widest mt-1 block">
                        {new Date(entry.date).toLocaleDateString()} • {new Date(entry.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>

      {/* Modal: Mi Agenda Simulada */}
      <AnimatePresence>
        {showAgenda && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }} 
              animate={{ scale: 1, y: 0 }} 
              exit={{ scale: 0.95, y: 20 }}
              className="bg-[#1A2639] border border-white/10 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="p-5 border-b border-white/5 bg-[#0D1321] flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-6 w-6 text-emerald-400" />
                  <h2 className="text-lg font-bold text-white">Mi Agenda del Mes</h2>
                </div>
                <button onClick={() => setShowAgenda(false)} className="text-gray-400 hover:text-white transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="p-5 overflow-y-auto space-y-4">
                {/* Sesion Pasada */}
                <div className="bg-[#0B1321]/50 border border-white/5 rounded-2xl p-4 opacity-70">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Semana Pasada</span>
                    <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-gray-400">Completada</span>
                  </div>
                  <p className="font-bold text-gray-300">Jueves 15, 18:00 hrs</p>
                  <p className="text-sm text-gray-500">Ps. Camila Torres</p>
                </div>

                {/* Sesion Proxima (Real or Mocked) */}
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/20 rounded-full blur-xl -mr-8 -mt-8"></div>
                  <div className="flex justify-between items-center mb-2 relative z-10">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Próxima Sesión</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded animate-pulse">Agendada</span>
                  </div>
                  <p className="font-bold text-white text-lg">
                    {upcomingCita ? new Date(upcomingCita.fecha_hora).toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' }) : "Mañana"}, 
                    {" "}{upcomingCita ? new Date(upcomingCita.fecha_hora).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }) : "20:30"} hrs
                  </p>
                  <p className="text-sm text-emerald-400 mb-3">{upcomingCita ? upcomingCita.psicologo_nombre : "Ps. Camila Torres"}</p>
                  <a 
                    href={upcomingCita?.link_videollamada || "https://meet.google.com/new"} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full block text-center py-2 bg-emerald-500 hover:bg-emerald-400 text-[#0B1321] rounded-xl font-bold text-sm transition-colors shadow-lg"
                  >
                    Abrir Google Meet
                  </a>
                </div>

                {/* Sesion Futura */}
                <div className="bg-[#0B1321] border border-white/5 rounded-2xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-[#818CF8] uppercase tracking-wider">En 2 semanas</span>
                    <span className="text-[10px] bg-[#818CF8]/20 text-[#818CF8] px-2 py-0.5 rounded">Agendada</span>
                  </div>
                  <p className="font-bold text-white">Miércoles 28, 19:00 hrs</p>
                  <p className="text-sm text-gray-400">Ps. Camila Torres</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
