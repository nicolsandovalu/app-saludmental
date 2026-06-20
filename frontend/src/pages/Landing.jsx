import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart, User, Stethoscope, ArrowRight } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#0D1321] text-gray-100 overflow-hidden relative font-sans">
      {/* Luces volumétricas de fondo */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-600/20 rounded-full blur-[120px] opacity-60 mix-blend-screen pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-600/20 rounded-full blur-[120px] opacity-60 mix-blend-screen pointer-events-none"></div>

      {/* Navbar Minimalista */}
      <nav className="relative z-10 flex justify-between items-center p-6 lg:px-12">
        <div className="flex items-center space-x-3">
          <Heart className="h-8 w-8 text-cyan-400" />
          <span className="text-2xl font-bold tracking-tight text-white">Inspira<span className="text-cyan-400">Salud</span></span>
        </div>
        <div>
          <Link to="/login" className="px-6 py-2.5 text-sm font-semibold text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all duration-300 backdrop-blur-md shadow-sm">
            Iniciar Sesión
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center pt-20 pb-16 px-4 sm:px-6 lg:px-8 text-center min-h-[80vh]">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-sm font-medium mb-8">
            <span className="flex h-2 w-2 rounded-full bg-cyan-400 mr-2 animate-pulse"></span>
            Espacio seguro y confidencial
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            Tu bienestar mental, <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">a tu propio ritmo.</span>
          </h1>
          
          <p className="mt-6 text-xl text-gray-400 max-w-2xl mx-auto mb-16">
            Conectamos a estudiantes con profesionales de la salud mental en un entorno diseñado para darte tranquilidad, contención y apoyo cuando más lo necesitas.
          </p>
        </motion.div>

        {/* Tarjetas de Selección de Rol (Cards) */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl w-full mx-auto">
          {/* Tarjeta Paciente */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          >
            <Link to="/register/paciente" className="group block h-full">
              <div className="h-full p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-cyan-500/50 hover:bg-white/[0.07] transition-all duration-300 backdrop-blur-sm relative overflow-hidden shadow-xl hover:shadow-[0_0_30px_rgba(8,145,178,0.15)]">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-cyan-500/0 group-hover:from-cyan-500/10 group-hover:to-transparent transition-all duration-500"></div>
                <div className="relative z-10 flex flex-col h-full text-left">
                  <div className="h-16 w-16 rounded-2xl bg-cyan-500/20 flex items-center justify-center mb-6 text-cyan-400 group-hover:scale-110 transition-transform duration-300">
                    <User className="h-8 w-8" />
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-3">Soy Estudiante</h3>
                  <p className="text-gray-400 mb-8 flex-grow text-lg">
                    Busco apoyo psicológico, orientación o contención emocional. Tu privacidad es nuestra prioridad absoluta.
                  </p>
                  <div className="flex items-center text-cyan-400 font-semibold mt-auto text-lg">
                    Comenzar ahora <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Tarjeta Psicólogo */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
          >
            <Link to="/register/psicologo" className="group block h-full">
              <div className="h-full p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-emerald-500/50 hover:bg-white/[0.07] transition-all duration-300 backdrop-blur-sm relative overflow-hidden shadow-xl hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-emerald-500/0 group-hover:from-emerald-500/10 group-hover:to-transparent transition-all duration-500"></div>
                <div className="relative z-10 flex flex-col h-full text-left">
                  <div className="h-16 w-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center mb-6 text-emerald-400 group-hover:scale-110 transition-transform duration-300">
                    <Stethoscope className="h-8 w-8" />
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-3">Soy Profesional</h3>
                  <p className="text-gray-400 mb-8 flex-grow text-lg">
                    Quiero ofrecer mis servicios de psicología, gestionar mis citas y ayudar a la comunidad estudiantil.
                  </p>
                  <div className="flex items-center text-emerald-400 font-semibold mt-auto text-lg">
                    Únete a la red <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
