import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Lock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import api from '../services/api';

export default function PaymentModal({ isOpen, onClose, onSuccess, citaId, monto }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null); // 'success' or 'error'

  const handleSimulatePayment = async () => {
    setIsProcessing(true);
    setPaymentStatus(null);
    
    // Simular un delay de red y procesamiento de pasarela
    setTimeout(async () => {
      try {
        await api.post('/appointments/pay', { cita_id: citaId });
        setPaymentStatus('success');
        setTimeout(() => {
          onSuccess();
          onClose();
          setPaymentStatus(null);
        }, 2000);
      } catch (error) {
        console.error("Error al procesar pago:", error);
        setPaymentStatus('error');
      } finally {
        setIsProcessing(false);
      }
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      >
        <motion.div 
          initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
          className="bg-[#151C2C] border border-white/10 rounded-3xl p-8 w-full max-w-md shadow-2xl relative overflow-hidden"
        >
          {/* Decorative gradients */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center">
                <Lock className="h-5 w-5 mr-2 text-emerald-400" /> Pago Seguro
              </h2>
              <button onClick={onClose} disabled={isProcessing} className="text-gray-400 hover:text-white transition-colors">
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="bg-[#0B0F19] rounded-xl p-4 mb-6 border border-white/5">
              <p className="text-sm text-gray-400 mb-1">Monto a pagar</p>
              <h3 className="text-3xl font-bold text-white">${monto?.toLocaleString('es-CL')} <span className="text-sm font-normal text-gray-500">CLP</span></h3>
            </div>

            {/* Simulación de Tarjeta */}
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-xl p-5 mb-6 border border-indigo-500/30 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-20">
                <CreditCard className="h-24 w-24" />
              </div>
              <div className="relative z-10 text-white">
                <p className="text-xs text-indigo-200 mb-4 uppercase tracking-widest">Tarjeta de Prueba Sandbox</p>
                <div className="font-mono text-lg tracking-widest mb-4">**** **** **** 4242</div>
                <div className="flex justify-between text-xs text-indigo-200 font-mono">
                  <span>N. SANDOVAL</span>
                  <span>12/28</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {paymentStatus === 'success' ? (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-emerald-500/20 border border-emerald-500/50 rounded-xl p-4 flex items-center justify-center text-emerald-400">
                  <CheckCircle className="h-5 w-5 mr-2" /> Pago Confirmado
                </motion.div>
              ) : paymentStatus === 'error' ? (
                <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 flex items-center justify-center text-red-400">
                  <XCircle className="h-5 w-5 mr-2" /> Error al procesar
                </div>
              ) : (
                <button 
                  onClick={handleSimulatePayment} 
                  disabled={isProcessing}
                  className="w-full py-4 bg-gradient-to-r from-indigo-600 to-cyan-600 rounded-xl font-bold text-white hover:opacity-90 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(79,70,229,0.3)]"
                >
                  {isProcessing ? (
                    <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> Procesando...</>
                  ) : (
                    "Procesar Pago Simulado"
                  )}
                </button>
              )}
              
              <p className="text-xs text-center text-gray-500 mt-4 flex items-center justify-center">
                <Lock className="h-3 w-3 mr-1" /> Tus datos están encriptados
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
