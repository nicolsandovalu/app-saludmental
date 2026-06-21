import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Video, UserCircle, ChevronRight, Moon, Sun, XCircle, Search } from 'lucide-react';
import api from '../services/api';
import PaymentModal from '../components/PaymentModal';

export default function BuscarPsicologos() {
  const [psicologos, setPsicologos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPsi, setSelectedPsi] = useState(null);
  const [upcomingCita, setUpcomingCita] = useState(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showAgenda, setShowAgenda] = useState(false);
  
  // Modal states
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState('Hoy'); // 'Hoy' o 'Mañana'
  const [selectedBlock, setSelectedBlock] = useState(null); // 'diurno' o 'extendido'
  const [selectedTime, setSelectedTime] = useState(null);
  
  // Payment states
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [createdCitaId, setCreatedCitaId] = useState(null);
  const [isAgendado, setIsAgendado] = useState(false);
  const [tarifaFinal, setTarifaFinal] = useState(0);

  const bloquesDisponibles = {
    diurno: ['06:00', '07:00', '08:00'],
    extendido: ['18:00', '19:00', '20:00', '21:00', '22:00', '23:00', '00:00', '01:00', '02:00']
  };

  useEffect(() => {
    const fetchPsicologosAndUpcoming = async () => {
      try {
        const [resPsi, resUpc] = await Promise.all([
          api.get('/psicologos/'),
          api.get('/appointments/upcoming').catch(() => ({ data: null }))
        ]);
        setPsicologos(resPsi.data);
        if (resUpc.data) {
          setUpcomingCita(resUpc.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPsicologosAndUpcoming();
  }, []);

  // Función para determinar si faltan menos de 15 minutos
  const isVideoCallActive = () => {
    if (!upcomingCita) return false;
    const citaTime = new Date(upcomingCita.fecha_hora).getTime();
    const now = new Date().getTime();
    const diffMins = (citaTime - now) / 1000 / 60;
    // Activo si faltan 15 mins o menos, y hasta 60 mins después de la hora
    return diffMins <= 15 && diffMins >= -60;
  };

  const openScheduleModal = (psi) => {
    setSelectedPsi(psi);
    setSelectedDay('Hoy');
    setSelectedBlock(null);
    setSelectedTime(null);
    setIsScheduleOpen(true);
  };

  const handleSelectBlock = (blockType) => {
    setSelectedBlock(blockType);
    setSelectedTime(null);
    // Calcular tarifa
    if (blockType === 'extendido') {
      setTarifaFinal(selectedPsi.tarifa_extendida);
    } else {
      setTarifaFinal(selectedPsi.tarifa_diurna);
    }
  };

  const handleProcederPago = async () => {
    try {
      // Calcular fecha basada en selección (simplificada para prototipo)
      const citaDate = new Date();
      if (selectedDay === 'Mañana') {
        citaDate.setDate(citaDate.getDate() + 1);
      }
      const [hours, mins] = selectedTime.split(':');
      citaDate.setHours(parseInt(hours), parseInt(mins), 0, 0);

      const response = await api.post('/appointments/', {
        psicologo_id: selectedPsi.id,
        fecha_hora: citaDate.toISOString()
      });
      
      const { cita_id, requires_payment, monto_a_pagar } = response.data;
      
      setCreatedCitaId(cita_id);
      setIsScheduleOpen(false);
      
      if (requires_payment) {
        setTarifaFinal(monto_a_pagar); // Use the real amount to pay from backend
        setIsPaymentOpen(true);
      } else {
        // Subsidio institucional - gratis
        setIsAgendado(true);
      }
    } catch (error) {
      console.error("Error al pre-agendar:", error);
      alert("Hubo un error al intentar agendar la cita.");
    }
  };

  const handlePaymentSuccess = () => {
    setIsAgendado(true);
  };

  // Filter psicologos
  const filteredPsicologos = psicologos.filter(psi => 
    psi.nombre_completo.toLowerCase().includes(searchQuery.toLowerCase()) || 
    psi.enfoque_clinico.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8 font-sans pb-32 md:pb-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
            <UserCircle className="mr-3 h-8 w-8 text-indigo-400" /> Directorio de Especialistas
          </h1>
          <p className="text-gray-400">Encuentra al profesional adecuado y agenda tu sesión en horario diurno o nocturno.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3">
          {/* Buscador */}
          <div className="relative w-full md:w-72">
            <input 
              type="text"
              placeholder="Buscar por nombre o enfoque..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0B1321]/50 text-[#E2E8F0] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder-[#475569] text-sm"
            />
            <Search className="absolute left-3 top-3 h-4 w-4 text-[#475569]" />
          </div>
          
          {/* Botón Mi Agenda Permanente */}
          <button 
            onClick={() => setShowAgenda(true)}
            className="px-5 py-2.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-xl font-bold text-sm flex items-center justify-center transition-all shadow-sm"
          >
            <Calendar className="w-4 h-4 mr-2" /> Mi Agenda
          </button>
        </div>
      </motion.div>

      {/* Banner de Cita Confirmada / Próxima Cita */}
      <AnimatePresence>
        {(isAgendado || upcomingCita) && (
          <motion.div 
            initial={{ opacity: 0, height: 0, y: -20 }} 
            animate={{ opacity: 1, height: 'auto', y: 0 }} 
            className="bg-emerald-900/20 border border-emerald-500/30 rounded-3xl p-5 md:p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative overflow-hidden mb-8"
          >
            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

            <div className="flex items-center space-x-4 relative z-10">
              <div className="bg-emerald-500/20 p-3.5 rounded-2xl">
                <Calendar className="h-7 w-7 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
                  ✅ Tu Próxima Sesión
                </p>
                <h3 className="text-xl md:text-2xl font-bold text-white leading-none mb-1.5">
                  {upcomingCita ? new Date(upcomingCita.fecha_hora).toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' }) : selectedDay}, 
                  {upcomingCita ? new Date(upcomingCita.fecha_hora).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }) : selectedTime} hrs
                </h3>
                <p className="text-[#94A3B8] text-sm font-medium">con {upcomingCita ? upcomingCita.psicologo_nombre : selectedPsi?.nombre_completo}</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row w-full md:w-auto gap-2 relative z-10">
              <a 
                href={isVideoCallActive() ? (upcomingCita?.link_videollamada || "https://meet.google.com/new") : "#"} 
                target={isVideoCallActive() ? "_blank" : "_self"}
                rel="noopener noreferrer"
                onClick={(e) => {
                  if (!isVideoCallActive()) {
                    e.preventDefault();
                    alert('El enlace se activará 15 minutos antes de tu sesión.');
                  }
                }}
                className={`flex-1 md:flex-none px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center shadow-lg ${
                  isVideoCallActive() 
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-[#0B1321] hover:scale-[1.02] shadow-[0_0_20px_rgba(16,185,129,0.4)] animate-pulse' 
                  : 'bg-gray-700/50 text-gray-400 cursor-not-allowed border border-gray-600/50'
                }`}
              >
                <Video className="w-4 h-4 mr-2" /> Unirse a la Videollamada
              </a>
              <button 
                onClick={() => setShowAgenda(true)}
                className="flex-1 md:flex-none px-6 py-3 bg-[#0D1321] border border-white/10 hover:border-white/20 text-[#E2E8F0] rounded-xl font-bold text-sm transition-all flex items-center justify-center hover:bg-[#151C2C]"
              >
                Mi Agenda
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-[#151C2C] border border-white/5 rounded-2xl p-4 md:p-6 h-56 md:h-64 animate-pulse flex flex-col">
              <div className="flex flex-col md:flex-row items-center md:items-start md:space-x-4 mb-4">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-white/10 rounded-full mb-2 md:mb-0"></div>
                <div className="space-y-2 flex-1 pt-2 w-full flex flex-col items-center md:items-start">
                  <div className="h-3 md:h-4 bg-white/10 rounded w-3/4"></div>
                  <div className="h-2 md:h-3 bg-white/10 rounded w-1/2"></div>
                </div>
              </div>
              <div className="space-y-2 mt-2 md:mt-4">
                <div className="h-2 md:h-3 bg-white/10 rounded w-full"></div>
                <div className="h-2 md:h-3 bg-white/10 rounded w-5/6"></div>
              </div>
              <div className="mt-auto h-8 md:h-12 bg-white/5 rounded-xl"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
          {filteredPsicologos.map((psi) => (
            <motion.div key={psi.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#1A2639] border border-white/10 rounded-2xl md:rounded-3xl p-3 md:p-6 shadow-xl flex flex-col hover:border-indigo-500/30 transition-all group">
              <div className="flex flex-col md:flex-row items-center md:items-start md:space-x-4 mb-3 md:mb-4 text-center md:text-left">
                <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 p-2 md:p-3 rounded-full md:rounded-2xl group-hover:scale-105 transition-transform mb-2 md:mb-0 inline-flex items-center justify-center">
                  <UserCircle className="h-8 w-8 md:h-10 md:w-10 text-indigo-400" />
                </div>
                <div>
                  <h3 className="font-bold text-[#E2E8F0] text-[13px] md:text-lg leading-tight line-clamp-2 md:line-clamp-none">{psi.nombre_completo}</h3>
                  <p className="text-[10px] md:text-xs text-[#818CF8] font-medium mt-0.5 md:mt-1">{psi.enfoque_clinico}</p>
                </div>
              </div>
              
              <p className="text-[11px] md:text-sm text-gray-400 line-clamp-3 mb-4 md:mb-6 flex-1 text-center md:text-left">
                {psi.presentacion}
              </p>
              
              <div className="space-y-2 mt-auto">
                <div className="flex justify-center md:justify-start items-center text-[10px] md:text-xs bg-black/20 p-2 md:p-3 rounded-xl border border-white/5">
                  <Sun className="h-3.5 w-3.5 mr-1.5 text-amber-400 flex-shrink-0"/> 
                  <span className="text-gray-300 font-medium">Atención Diurna</span>
                </div>
                <div className="flex justify-center md:justify-start items-center text-[10px] md:text-xs bg-black/20 p-2 md:p-3 rounded-xl border border-white/5">
                  <Moon className="h-3.5 w-3.5 mr-1.5 text-[#818CF8] flex-shrink-0"/> 
                  <span className="text-gray-300 font-medium">Atención Nocturna</span>
                </div>
                
                <button 
                  onClick={() => openScheduleModal(psi)}
                  className="w-full py-2 md:py-3.5 mt-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-[11px] md:text-sm font-bold transition-all shadow-lg flex items-center justify-center"
                >
                  Agendar <ChevronRight className="h-3 w-3 md:h-4 md:w-4 ml-0.5 md:ml-1" />
                </button>
              </div>
            </motion.div>
          ))}
          {filteredPsicologos.length === 0 && (
            <div className="col-span-full text-center text-[#E2E8F0] py-10 font-medium">No se encontraron especialistas.</div>
          )}
        </div>
      )}

      {/* Schedule Modal */}
      <AnimatePresence>
        {isScheduleOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="bg-[#151C2C] border border-white/10 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#0D1321]">
                <h2 className="text-xl font-bold text-white">Agendar con Ps. {selectedPsi?.nombre_completo.split(' ')[0]}</h2>
                <button onClick={() => setIsScheduleOpen(false)} className="text-gray-400 hover:text-white">
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto">
                <h3 className="text-sm font-medium text-gray-400 mb-3">1. Selecciona el Día</h3>
                <div className="flex space-x-4 mb-8">
                  {['Hoy', 'Mañana'].map(day => (
                    <button 
                      key={day}
                      onClick={() => setSelectedDay(day)}
                      className={`flex-1 py-3 rounded-xl border font-bold transition-colors ${selectedDay === day ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400' : 'bg-[#0D1321] border-white/5 text-gray-400 hover:bg-white/5'}`}
                    >
                      {day}
                    </button>
                  ))}
                </div>

                <h3 className="text-sm font-medium text-gray-400 mb-3">2. Selecciona el Bloque Horario</h3>
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <button 
                    onClick={() => handleSelectBlock('diurno')}
                    className={`p-4 rounded-2xl border text-left transition-all ${selectedBlock === 'diurno' ? 'bg-amber-500/10 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.1)]' : 'bg-[#0D1321] border-white/5 hover:border-white/20'}`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <Sun className={`h-5 w-5 ${selectedBlock === 'diurno' ? 'text-amber-400' : 'text-gray-500'}`} />
                      <span className="text-xs font-bold bg-white/5 px-2 py-1 rounded-md text-gray-300">
                        ${selectedPsi?.tarifa_diurna.toLocaleString('es-CL')}
                      </span>
                    </div>
                    <p className={`font-bold ${selectedBlock === 'diurno' ? 'text-white' : 'text-gray-400'}`}>Horario Diurno</p>
                    <p className="text-xs text-gray-500 mt-1">06:00 - 08:00 hrs</p>
                  </button>

                  <button 
                    onClick={() => handleSelectBlock('extendido')}
                    className={`p-4 rounded-2xl border text-left transition-all ${selectedBlock === 'extendido' ? 'bg-indigo-500/10 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.1)]' : 'bg-[#0D1321] border-white/5 hover:border-white/20'}`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <Moon className={`h-5 w-5 ${selectedBlock === 'extendido' ? 'text-indigo-400' : 'text-gray-500'}`} />
                      <span className="text-xs font-bold bg-indigo-500/20 px-2 py-1 rounded-md text-indigo-300">
                        ${selectedPsi?.tarifa_extendida.toLocaleString('es-CL')}
                      </span>
                    </div>
                    <p className={`font-bold ${selectedBlock === 'extendido' ? 'text-white' : 'text-gray-400'}`}>Horario Nocturno</p>
                    <p className="text-xs text-gray-500 mt-1">18:00 - 02:00 hrs</p>
                  </button>
                </div>

                {selectedBlock && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                    <h3 className="text-sm font-medium text-gray-400 mb-3">3. Selecciona la Hora</h3>
                    <div className="grid grid-cols-4 gap-3 mb-6">
                      {bloquesDisponibles[selectedBlock].map(time => (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={`py-2 rounded-lg font-medium text-sm transition-colors border ${selectedTime === time ? 'bg-cyan-600 text-white border-cyan-500' : 'bg-[#0D1321] text-gray-400 border-white/5 hover:bg-white/10'}`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>

              <div className="p-6 border-t border-white/5 bg-[#0D1321]">
                <button 
                  onClick={handleProcederPago}
                  disabled={!selectedTime}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between px-6 shadow-lg shadow-emerald-900/20"
                >
                  <span>Proceder al Pago</span>
                  {selectedTime ? (
                    <span className="bg-black/20 px-3 py-1 rounded-lg">${tarifaFinal.toLocaleString('es-CL')}</span>
                  ) : (
                    <ChevronRight className="h-5 w-5" />
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <PaymentModal 
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        onSuccess={handlePaymentSuccess}
        citaId={createdCitaId}
        monto={tarifaFinal}
      />

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
                  <XCircle className="h-6 w-6" />
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
                    {upcomingCita ? new Date(upcomingCita.fecha_hora).toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' }) : (selectedDay || "Mañana")}, 
                    {" "}{upcomingCita ? new Date(upcomingCita.fecha_hora).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }) : (selectedTime || "20:30")} hrs
                  </p>
                  <p className="text-sm text-emerald-400 mb-3">{upcomingCita ? upcomingCita.psicologo_nombre : (selectedPsi?.nombre_completo || "Ps. Camila Torres")}</p>
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
