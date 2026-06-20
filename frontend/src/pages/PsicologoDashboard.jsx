import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, DollarSign, Clock, Settings, UserCircle, ChevronRight, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../services/api';

const ingresosData = [
  { name: 'Lun', amount: 45000 },
  { name: 'Mar', amount: 60000 },
  { name: 'Mié', amount: 30000 },
  { name: 'Jue', amount: 75000 },
  { name: 'Vie', amount: 50000 },
  { name: 'Sáb', amount: 20000 },
  { name: 'Dom', amount: 0 },
];

export default function PsicologoDashboard() {
  const { user } = useAuth();
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const userName = user?.nickname || user?.email?.split('@')[0] || "Doctor";

  useEffect(() => {
    const fetchCitas = async () => {
      try {
        const response = await api.get('/appointments/');
        setCitas(response.data);
      } catch (error) {
        console.error("Error fetching citas:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCitas();
  }, []);

  const hour = new Date().getHours();
  let greeting = 'Buenas noches';
  if (hour >= 6 && hour < 12) greeting = 'Buenos días';
  else if (hour >= 12 && hour < 19) greeting = 'Buenas tardes';

  // Cálculos dinámicos
  const citasHoy = citas.length;
  const pacientesActivos = new Set(citas.map(c => c.name)).size;
  const ingresosCalculados = citas.filter(c => c.payment === 'aprobado').length * 45000; // Simulación $45k base

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-white mb-1">{greeting}, <span className="text-emerald-400">Ps. {userName}</span>.</h1>
          <p className="text-gray-400">Aquí está el resumen de tu jornada clínica de hoy.</p>
        </motion.div>
        
        <motion.button 
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
          className="flex items-center space-x-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-gray-300 transition-colors"
        >
          <Settings className="h-4 w-4" />
          <span className="text-sm font-medium">Configurar Tarifas/Pagos</span>
        </motion.button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-[#151C2C] border border-white/5 rounded-2xl p-6 shadow-lg flex items-center"
        >
          <div className="bg-blue-500/20 p-4 rounded-xl mr-5">
            <Calendar className="h-7 w-7 text-blue-400" />
          </div>
          <div>
            <p className="text-sm text-gray-400 font-medium mb-1">Citas Hoy</p>
            <h3 className="text-2xl font-bold text-white">{citasHoy}</h3>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-[#151C2C] border border-white/5 rounded-2xl p-6 shadow-lg flex items-center"
        >
          <div className="bg-emerald-500/20 p-4 rounded-xl mr-5">
            <Users className="h-7 w-7 text-emerald-400" />
          </div>
          <div>
            <p className="text-sm text-gray-400 font-medium mb-1">Pacientes Activos</p>
            <h3 className="text-2xl font-bold text-white">{pacientesActivos || 12}</h3>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-[#151C2C] border border-white/5 rounded-2xl p-6 shadow-lg flex items-center justify-between"
        >
          <div className="flex items-center">
            <div className="bg-amber-500/20 p-4 rounded-xl mr-5">
              <DollarSign className="h-7 w-7 text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400 font-medium mb-1">Ingresos del Mes</p>
              <h3 className="text-2xl font-bold text-white">${ingresosCalculados > 0 ? ingresosCalculados.toLocaleString('es-CL') : '280.000'}</h3>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Main Grid: Agenda & Patients */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Agenda del Día */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
          className="bg-[#151C2C] border border-white/5 rounded-2xl shadow-xl overflow-hidden flex flex-col"
        >
          <div className="p-6 border-b border-white/5 flex justify-between items-center">
            <h2 className="text-lg font-bold text-white flex items-center">
              <Clock className="h-5 w-5 mr-2 text-blue-400" /> Agenda del Día
            </h2>
            <button onClick={() => window.location.reload()} className="text-xs font-medium px-2.5 py-1 bg-white/10 hover:bg-white/20 text-gray-300 rounded-full transition-colors cursor-pointer">Actualizar</button>
          </div>
          
          <div className="p-2 flex-1">
            <div className="space-y-1">
              {loading ? (
                <div className="text-center p-4 text-gray-500">Cargando agenda...</div>
              ) : citas.length === 0 ? (
                <div className="text-center p-4 text-gray-500">No tienes citas programadas.</div>
              ) : citas.map((cita, i) => (
                <div key={i} className={`p-4 rounded-xl flex items-center justify-between transition-colors ${cita.status === 'confirmada' ? 'bg-blue-500/10 border border-blue-500/20' : 'hover:bg-white/5'}`}>
                  <div className="flex items-center gap-4">
                    <div className="text-center w-14">
                      <p className={`font-bold ${cita.status === 'confirmada' ? 'text-blue-400' : 'text-gray-300'}`}>{cita.time}</p>
                    </div>
                    <div className="h-10 w-[2px] bg-white/10 rounded-full hidden sm:block"></div>
                    <div>
                      <h4 className="font-semibold text-white">{cita.name}</h4>
                      <p className="text-xs text-gray-400">{cita.payment === 'aprobado' ? 'Pago Recibido' : 'Pago Pendiente'}</p>
                    </div>
                  </div>
                  <div className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    cita.status === 'confirmada' ? 'bg-emerald-500/10 text-emerald-400 animate-pulse' : 
                    cita.status === 'en curso' ? 'bg-blue-500/20 text-blue-400' : 
                    'bg-white/5 text-gray-400'
                  }`}>
                    {cita.status.toUpperCase()}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="p-4 border-t border-white/5 bg-black/20">
            <button className="w-full text-sm text-blue-400 font-medium hover:text-blue-300 transition-colors flex items-center justify-center">
              Ver calendario completo <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>
        </motion.div>

        {/* Últimos Pacientes & Gráfico */}
        <div className="space-y-8 flex flex-col">
          
          {/* Chart Pequeño */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}
            className="bg-[#151C2C] border border-white/5 rounded-2xl p-6 shadow-xl"
          >
            <h2 className="text-lg font-bold text-white mb-6 flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-amber-400" /> Rendimiento Semanal
            </h2>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ingresosData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value/1000}k`} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    itemStyle={{ color: '#FBBF24' }}
                    formatter={(value) => [`$${value}`, 'Ingresos']}
                  />
                  <Bar dataKey="amount" fill="#FBBF24" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Últimos Pacientes */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}
            className="bg-[#151C2C] border border-white/5 rounded-2xl p-6 shadow-xl flex-1 flex flex-col"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-white flex items-center">
                <Users className="h-5 w-5 mr-2 text-emerald-400" /> Últimos Pacientes
              </h2>
            </div>
            
            <div className="space-y-4 flex-1">
              {[
                { name: 'Ana Rodríguez', date: 'Hace 2 días', badge: 'Terapia TCC' },
                { name: 'Estudiante #8812', date: 'Hace 3 días', badge: 'Urgencia' },
              ].map((paciente, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5">
                  <div className="flex items-center gap-3">
                    <UserCircle className="h-10 w-10 text-gray-400" />
                    <div>
                      <h4 className="font-semibold text-white text-sm">{paciente.name}</h4>
                      <p className="text-xs text-gray-500">{paciente.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="hidden sm:inline-block text-[10px] font-medium px-2 py-1 bg-white/10 text-gray-300 rounded-md">
                      {paciente.badge}
                    </span>
                    <button className="p-2 text-gray-400 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-colors" title="Ver Historial Clínico">
                      <FileText className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
