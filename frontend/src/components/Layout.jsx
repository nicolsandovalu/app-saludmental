import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, MessageSquareText, Video, Users, LogOut, Phone, Calendar, Users as UsersIcon, CreditCard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showSOS, setShowSOS] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isPaciente = user?.role === 'paciente';

  const pacienteNavItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="h-6 w-6" /> },
    { name: 'Especialistas', path: '/dashboard/especialistas', icon: <Video className="h-6 w-6" /> },
    { name: 'Asistente', path: '/dashboard/chat', icon: <MessageSquareText className="h-6 w-6" /> },
    { name: 'Comunidad', path: '/dashboard/comunidad', icon: <Users className="h-6 w-6" /> },
  ];

  const psicologoNavItems = [
    { name: 'Panel', path: '/dashboard', icon: <LayoutDashboard className="h-6 w-6" /> },
    { name: 'Agenda', path: '/dashboard/agenda', icon: <Calendar className="h-6 w-6" /> },
    { name: 'Pacientes', path: '/dashboard/pacientes', icon: <UsersIcon className="h-6 w-6" /> },
    { name: 'Pagos', path: '/dashboard/pagos', icon: <CreditCard className="h-6 w-6" /> },
  ];

  const navItems = isPaciente ? pacienteNavItems : psicologoNavItems;

  return (
    <div className="min-h-screen bg-[#0D1321] text-gray-100 font-sans flex flex-col md:flex-row">
      {/* Botón SOS Global Flotante (Solo para Pacientes) */}
      {isPaciente && (
        <button 
          onClick={() => setShowSOS(true)}
          className="fixed bottom-24 right-4 md:bottom-8 md:right-8 z-50 h-14 w-14 rounded-full bg-[#FC8181] shadow-[0_0_20px_rgba(252,129,129,0.4)] flex items-center justify-center text-white hover:scale-110 hover:shadow-[0_0_30px_rgba(252,129,129,0.6)] transition-all cursor-pointer border border-[#FC8181]/50"
        >
          <Phone className="h-7 w-7 animate-[pulse_2s_ease-in-out_infinite]" />
        </button>
      )}

      {/* Modal SOS */}
      <AnimatePresence>
        {showSOS && isPaciente && (
          <motion.div 
            key="sos-modal"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-[#151C2C] border border-red-500/30 rounded-2xl p-6 w-full max-w-sm text-center shadow-2xl"
            >
              <div className="h-16 w-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                <Phone className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">¿Necesitas ayuda urgente?</h2>
              <p className="text-gray-400 mb-6 text-sm">Nuestros especialistas en contención emocional están disponibles 24/7.</p>
              
              <div className="space-y-3">
                <button 
                  onClick={() => { setShowSOS(false); navigate('/dashboard/chat'); }}
                  className="w-full py-3 px-4 bg-gradient-to-r from-cyan-600 to-emerald-600 rounded-xl font-medium hover:opacity-90 transition-opacity"
                >
                  Iniciar Chat de Contención
                </button>
                <a href="tel:*4141" className="block w-full py-3 px-4 bg-red-500/10 border border-red-500/50 text-red-400 rounded-xl font-medium hover:bg-red-500/20 transition-colors">
                  Llamar Prevención Suicidio (*4141)
                </a>
                <button onClick={() => setShowSOS(false)} className="w-full py-3 px-4 text-gray-400 hover:text-white font-medium transition-colors">
                  Cancelar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-[#161F30] border-r border-gray-700/50 p-4 z-40 sticky top-0 h-screen">
        <div className="flex items-center space-x-2 mb-10 px-2 pt-4">
          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 flex items-center justify-center font-bold text-sm shadow-[0_0_15px_rgba(8,145,178,0.3)]">IS</div>
          <span className="text-xl font-bold tracking-tight text-white">Inspira<span className="text-cyan-400">Salud</span></span>
        </div>
        
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/dashboard'}
              className={({ isActive }) => 
                `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  isActive 
                  ? 'bg-[#4FD1C5]/10 text-[#4FD1C5] font-medium border border-[#4FD1C5]/30 shadow-[0_0_10px_rgba(79,209,197,0.1)]' 
                  : 'text-gray-400 hover:text-gray-100 hover:bg-white/5'
                }`
              }
            >
              {item.icon}
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>
        
        <div className="pt-4 border-t border-white/5 mt-auto">
          <button onClick={handleLogout} className="flex items-center space-x-3 px-4 py-3 w-full rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-colors text-left">
            <LogOut className="h-5 w-5" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 relative overflow-y-auto pb-24 md:pb-0 h-screen bg-[#0D1321]">
        <Outlet />
      </main>

      {/* Bottom Navigation Mobile */}
      <nav className="md:hidden fixed bottom-0 w-full bg-[#111827]/90 backdrop-blur-md border-t border-white/10 px-6 py-3 flex justify-between items-center z-40">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/dashboard'}
            className={({ isActive }) => 
              `flex flex-col items-center p-2 rounded-xl transition-all ${
                isActive ? 'text-[#4FD1C5]' : 'text-gray-500 hover:text-gray-300'
              }`
            }
          >
            {item.icon}
            <span className="text-[10px] mt-1 font-medium">{item.name}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
