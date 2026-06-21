import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Calendar, Users, CreditCard, 
  Clock, TrendingUp, CheckCircle, AlertCircle, FileText, X
} from 'lucide-react';
import api from '../services/api';

export default function PsicologoDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [metrics, setMetrics] = useState({ sesiones_realizadas: 0, ingresos_acumulados: 0, en_turno: false });
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);

  // States for Patient Drawer
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [notaEvolutiva, setNotaEvolutiva] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [citasRes, metricsRes] = await Promise.all([
        api.get('/appointments/'),
        api.get('/appointments/metrics')
      ]);
      setCitas(citasRes.data);
      setMetrics(metricsRes.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTurno = async () => {
    try {
      const response = await api.put('/psicologos/me/turno', { en_turno: !metrics.en_turno });
      setMetrics(prev => ({ ...prev, en_turno: response.data.en_turno }));
    } catch (error) {
      console.error("Error al actualizar turno", error);
    }
  };

  const openPatientDrawer = (paciente) => {
    setSelectedPatient(paciente);
    setNotaEvolutiva('');
    setIsDrawerOpen(true);
  };

  const handleSaveNote = () => {
    // Aquí iría la llamada a la API para guardar la nota en la DB real.
    // Como es prototipo, solo cerramos y mostramos alerta.
    alert("Nota guardada exitosamente en el expediente (Prototipo)");
    setIsDrawerOpen(false);
  };

  const TABS = [
    { id: 'overview', label: 'Inicio', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'agenda', label: 'Agenda', icon: <Calendar className="w-5 h-5" /> },
    { id: 'patients', label: 'Pacientes', icon: <Users className="w-5 h-5" /> },
    { id: 'billing', label: 'Liquidación', icon: <CreditCard className="w-5 h-5" /> },
  ];

  // Extraer pacientes únicos de las citas
  const pacientesUnicos = Array.from(new Set(citas.map(c => c.name))).map(name => {
    return { name, lastSession: citas.find(c => c.name === name)?.date || "Desconocida" };
  });

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 pb-32 md:pb-8 font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#E2E8F0]">Panel Clínico</h1>
          <p className="text-[#94A3B8]">Gestión de consultas y monitoreo de ingresos</p>
        </div>
        
        {/* Toggle On-Call */}
        <div className="flex items-center space-x-3 bg-[#141C2E] border border-white/5 p-2 rounded-2xl">
          <span className="text-sm font-medium text-[#94A3B8]">Guardia PAP:</span>
          <button 
            onClick={toggleTurno}
            className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors focus:outline-none ${metrics.en_turno ? 'bg-[#2DD4BF]' : 'bg-[#1E293B]'}`}
          >
            <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${metrics.en_turno ? 'translate-x-9' : 'translate-x-1'}`} />
          </button>
          <span className={`text-xs font-bold ${metrics.en_turno ? 'text-[#2DD4BF]' : 'text-gray-500'}`}>
            {metrics.en_turno ? 'EN LÍNEA' : 'OFFLINE'}
          </span>
        </div>
      </div>

      {/* Navegación por Tabs */}
      <div className="flex space-x-2 bg-[#141C2E] p-2 rounded-2xl border border-white/5 overflow-x-auto scrollbar-hide">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-5 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-[#2DD4BF]/10 text-[#2DD4BF] shadow-[0_0_10px_rgba(45,212,191,0.1)]' : 'text-[#64748B] hover:text-[#E2E8F0] hover:bg-white/5'}`}
          >
            {tab.icon} <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Contenido Dinámico */}
      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <p className="text-[#64748B] animate-pulse font-medium">Sincronizando expedientes...</p>
        </div>
      ) : (
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#141C2E] border border-white/5 rounded-3xl p-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10"><CheckCircle className="w-24 h-24" /></div>
                <h3 className="text-[#94A3B8] font-medium mb-2">Sesiones Realizadas</h3>
                <p className="text-4xl font-bold text-[#E2E8F0]">{metrics.sesiones_realizadas}</p>
                <div className="mt-4 flex items-center text-xs text-[#2DD4BF]">
                  <TrendingUp className="w-4 h-4 mr-1" /> +12% este mes
                </div>
              </div>
              
              <div className="bg-[#141C2E] border border-white/5 rounded-3xl p-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10"><CreditCard className="w-24 h-24" /></div>
                <h3 className="text-[#94A3B8] font-medium mb-2">Ingresos Acumulados</h3>
                <p className="text-4xl font-bold text-[#E2E8F0]">${metrics.ingresos_acumulados.toLocaleString('es-CL')}</p>
                <div className="mt-4 text-xs text-[#64748B]">
                  Corresponde al 70% de Honorarios
                </div>
              </div>

              <div className={`border rounded-3xl p-6 shadow-xl relative overflow-hidden transition-colors ${metrics.en_turno ? 'bg-[#2DD4BF]/10 border-[#2DD4BF]/30' : 'bg-[#141C2E] border-white/5'}`}>
                 <div className="absolute top-0 right-0 p-4 opacity-10"><AlertCircle className="w-24 h-24" /></div>
                 <h3 className={`font-medium mb-2 ${metrics.en_turno ? 'text-[#2DD4BF]' : 'text-[#94A3B8]'}`}>Bono de Disponibilidad</h3>
                 <p className="text-2xl font-bold text-[#E2E8F0]">
                   {metrics.en_turno ? 'Activo' : 'Inactivo'}
                 </p>
                 <p className="mt-4 text-xs text-[#94A3B8]">
                   Recibes un ingreso extra por estar disponible para Primeros Auxilios Psicológicos.
                 </p>
              </div>
            </div>
          )}

          {/* TAB 2: AGENDA */}
          {activeTab === 'agenda' && (
            <div className="bg-[#141C2E] border border-white/5 rounded-3xl p-6 shadow-xl">
              <h2 className="text-xl font-bold text-[#E2E8F0] mb-6 flex items-center">
                <Calendar className="w-6 h-6 mr-3 text-[#818CF8]" /> Próximas Citas
              </h2>
              {citas.length > 0 ? (
                <div className="space-y-4">
                  {citas.map(cita => {
                    const isMadrugada = parseInt(cita.time.split(':')[0]) < 8;
                    return (
                      <div key={cita.id} className="flex items-center justify-between p-4 bg-[#0D1321] border border-white/5 rounded-2xl hover:border-white/10 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className={`p-3 rounded-xl ${isMadrugada ? 'bg-indigo-500/20 text-indigo-400' : 'bg-amber-500/20 text-amber-400'}`}>
                            <Clock className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="font-bold text-[#E2E8F0]">{cita.name}</h4>
                            <p className="text-sm text-[#94A3B8]">{cita.date} - {cita.time} hrs</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`inline-block px-3 py-1 rounded-lg text-xs font-bold uppercase ${cita.tipo_pago === 'subsidio_institucional' ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                            {cita.tipo_pago === 'subsidio_institucional' ? 'Subsidio Inst.' : 'Copago'}
                          </span>
                          <p className="text-xs text-[#64748B] mt-1 uppercase">{cita.status}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-[#64748B] text-center py-8">No tienes citas agendadas aún.</p>
              )}
            </div>
          )}

          {/* TAB 3: PACIENTES E HISTORIAL */}
          {activeTab === 'patients' && (
            <div className="bg-[#141C2E] border border-white/5 rounded-3xl p-6 shadow-xl">
              <h2 className="text-xl font-bold text-[#E2E8F0] mb-6 flex items-center">
                <Users className="w-6 h-6 mr-3 text-[#2DD4BF]" /> Historial Clínico
              </h2>
              {pacientesUnicos.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pacientesUnicos.map((p, idx) => (
                    <button 
                      key={idx} 
                      onClick={() => openPatientDrawer(p)}
                      className="text-left p-5 bg-[#0D1321] border border-white/5 rounded-2xl hover:border-[#2DD4BF]/50 transition-all group"
                    >
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#2DD4BF] to-[#6366F1] flex items-center justify-center text-[#0B1321] font-bold">
                          {p.name.substring(0,2).toUpperCase()}
                        </div>
                        <h4 className="font-bold text-[#E2E8F0]">{p.name}</h4>
                      </div>
                      <p className="text-xs text-[#64748B]">Última sesión: {p.lastSession}</p>
                      <div className="mt-4 text-xs font-bold text-[#2DD4BF] opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                        Abrir Expediente &rarr;
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-[#64748B] text-center py-8">No hay pacientes registrados en tu historial.</p>
              )}
            </div>
          )}

          {/* TAB 4: LIQUIDACIÓN */}
          {activeTab === 'billing' && (
            <div className="bg-[#141C2E] border border-white/5 rounded-3xl p-6 shadow-xl max-w-2xl mx-auto">
              <h2 className="text-xl font-bold text-[#E2E8F0] mb-6 flex items-center justify-center border-b border-white/5 pb-4">
                <FileText className="w-6 h-6 mr-3 text-pink-400" /> Simulación de Boleta de Honorarios
              </h2>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center p-3 bg-[#0D1321] rounded-xl border border-white/5">
                  <span className="text-[#94A3B8]">Sesiones por Copago (Alumnos)</span>
                  <span className="font-medium text-[#E2E8F0]">${(metrics.ingresos_acumulados * 0.4).toLocaleString('es-CL')}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-[#0D1321] rounded-xl border border-white/5">
                  <span className="text-[#94A3B8]">Sesiones por Subsidio (Institución)</span>
                  <span className="font-medium text-[#E2E8F0]">${(metrics.ingresos_acumulados * 0.6).toLocaleString('es-CL')}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                  <span className="text-indigo-300 font-medium">Bono de Disponibilidad (On-call)</span>
                  <span className="font-bold text-indigo-400">+ $50.000</span>
                </div>
              </div>

              <div className="border-t border-dashed border-white/20 pt-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-[#E2E8F0]">Total a Transferir</span>
                  <span className="text-3xl font-bold text-[#2DD4BF]">${(metrics.ingresos_acumulados + 50000).toLocaleString('es-CL')}</span>
                </div>
                <p className="text-xs text-center text-[#64748B] mt-4">La liquidación se emitirá automáticamente el día 5 del próximo mes.</p>
              </div>
            </div>
          )}

        </motion.div>
      )}

      {/* Drawer Clínico (Expediente Lateral) */}
      <AnimatePresence>
        {isDrawerOpen && selectedPatient && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-[#141C2E] border-l border-white/10 shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#0B1321]">
                <div>
                  <h3 className="text-xl font-bold text-[#E2E8F0]">{selectedPatient.name}</h3>
                  <p className="text-xs text-[#2DD4BF]">Expediente Confidencial</p>
                </div>
                <button onClick={() => setIsDrawerOpen(false)} className="text-[#64748B] hover:text-[#E2E8F0]">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="bg-[#0D1321] rounded-2xl p-4 border border-white/5">
                  <h4 className="text-sm font-bold text-[#94A3B8] mb-2">Historial Previo</h4>
                  <p className="text-sm text-[#E2E8F0] italic opacity-50">No hay notas evolutivas anteriores registradas para este paciente.</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#E2E8F0] mb-2">Evolución Clínica (Sesión Actual)</label>
                  <textarea 
                    value={notaEvolutiva}
                    onChange={(e) => setNotaEvolutiva(e.target.value)}
                    rows={8}
                    className="w-full bg-[#0D1321] text-[#E2E8F0] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#2DD4BF]/50 resize-none text-sm placeholder-[#475569]"
                    placeholder="Describe los avances, estado anímico, focos trabajados y tareas asignadas..."
                  />
                </div>
              </div>

              <div className="p-6 bg-[#0B1321] border-t border-white/5">
                <button 
                  onClick={handleSaveNote}
                  disabled={!notaEvolutiva.trim()}
                  className="w-full py-4 bg-[#2DD4BF] hover:bg-[#14B8A6] disabled:bg-[#1E293B] disabled:text-[#64748B] text-[#0B1321] font-bold rounded-xl transition-colors flex items-center justify-center shadow-lg"
                >
                  <FileText className="w-5 h-5 mr-2" /> Guardar y Encriptar Nota
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
