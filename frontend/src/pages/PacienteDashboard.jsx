import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Flame, Clock, MessageSquareText, X } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
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

const initialChartData = [
  { time: '18:00', estres: 80, energia: 60 },
  { time: '19:00', estres: 65, energia: 40 },
  { time: '20:00', estres: 50, energia: 35 },
  { time: '21:00', estres: 70, energia: 50 },
  { time: '22:00', estres: 90, energia: 30 },
  { time: '23:00', estres: 60, energia: 70 },
  { time: '00:00', estres: 40, energia: 85 }
];

export default function PacienteDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedMood, setSelectedMood] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [chartData, setChartData] = useState(initialChartData);

  const userName = user?.nickname || user?.email?.split('@')[0] || "Usuario";

  const hour = new Date().getHours();
  let greeting = 'Buenas noches';
  if (hour >= 6 && hour < 12) greeting = 'Buenos días';
  else if (hour >= 12 && hour < 19) greeting = 'Buenas tardes';

  const handleMoodClick = async (moodId) => {
    setSelectedMood(moodId);
    setShowToast(true);
    
    // Simulate graph data changing slightly based on mood
    const newChartData = chartData.map(d => ({
      ...d,
      estres: moodId === 'estres' || moodId === 'ansioso' ? Math.min(100, d.estres + 15) : Math.max(0, d.estres - 10),
      energia: moodId === 'calma' ? Math.min(100, d.energia + 10) : Math.max(0, d.energia - 5)
    }));
    setChartData(newChartData);

    try {
      await api.post('/mood/', { mood: moodId });
    } catch (error) {
      console.error("Error guardando el estado de ánimo:", error);
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 font-sans pb-32 md:pb-8 relative">
      
      {/* Toast Animado */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 md:bottom-12 z-50 bg-[#161F30] border border-[#4FD1C5]/30 shadow-[0_10px_40px_rgba(79,209,197,0.2)] rounded-2xl p-4 md:p-5 w-[90%] max-w-md flex flex-col sm:flex-row items-center gap-4"
          >
            <button onClick={() => setShowToast(false)} className="absolute top-2 right-2 text-gray-500 hover:text-gray-300 transition-colors">
              <X className="h-5 w-5" />
            </button>
            <div className="flex-1">
              <p className="text-[#E2E8F0] text-sm md:text-base leading-relaxed">
                Entiendo que te sientas así. ¿Te gustaría conversar un momento con el asistente?
              </p>
            </div>
            <button 
              onClick={() => navigate('/dashboard/chat')}
              className="whitespace-nowrap px-4 py-2.5 bg-[#4FD1C5]/10 text-[#4FD1C5] hover:bg-[#4FD1C5]/20 border border-[#4FD1C5]/50 rounded-xl text-sm font-semibold transition-all flex items-center shadow-sm"
            >
              <MessageSquareText className="h-4 w-4 mr-2" /> Ir al chat
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div initial="hidden" animate="visible" variants={cardVariants} className="pt-4 md:pt-0">
        <h1 className="text-3xl font-bold text-[#E2E8F0] mb-2 tracking-tight">{greeting}, <span className="text-[#4FD1C5]">{userName}</span>.</h1>
        <p className="text-gray-400 text-lg">¿Cómo te sientes en este momento?</p>
      </motion.div>

      {/* Mood Tracker */}
      <motion.div initial="hidden" animate="visible" variants={cardVariants} transition={{ delay: 0.1 }} className="flex justify-between md:justify-start md:space-x-4 overflow-x-auto pb-4 scrollbar-hide">
        {moodData.map((mood) => {
          const isSelected = selectedMood === mood.id;
          const isDimmed = selectedMood && !isSelected;
          return (
            <button
              key={mood.id}
              onClick={() => handleMoodClick(mood.id)}
              className={`flex flex-col items-center justify-center p-4 rounded-2xl transition-all duration-300 min-w-[70px] sm:w-24 flex-shrink-0 group ${
                isSelected 
                ? 'bg-[#4FD1C5]/10 border border-[#4FD1C5] scale-110 shadow-[0_0_20px_rgba(79,209,197,0.3)] z-10' 
                : 'bg-[#161F30] border border-gray-700/50 hover:bg-white/5 hover:-translate-y-1'
              } ${isDimmed ? 'opacity-40 hover:opacity-100' : 'opacity-100'}`}
            >
              <span className={`text-3xl sm:text-4xl mb-2 transition-transform duration-300 ${isSelected ? 'scale-110' : 'group-hover:scale-125'} drop-shadow-md`}>{mood.emoji}</span>
              <span className={`text-[11px] sm:text-sm font-medium ${isSelected ? 'text-[#4FD1C5]' : 'text-gray-400 group-hover:text-[#E2E8F0]'}`}>
                {mood.label}
              </span>
            </button>
          );
        })}
      </motion.div>

      {/* Tarjeta Destacada Telemedicina */}
      <motion.div initial="hidden" animate="visible" variants={cardVariants} transition={{ delay: 0.2 }}>
        <div className="bg-gradient-to-br from-[#1A2639] to-[#0D1321] border-t border-white/10 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#4FD1C5]/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none group-hover:bg-[#4FD1C5]/10 transition-colors duration-500"></div>
          
          <div className="flex items-center space-x-4 mb-4 relative z-10">
            <div className="bg-[#4FD1C5]/10 p-3 rounded-2xl border border-[#4FD1C5]/20 shadow-inner">
              <Calendar className="h-7 w-7 text-[#4FD1C5]" />
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-[#E2E8F0]">Telemedicina Disponible</h3>
          </div>
          
          <p className="text-gray-400 text-base mb-6 relative z-10 leading-relaxed max-w-lg">Horario nocturno activo (19:00 - 02:00 hrs). Un especialista está listo para atenderte ahora mismo.</p>
          
          <button 
            onClick={() => navigate('/dashboard/especialistas')}
            className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-[#4FD1C5] to-[#38B2AC] text-white rounded-xl font-semibold shadow-lg shadow-[#4FD1C5]/30 hover:scale-105 transition-transform duration-300 ease-in-out hover:shadow-[#4FD1C5]/50 flex items-center justify-center text-sm tracking-wide"
          >
            <Calendar className="h-4 w-4 mr-2" /> Agendar ahora
          </button>
        </div>
      </motion.div>

      {/* Gráfico Interactivo Recharts */}
      <motion.div initial="hidden" animate="visible" variants={cardVariants} transition={{ delay: 0.3 }} className="bg-[#161F30] border border-gray-700/50 rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
          <h3 className="font-bold text-[#E2E8F0] text-xl">Nivel de Energía y Estrés</h3>
          <div className="flex space-x-4 text-xs font-medium bg-[#0D1321] px-4 py-2 rounded-full border border-gray-700/50">
            <div className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-[#FC8181] mr-2 shadow-[0_0_8px_rgba(252,129,129,0.5)]"></span>Estrés</div>
            <div className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-[#4FD1C5] mr-2 shadow-[0_0_8px_rgba(79,209,197,0.5)]"></span>Energía</div>
          </div>
        </div>
        
        <div className="h-72 w-full -ml-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="time" stroke="#4B5563" fontSize={11} tickLine={false} axisLine={false} dy={10} />
              <YAxis stroke="#4B5563" fontSize={11} tickLine={false} axisLine={false} dx={-10} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#161F30', borderColor: '#4B5563', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.1)', padding: '12px' }}
                itemStyle={{ fontSize: '14px', fontWeight: 'bold' }}
                labelStyle={{ color: '#9CA3AF', marginBottom: '8px', fontSize: '12px' }}
                cursor={{ stroke: '#4B5563', strokeWidth: 1, strokeDasharray: '4 4' }}
              />
              <Line type="monotone" dataKey="estres" stroke="#FC8181" strokeWidth={3} dot={{ r: 4, fill: '#161F30', strokeWidth: 2 }} activeDot={{ r: 7, strokeWidth: 0, fill: '#FC8181', shadow: '0 0 10px #FC8181' }} animationDuration={1000} />
              <Line type="monotone" dataKey="energia" stroke="#4FD1C5" strokeWidth={3} dot={{ r: 4, fill: '#161F30', strokeWidth: 2 }} activeDot={{ r: 7, strokeWidth: 0, fill: '#4FD1C5', shadow: '0 0 10px #4FD1C5' }} animationDuration={1000} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Métricas pequeñas inferiores */}
      <motion.div initial="hidden" animate="visible" variants={cardVariants} transition={{ delay: 0.4 }} className="grid grid-cols-2 gap-4 md:gap-6">
        <div className="bg-[#161F30] border border-gray-700/50 rounded-3xl p-6 flex flex-col items-center justify-center text-center shadow-xl group hover:border-[#F6AD55]/50 transition-colors">
          <div className="bg-[#F6AD55]/10 p-3 rounded-full mb-3 group-hover:scale-110 transition-transform">
            <Flame className="h-8 w-8 text-[#F6AD55]" />
          </div>
          <h4 className="text-3xl font-bold text-[#E2E8F0]">5 Días</h4>
          <p className="text-sm text-gray-400 mt-1 font-medium">Racha de meditación</p>
        </div>
        <div className="bg-gradient-to-b from-[#161F30] to-indigo-900/20 border border-indigo-500/20 rounded-3xl p-6 flex flex-col items-center justify-center text-center shadow-xl group hover:border-indigo-400/50 transition-colors">
          <div className="bg-indigo-500/10 p-3 rounded-full mb-3 group-hover:scale-110 transition-transform">
            <Clock className="h-8 w-8 text-indigo-400" />
          </div>
          <h4 className="text-2xl font-bold text-[#E2E8F0] tracking-tight">Mañana, 20:30</h4>
          <p className="text-sm text-gray-400 mt-1 font-medium">Próxima sesión</p>
        </div>
      </motion.div>
    </div>
  );
}
