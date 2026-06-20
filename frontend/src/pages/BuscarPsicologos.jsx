import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Video, UserCircle, ChevronRight, Moon, Sun, XCircle } from 'lucide-react';
import api from '../services/api';
import PaymentModal from '../components/PaymentModal';

export default function BuscarPsicologos() {
  const [psicologos, setPsicologos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPsi, setSelectedPsi] = useState(null);
  
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
    diurno: ['10:00', '12:00', '15:00', '17:00'],
    extendido: ['19:00', '21:00', '23:00', '01:00']
  };

  useEffect(() => {
    const fetchPsicologos = async () => {
      try {
        const response = await api.get('/psicologos/');
        setPsicologos(response.data);
      } catch (error) {
        console.error("Error fetching psicologos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPsicologos();
  }, []);

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
      
      setCreatedCitaId(response.data.cita_id);
      setIsScheduleOpen(false);
      setIsPaymentOpen(true);
    } catch (error) {
      console.error("Error al pre-agendar:", error);
      alert("Hubo un error al intentar agendar la cita.");
    }
  };

  const handlePaymentSuccess = () => {
    setIsAgendado(true);
  };

  if (isAgendado) {
    return (
      <div className="p-6 md:p-10 flex flex-col items-center justify-center min-h-[80vh] text-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-emerald-500/20 p-6 rounded-full mb-6">
          <Calendar className="h-16 w-16 text-emerald-400" />
        </motion.div>
        <h2 className="text-3xl font-bold text-white mb-2">¡Cita Confirmada!</h2>
        <p className="text-gray-400 max-w-md">Tu sesión ha sido agendada con el Ps. {selectedPsi?.nombre_completo} para {selectedDay} a las {selectedTime} hrs. Recibirás un correo con el enlace a la sala virtual.</p>
        <button onClick={() => window.location.reload()} className="mt-8 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors">
          Volver al directorio
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8 font-sans pb-32 md:pb-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
          <UserCircle className="mr-3 h-8 w-8 text-indigo-400" /> Directorio de Especialistas
        </h1>
        <p className="text-gray-400">Encuentra al profesional adecuado y agenda tu sesión en horario diurno o nocturno.</p>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => (
            <div key={i} className="bg-[#151C2C] border border-white/5 rounded-2xl p-6 h-64 animate-pulse flex flex-col">
              <div className="flex space-x-4 mb-4">
                <div className="w-14 h-14 bg-white/10 rounded-full"></div>
                <div className="space-y-2 flex-1 pt-2">
                  <div className="h-4 bg-white/10 rounded w-3/4"></div>
                  <div className="h-3 bg-white/10 rounded w-1/2"></div>
                </div>
              </div>
              <div className="space-y-2 mt-4">
                <div className="h-3 bg-white/10 rounded w-full"></div>
                <div className="h-3 bg-white/10 rounded w-5/6"></div>
              </div>
              <div className="mt-auto h-12 bg-white/5 rounded-xl"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {psicologos.map((psi) => (
            <motion.div key={psi.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#151C2C] border border-white/10 rounded-3xl p-6 shadow-xl flex flex-col hover:border-indigo-500/30 transition-all group">
              <div className="flex items-start space-x-4 mb-4">
                <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 p-3 rounded-2xl group-hover:scale-105 transition-transform">
                  <UserCircle className="h-10 w-10 text-indigo-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg leading-tight">{psi.nombre_completo}</h3>
                  <p className="text-xs text-indigo-400 font-medium mt-1">{psi.enfoque_clinico}</p>
                </div>
              </div>
              
              <p className="text-sm text-gray-400 line-clamp-3 mb-6 flex-1">
                {psi.presentacion}
              </p>
              
              <div className="space-y-3 mt-auto">
                <div className="flex justify-between items-center text-xs bg-black/20 p-3 rounded-xl border border-white/5">
                  <span className="text-gray-400 flex items-center"><Sun className="h-3.5 w-3.5 mr-1.5 text-amber-400"/> Diurno</span>
                  <span className="font-bold text-white">${psi.tarifa_diurna.toLocaleString('es-CL')}</span>
                </div>
                <div className="flex justify-between items-center text-xs bg-black/20 p-3 rounded-xl border border-white/5">
                  <span className="text-gray-400 flex items-center"><Moon className="h-3.5 w-3.5 mr-1.5 text-blue-400"/> Nocturno</span>
                  <span className="font-bold text-white">${psi.tarifa_extendida.toLocaleString('es-CL')}</span>
                </div>
                
                <button 
                  onClick={() => openScheduleModal(psi)}
                  className="w-full py-3.5 mt-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(79,70,229,0.2)] hover:shadow-[0_0_20px_rgba(79,70,229,0.4)] flex items-center justify-center"
                >
                  Ver Disponibilidad <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            </motion.div>
          ))}
          {psicologos.length === 0 && (
            <div className="col-span-full text-center text-gray-500 py-10">No hay especialistas disponibles en este momento.</div>
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
                    <p className="text-xs text-gray-500 mt-1">10:00 - 18:00 hrs</p>
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
                    <p className="text-xs text-gray-500 mt-1">19:00 - 02:00 hrs</p>
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
    </div>
  );
}
