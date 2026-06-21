import React from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, MessageSquareText, Video, Users, LogOut, Phone, Calendar, Users as UsersIcon, CreditCard, Home, Search, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showSOS, setShowSOS] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isPaciente = user?.role === 'paciente';

  const pacienteNavItems = [
    { name: 'Inicio', path: '/dashboard', icon: <Home className="h-6 w-6" /> },
    { name: 'Especialistas', path: '/dashboard/especialistas', icon: <Search className="h-6 w-6" /> },
    { name: 'Asistente', path: '/dashboard/chat', icon: <MessageCircle className="h-6 w-6" /> },
    { name: 'Comunidad', path: '/dashboard/comunidad', icon: <Users className="h-6 w-6" /> },
  ];

  const psicologoNavItems = [
    { name: 'Inicio', path: '/dashboard', icon: <LayoutDashboard className="h-6 w-6" /> },
    { name: 'Agenda', path: '/dashboard/agenda', icon: <Calendar className="h-6 w-6" /> },
    { name: 'Pacientes', path: '/dashboard/pacientes', icon: <UsersIcon className="h-6 w-6" /> },
    { name: 'Comunidad', path: '/dashboard/comunidad', icon: <Users className="h-6 w-6" /> },
    { name: 'Pagos', path: '/dashboard/pagos', icon: <CreditCard className="h-6 w-6" /> },
  ];

  const navItems = isPaciente ? pacienteNavItems : psicologoNavItems;

  const isComunidadPath = location.pathname.includes('/comunidad');

  return (
    <div className="min-h-screen bg-[#0B1321] text-gray-100 font-sans flex flex-col">
      {/* Botón SOS Global (Globito Flotante) */}
      {isPaciente && (
        <button 
          onClick={() => setShowSOS(true)}
          className={`fixed bottom-24 right-6 z-50 h-16 w-16 rounded-full bg-[#FC8181] shadow-[0_0_20px_rgba(252,129,129,0.5)] flex flex-col items-center justify-center text-white hover:scale-110 hover:bg-[#F56565] hover:shadow-[0_0_30px_rgba(252,129,129,0.6)] transition-all cursor-pointer border border-white/20 
          ${(isComunidadPath || location.pathname.includes('/chat')) ? 'hidden md:flex' : 'flex'}`}
        >
          <span className="font-black tracking-wider text-[15px] drop-shadow-md">SOS</span>
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
              className="bg-[#FC8181] rounded-3xl p-8 w-full max-w-md text-center shadow-[0_0_50px_rgba(252,129,129,0.5)]"
            >
              <div className="h-20 w-20 bg-white/30 rounded-full flex items-center justify-center mx-auto mb-6 text-[#1A2639] shadow-inner">
                <Phone className="h-10 w-10 animate-pulse" />
              </div>
              <h2 className="text-3xl font-bold text-[#1A2639] mb-3">¿Necesitas ayuda urgente?</h2>
              <p className="text-[#1A2639]/80 mb-8 font-semibold text-base">Nuestros especialistas en contención emocional están disponibles 24/7.</p>
              
              <div className="space-y-4"> 
                <button 
                  onClick={() => { setShowSOS(false); navigate('/dashboard/chat'); }}
                  className="w-full py-4 px-4 bg-[#1A2639] rounded-xl font-bold text-[#E2E8F0] text-lg hover:bg-[#0D1321] transition-colors flex items-center justify-center shadow-lg"
                >
                  Hablar con tu Psicóloga
                </button>
                <a href="tel:*4141" className="block w-full py-4 px-4 bg-[#E2E8F0] text-[#1A2639] rounded-xl font-bold text-lg hover:bg-white transition-colors shadow-lg">
                  Llamar Prevención Suicidio (*4141)
                </a>
                <a href="tel:133" className="block w-full py-4 px-4 bg-transparent border-2 border-[#1A2639] text-[#1A2639] rounded-xl font-bold text-lg hover:bg-[#1A2639]/10 transition-colors">
                  Botón de Emergencia al Equipo
                </a>
                <button onClick={() => setShowSOS(false)} className="w-full py-4 px-4 text-[#1A2639] font-bold underline transition-colors mt-4 hover:text-[#0D1321]">
                  Cancelar y volver
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>



      {/* Main Content */}
      <main className="flex-1 relative overflow-y-auto pb-24 h-screen bg-[#0B1321]">
        <Outlet context={{ setShowSOS }} />
      </main>

      {/* Bottom Navigation Global (Mobile & Desktop Adaptada) */}
      <nav className="fixed bottom-0 md:bottom-6 w-full md:w-auto md:min-w-[500px] md:left-1/2 md:-translate-x-1/2 bg-[#1A2639]/90 backdrop-blur-lg border-t md:border border-white/10 px-6 py-3 md:rounded-3xl flex justify-between items-center z-40 shadow-2xl">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/dashboard'}
            className={({ isActive }) => 
              `flex flex-col items-center p-2 rounded-xl transition-all w-16 ${
                isActive ? 'text-[#818CF8]' : 'text-gray-400 hover:text-gray-200'
              }`
            }
          >
            {item.icon}
            <span className="text-[11px] mt-1 font-medium">{item.name}</span>
          </NavLink>
        ))}
        
        {/* Logout Button in Bottom Nav */}
        <button onClick={handleLogout} className="flex flex-col items-center p-2 rounded-xl transition-all w-16 text-gray-400 hover:text-red-400">
          <LogOut className="h-6 w-6" />
          <span className="text-[11px] mt-1 font-medium">Salir</span>
        </button>
      </nav>
    </div>
  );
}
