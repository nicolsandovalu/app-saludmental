import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, MessageSquare, PlusCircle, AlertTriangle, XCircle, Send, Hash, Tag, ArrowLeft, Phone } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import api from '../services/api';

const THEMES = [
  { id: 'Ansiedad', label: 'Ansiedad', color: 'text-emerald-400', border: 'border-emerald-500/50', shadow: 'shadow-[0_0_10px_rgba(52,211,153,0.5)]', bg: 'bg-emerald-500/10' },
  { id: 'Depresión', label: 'Depresión', color: 'text-blue-400', border: 'border-blue-500/50', shadow: 'shadow-[0_0_10px_rgba(59,130,246,0.5)]', bg: 'bg-blue-500/10' },
  { id: 'Estrés Académico', label: 'Estrés Acad.', color: 'text-purple-400', border: 'border-purple-500/50', shadow: 'shadow-[0_0_10px_rgba(168,85,247,0.5)]', bg: 'bg-purple-500/10' },
  { id: 'Autoestima', label: 'Autoestima', color: 'text-pink-400', border: 'border-pink-500/50', shadow: 'shadow-[0_0_10px_rgba(236,72,153,0.5)]', bg: 'bg-pink-500/10' },
  { id: 'General', label: 'General', color: 'text-gray-400', border: 'border-gray-500/50', shadow: 'shadow-[0_0_10px_rgba(156,163,175,0.5)]', bg: 'bg-gray-500/10' },
];

export default function ForoComunidad() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State para crear
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newTheme, setNewTheme] = useState('General');
  
  // Topic activo State
  const [activeTopic, setActiveTopic] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  
  // Alert State
  const [alertMsg, setAlertMsg] = useState(null);

  // Extraer función de contexto del Layout para abrir el SOS modal
  const context = useOutletContext() || {};
  const setShowSOS = context.setShowSOS || (() => {});

  const fetchTopics = async () => {
    try {
      const response = await api.get('/foro/');
      setTopics(response.data);
    } catch (error) {
      console.error("Error fetching topics", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  const openTopic = async (id) => {
    try {
      const response = await api.get(`/foro/${id}`);
      setActiveTopic(response.data);
    } catch (error) {
      console.error("Error fetching topic details", error);
    }
  };

  const handleCreateTopic = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;
    try {
      await api.post('/foro/topic', { title: newTitle, theme: newTheme, content: newContent });
      setIsModalOpen(false);
      setNewTitle('');
      setNewContent('');
      setNewTheme('General');
      fetchTopics();
    } catch (error) {
      if (error.response?.status === 400 || error.response?.status === 403) {
        setAlertMsg(error.response.data.detail);
        setTimeout(() => setAlertMsg(null), 5000);
      } else {
        console.error(error);
      }
    }
  };

  const handleCreateReply = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    try {
      await api.post('/foro/post', { topic_id: activeTopic.id, content: replyContent });
      setReplyContent('');
      openTopic(activeTopic.id); // Refresh topic
      fetchTopics(); // Refresh replies count
    } catch (error) {
      if (error.response?.status === 400 || error.response?.status === 403) {
        setAlertMsg(error.response.data.detail);
        setTimeout(() => setAlertMsg(null), 5000);
      } else {
        console.error(error);
      }
    }
  };

  const getThemeStyles = (themeName) => {
    return THEMES.find(t => t.id === themeName) || THEMES.find(t => t.id === 'General');
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-32 md:pb-8 relative font-sans">
      
      {/* Moderation Alert Toast */}
      <AnimatePresence>
        {alertMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[100] bg-[#1a0f14] border border-red-500/50 p-4 rounded-2xl shadow-[0_10px_40px_rgba(239,68,68,0.3)] flex items-center space-x-3 w-[90%] max-w-md"
          >
            <AlertTriangle className="text-red-400 w-6 h-6 flex-shrink-0" />
            <div>
              <p className="text-[#E2E8F0] font-bold text-sm">Aviso de la Comunidad</p>
              <p className="text-red-200 text-xs">{alertMsg}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-[#E2E8F0] mb-2 flex items-center">
            <Users className="mr-3 h-8 w-8 text-[#2DD4BF]" /> Foros de Comunidad
          </h1>
          <p className="text-[#94A3B8]">Espacios temáticos para conversar, aprender y apoyarnos mutuamente.</p>
        </motion.div>
        
        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3">
          <button 
            onClick={() => setShowSOS(true)}
            className="flex md:hidden w-full sm:w-auto py-3 px-5 bg-[#FC8181]/10 border border-[#FC8181]/50 text-[#FC8181] rounded-xl font-bold hover:bg-[#FC8181]/20 transition-all items-center justify-center shadow-[0_0_15px_rgba(252,129,129,0.2)]"
          >
            <Phone className="w-5 h-5 mr-2 animate-pulse" /> SOS
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-[#2DD4BF] hover:bg-[#14B8A6] text-[#0B1321] font-bold py-3 px-5 rounded-xl shadow-[0_0_15px_rgba(45,212,191,0.3)] flex items-center justify-center transition-colors"
          >
            <PlusCircle className="w-5 h-5 mr-2" /> Crear Tema
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:h-[calc(100vh-180px)]">
        
        {/* Lista de Topics */}
        <div className={`lg:w-1/3 bg-[#141C2E] border border-white/5 rounded-3xl overflow-hidden shadow-xl flex-col ${activeTopic ? 'hidden lg:flex' : 'flex'} h-[calc(100dvh-280px)] lg:h-full`}>
          <div className="p-4 border-b border-white/5 bg-[#0B1321] shrink-0">
            <h3 className="font-bold text-[#E2E8F0]">Conversaciones Activas</h3>
          </div>
          <div className="overflow-y-auto flex-1 p-3 space-y-3 scrollbar-hide">
            {loading ? (
              <p className="text-[#64748B] text-center p-4">Cargando temas...</p>
            ) : topics.length > 0 ? (
              topics.map(t => {
                const themeStyle = getThemeStyles(t.theme);
                return (
                  <button 
                    key={t.id} 
                    onClick={() => openTopic(t.id)}
                    className={`w-full text-left p-4 rounded-2xl transition-all border ${activeTopic?.id === t.id ? 'bg-[#1A2438] border-[#818CF8]/50 shadow-[0_0_15px_rgba(129,140,248,0.1)]' : 'bg-[#0D1321] border-white/5 hover:border-white/20'}`}
                  >
                    {/* Neon Badge */}
                    <div className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase tracking-wider mb-2 ${themeStyle.color} ${themeStyle.border} ${themeStyle.bg} ${themeStyle.shadow}`}>
                      {themeStyle.label}
                    </div>

                    <h4 className={`font-bold line-clamp-2 leading-tight mb-2 text-sm ${activeTopic?.id === t.id ? 'text-[#E2E8F0]' : 'text-[#94A3B8]'}`}>{t.title}</h4>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[#818CF8] font-medium">@{t.author_nickname}</span>
                      <span className="text-[#64748B] flex items-center"><MessageSquare className="w-3 h-3 mr-1"/> {t.replies_count}</span>
                    </div>
                  </button>
                )
              })
            ) : (
               <p className="text-[#64748B] text-center p-4 text-sm">No hay temas activos. ¡Sé el primero en crear uno!</p>
            )}
          </div>
        </div>

        {/* Detalle de Topic (Chat view) */}
        <div className={`lg:w-2/3 bg-[#141C2E] border border-white/5 rounded-3xl overflow-hidden shadow-xl flex-col relative ${!activeTopic ? 'hidden lg:flex' : 'flex'} h-[calc(100dvh-180px)] lg:h-full`}>
          {activeTopic ? (
            <>
              <div className="p-4 md:p-6 border-b border-white/5 bg-[#0B1321] shrink-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <button 
                      onClick={() => setActiveTopic(null)}
                      className="lg:hidden flex items-center text-[#94A3B8] hover:text-[#E2E8F0] mb-3 text-sm font-medium transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4 mr-1" /> Volver a Temas
                    </button>
                    <h2 className="text-lg md:text-xl font-bold text-[#E2E8F0] mb-1 flex items-start leading-tight">
                      <Hash className="w-5 h-5 mr-2 text-[#2DD4BF] mt-0.5 flex-shrink-0" />
                      {activeTopic.title}
                    </h2>
                    <p className="text-xs text-[#94A3B8]">Iniciado por <span className="text-[#818CF8] font-medium">@{activeTopic.author_nickname}</span></p>
                  </div>
                  {/* Neon Badge for active topic */}
                  <div className={`hidden sm:inline-flex items-center px-3 py-1 rounded-lg border text-xs font-bold uppercase tracking-wider ${getThemeStyles(activeTopic.posts?.[0]?.theme || 'General').color} ${getThemeStyles(activeTopic.posts?.[0]?.theme || 'General').border} ${getThemeStyles(activeTopic.posts?.[0]?.theme || 'General').bg} ${getThemeStyles(activeTopic.posts?.[0]?.theme || 'General').shadow}`}>
                    <Tag className="w-3 h-3 mr-1" /> Temática
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#0D1321] scrollbar-hide">
                {activeTopic.posts.map((post, idx) => (
                  <div key={post.id} className="flex justify-start">
                    <div className="flex flex-col max-w-[90%] md:max-w-[80%]">
                      <div className="flex items-center space-x-2 mb-1 ml-2">
                        <span className="text-xs text-[#818CF8] font-bold">@{post.author_nickname}</span>
                        {post.author_nickname.startsWith("Ps.") && (
                           <span className="text-[9px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-500/30 uppercase tracking-wider font-bold">Especialista</span>
                        )}
                        <span className="text-[10px] text-[#475569]">{new Date(post.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                      <div className={`p-4 rounded-2xl ${idx === 0 ? 'bg-[#1A2438] border border-[#1E293B] text-[#E2E8F0] shadow-md' : 'bg-white/5 text-[#E2E8F0] border border-white/5'}`}>
                        <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{post.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 md:p-4 bg-[#141C2E] border-t border-white/5 shrink-0">
                <form onSubmit={handleCreateReply} className="flex gap-2">
                  <input 
                    type="text" 
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Escribe una respuesta empática..."
                    className="flex-1 bg-[#0D1321] text-[#E2E8F0] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#2DD4BF]/50 focus:ring-1 focus:ring-[#2DD4BF]/50 transition-all placeholder-[#64748B]"
                  />
                  <button 
                    type="submit"
                    disabled={!replyContent.trim()}
                    className="bg-[#2DD4BF] hover:bg-[#14B8A6] disabled:bg-[#1E293B] disabled:text-[#64748B] text-[#0B1321] p-3 rounded-xl transition-colors flex items-center justify-center shadow-[0_0_15px_rgba(45,212,191,0.2)]"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-10 text-center bg-[#0D1321]">
              <div className="bg-[#1A2438] p-6 rounded-full mb-4 border border-[#1E293B]">
                <Users className="w-16 h-16 text-[#64748B]" />
              </div>
              <h3 className="text-xl font-bold text-[#E2E8F0] mb-2">Selecciona un Tema</h3>
              <p className="text-[#64748B] max-w-sm">Únete a una conversación existente en el panel lateral o crea un nuevo espacio temático para debatir.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Crear Topic */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="bg-[#141C2E] border border-white/10 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#0B1321]">
                <h2 className="text-xl font-bold text-[#E2E8F0] flex items-center">
                  <PlusCircle className="w-5 h-5 mr-2 text-[#2DD4BF]" /> Crear Tema
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="text-[#64748B] hover:text-[#E2E8F0] transition-colors">
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={handleCreateTopic} className="p-6 flex flex-col space-y-5 bg-[#0D1321]">
                <div>
                  <label className="block text-sm font-medium text-[#94A3B8] mb-1.5">Título del Tema</label>
                  <input 
                    type="text" 
                    required
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    placeholder="Ej. Tips para sobrellevar la ansiedad"
                    className="w-full bg-[#141C2E] text-[#E2E8F0] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#2DD4BF]/50 transition-colors"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#94A3B8] mb-1.5">Temática (Etiqueta)</label>
                  <select
                    value={newTheme}
                    onChange={(e) => setNewTheme(e.target.value)}
                    className="w-full bg-[#141C2E] text-[#E2E8F0] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#2DD4BF]/50 transition-colors appearance-none"
                  >
                    {THEMES.map(t => (
                      <option key={t.id} value={t.id}>{t.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#94A3B8] mb-1.5">Tu Mensaje Inicial</label>
                  <textarea 
                    required
                    rows={4}
                    value={newContent}
                    onChange={e => setNewContent(e.target.value)}
                    placeholder="Comparte el contexto de tu tema. Recuerda que este es un espacio seguro."
                    className="w-full bg-[#141C2E] text-[#E2E8F0] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#2DD4BF]/50 transition-colors resize-none"
                  />
                </div>
                
                <button 
                  type="submit"
                  disabled={!newTitle.trim() || !newContent.trim()}
                  className="w-full py-4 mt-2 bg-[#2DD4BF] hover:bg-[#14B8A6] disabled:opacity-50 text-[#0B1321] rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(45,212,191,0.3)]"
                >
                  Abrir Conversación
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
