import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, MessageSquare, PlusCircle, AlertTriangle, XCircle, Send, Hash } from 'lucide-react';
import api from '../services/api';

export default function ForoComunidad() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State para crear
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  
  // Topic activo State
  const [activeTopic, setActiveTopic] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  
  // Alert State
  const [alertMsg, setAlertMsg] = useState(null);

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
    try {
      await api.post('/foro/topic', { title: newTitle, content: newContent });
      setIsModalOpen(false);
      setNewTitle('');
      setNewContent('');
      fetchTopics();
    } catch (error) {
      if (error.response?.status === 400) {
        setAlertMsg(error.response.data.detail);
        setTimeout(() => setAlertMsg(null), 5000);
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
      if (error.response?.status === 400) {
        setAlertMsg(error.response.data.detail);
        setTimeout(() => setAlertMsg(null), 5000);
      }
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8 pb-32 md:pb-8 relative font-sans">
      
      {/* Moderation Alert Toast */}
      <AnimatePresence>
        {alertMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[100] bg-[#1a0f14] border border-red-500/50 p-4 rounded-2xl shadow-[0_10px_40px_rgba(239,68,68,0.3)] flex items-center space-x-3 w-[90%] max-w-md"
          >
            <AlertTriangle className="text-red-400 w-6 h-6 flex-shrink-0" />
            <div>
              <p className="text-white font-bold text-sm">Espacio Seguro</p>
              <p className="text-red-200 text-xs">{alertMsg}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
            <Users className="mr-3 h-8 w-8 text-emerald-400" /> Comunidad Estudiantil
          </h1>
          <p className="text-gray-400">Un espacio seguro y moderado para compartir experiencias y apoyarnos mutuamente.</p>
        </motion.div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-5 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center transition-colors"
        >
          <PlusCircle className="w-5 h-5 mr-2" /> Crear Espacio
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[65vh]">
        
        {/* Lista de Topics */}
        <div className="lg:col-span-1 bg-[#151C2C] border border-white/5 rounded-3xl overflow-hidden shadow-xl flex flex-col">
          <div className="p-4 border-b border-white/5 bg-[#0B0F19]">
            <h3 className="font-bold text-gray-300">Espacios Activos</h3>
          </div>
          <div className="overflow-y-auto flex-1 p-2 space-y-2">
            {loading ? (
              <p className="text-gray-500 text-center p-4">Cargando comunidad...</p>
            ) : topics.map(t => (
              <button 
                key={t.id} 
                onClick={() => openTopic(t.id)}
                className={`w-full text-left p-4 rounded-2xl transition-all border ${activeTopic?.id === t.id ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-[#0D1321] border-white/5 hover:border-white/20'}`}
              >
                <h4 className={`font-bold line-clamp-2 leading-tight mb-2 ${activeTopic?.id === t.id ? 'text-white' : 'text-gray-300'}`}>{t.title}</h4>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-emerald-400 font-medium">@{t.author_nickname}</span>
                  <span className="text-gray-500 flex items-center"><MessageSquare className="w-3 h-3 mr-1"/> {t.replies_count}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Detalle de Topic (Chat view) */}
        <div className="lg:col-span-2 bg-[#151C2C] border border-white/5 rounded-3xl overflow-hidden shadow-xl flex flex-col">
          {activeTopic ? (
            <>
              <div className="p-6 border-b border-white/5 bg-gradient-to-r from-[#0B0F19] to-[#151C2C]">
                <h2 className="text-xl font-bold text-white mb-2 flex items-start">
                  <Hash className="w-5 h-5 mr-2 text-emerald-400 mt-1 flex-shrink-0" />
                  {activeTopic.title}
                </h2>
                <p className="text-xs text-gray-400">Iniciado por <span className="text-emerald-400 font-medium">@{activeTopic.author_nickname}</span></p>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#0D1321]">
                {activeTopic.posts.map((post, idx) => (
                  <div key={post.id} className={`flex ${idx === 0 ? 'justify-start' : 'justify-start'}`}>
                    <div className="flex flex-col max-w-[85%]">
                      <span className="text-xs text-emerald-500 font-bold mb-1 ml-2">@{post.author_nickname}</span>
                      <div className={`p-4 rounded-2xl ${idx === 0 ? 'bg-[#1A2235] border border-white/10 text-gray-200' : 'bg-white/5 text-gray-300'}`}>
                        <p className="whitespace-pre-wrap text-sm leading-relaxed">{post.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-[#151C2C] border-t border-white/5">
                <form onSubmit={handleCreateReply} className="flex gap-2">
                  <input 
                    type="text" 
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Escribe una respuesta empática..."
                    className="flex-1 bg-[#0D1321] text-white border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder-gray-500"
                  />
                  <button 
                    type="submit"
                    disabled={!replyContent.trim()}
                    className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-700 disabled:text-gray-500 text-white p-3 rounded-xl transition-colors flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
              <Users className="w-20 h-20 text-white/5 mb-4" />
              <h3 className="text-xl font-bold text-gray-400 mb-2">Selecciona un Espacio</h3>
              <p className="text-gray-500 max-w-sm">Únete a una conversación existente en el panel lateral o crea un nuevo espacio de apoyo.</p>
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
              className="bg-[#151C2C] border border-white/10 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#0D1321]">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <PlusCircle className="w-5 h-5 mr-2 text-emerald-400" /> Nuevo Espacio
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={handleCreateTopic} className="p-6 flex flex-col space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Título del Espacio</label>
                  <input 
                    type="text" 
                    required
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    placeholder="Ej. Tips para sobrellevar la ansiedad"
                    className="w-full bg-[#0D1321] text-white border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Tu Mensaje</label>
                  <textarea 
                    required
                    rows={4}
                    value={newContent}
                    onChange={e => setNewContent(e.target.value)}
                    placeholder="Comparte lo que sientes. Recuerda que este es un espacio seguro."
                    className="w-full bg-[#0D1321] text-white border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500/50 transition-colors resize-none"
                  />
                </div>
                
                <button 
                  type="submit"
                  disabled={!newTitle.trim() || !newContent.trim()}
                  className="w-full py-4 mt-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl font-bold transition-all shadow-lg"
                >
                  Publicar en la Comunidad
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
