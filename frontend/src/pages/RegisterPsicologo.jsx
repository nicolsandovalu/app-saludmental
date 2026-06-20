import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User as UserIcon, Building2, Wallet, Briefcase, Loader2, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { jwtDecode } from 'jwt-decode';

export default function RegisterPsicologo() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nombre_completo: '',
    presentacion: '',
    enfoque_clinico: '',
    tarifa_diurna: '',
    tarifa_extendida: '',
    moneda: 'CLP',
    datos_transferencia: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const submitData = {
        ...formData,
        tarifa_diurna: parseFloat(formData.tarifa_diurna),
        tarifa_extendida: parseFloat(formData.tarifa_extendida)
      };

      const response = await api.post('/auth/register/psicologo', submitData);
      const token = response.data.access_token;
      
      login(token);
      navigate('/dashboard');
    } catch (err) {
      console.error("Error en la petición:", err.response?.data || err);
      setError(err.response?.data?.detail || "Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0D1321] text-gray-100 p-4 sm:p-8 relative overflow-hidden font-sans">
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-emerald-600/20 rounded-full blur-[100px] opacity-40 mix-blend-screen pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative w-full max-w-4xl p-6 sm:p-10 rounded-2xl bg-white/5 border border-white/10 shadow-2xl backdrop-blur-md z-10"
      >
        <Link to="/" className="inline-flex items-center text-sm text-gray-400 hover:text-emerald-400 transition-colors mb-6">
          <ArrowLeft className="h-4 w-4 mr-1" /> Volver
        </Link>
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Únete como Profesional</h2>
          <p className="text-emerald-400 text-sm font-medium">Registro de Psicólogo</p>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center col-span-full">
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white/80 border-b border-white/10 pb-2 mb-4">Datos de Acceso</h3>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Mail className="h-5 w-5 text-gray-500" /></div>
              <input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full pl-11 pr-4 py-3 bg-[#1A2235]/80 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" placeholder="Correo Electrónico" />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Lock className="h-5 w-5 text-gray-500" /></div>
              <input type={showPassword ? "text" : "password"} name="password" required minLength="8" value={formData.password} onChange={handleChange} className="w-full pl-11 pr-12 py-3 bg-[#1A2235]/80 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" placeholder="Contraseña segura" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-emerald-400 transition-colors">
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><UserIcon className="h-5 w-5 text-gray-500" /></div>
              <input type="text" name="nombre_completo" required value={formData.nombre_completo} onChange={handleChange} className="w-full pl-11 pr-4 py-3 bg-[#1A2235]/80 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" placeholder="Nombre y Apellidos completos" />
            </div>

            <div className="relative">
              <div className="absolute top-3 left-0 pl-4 pointer-events-none"><Briefcase className="h-5 w-5 text-gray-500" /></div>
              <textarea name="presentacion" required value={formData.presentacion} onChange={handleChange} rows="4" className="w-full pl-11 pr-4 py-3 bg-[#1A2235]/80 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none" placeholder="Breve presentación profesional..."></textarea>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white/80 border-b border-white/10 pb-2 mb-4">Perfil Profesional</h3>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Building2 className="h-5 w-5 text-gray-500" /></div>
              <input type="text" name="enfoque_clinico" required value={formData.enfoque_clinico} onChange={handleChange} className="w-full pl-11 pr-4 py-3 bg-[#1A2235]/80 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" placeholder="Enfoque Clínico (ej. Sistémico)" />
            </div>

            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-4 relative">
                 <select name="moneda" value={formData.moneda} onChange={handleChange} className="w-full pl-3 pr-2 py-3 bg-[#1A2235]/80 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none text-sm font-medium">
                   <option value="CLP">CLP</option>
                   <option value="USD">USD</option>
                 </select>
              </div>
              <div className="col-span-4 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Wallet className="h-4 w-4 text-gray-500" /></div>
                <input type="number" step="0.01" name="tarifa_diurna" required value={formData.tarifa_diurna} onChange={handleChange} className="w-full pl-9 pr-2 py-3 bg-[#1A2235]/80 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm" placeholder="Diurna" />
              </div>
              <div className="col-span-4 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Wallet className="h-4 w-4 text-gray-500" /></div>
                <input type="number" step="0.01" name="tarifa_extendida" required value={formData.tarifa_extendida} onChange={handleChange} className="w-full pl-9 pr-2 py-3 bg-[#1A2235]/80 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm" placeholder="Vespertina" />
              </div>
            </div>

            <div className="relative mt-4">
              <textarea name="datos_transferencia" required value={formData.datos_transferencia} onChange={handleChange} rows="4" className="w-full p-4 bg-[#1A2235]/80 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none text-sm" placeholder="Datos de Transferencia Bancaria (Banco, Cuenta, RUT/DNI, Email)..."></textarea>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3.5 px-4 mt-6 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 focus:ring-offset-[#0D1321] transition-all duration-300 disabled:opacity-50 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
            >
              {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Crear Perfil Profesional'}
            </button>
          </div>
        </form>

        <div className="mt-6 pt-6 border-t border-white/10 text-center col-span-full">
          <p className="text-sm text-gray-400">
            ¿Ya eres miembro?{' '}
            <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-medium">Inicia Sesión</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
