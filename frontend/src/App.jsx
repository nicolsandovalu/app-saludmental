import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Landing from './pages/Landing';
import RegisterPaciente from './pages/RegisterPaciente';
import RegisterPsicologo from './pages/RegisterPsicologo';

import Layout from './components/Layout';
import PacienteDashboard from './pages/PacienteDashboard';
import PsicologoDashboard from './pages/PsicologoDashboard';
import Chatbot from './pages/Chatbot';
import BuscarPsicologos from './pages/BuscarPsicologos';
import ForoComunidad from './pages/ForoComunidad';

// Componente para proteger las rutas privadas
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="h-screen bg-[#0B0F19] flex items-center justify-center text-cyan-400 font-medium">Cargando tu espacio seguro...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Enrutador interno para decidir qué Dashboard mostrar en la ruta '/' del layout
const DashboardIndex = () => {
  const { user } = useAuth();
  return user?.role === 'psicologo' ? <PsicologoDashboard /> : <PacienteDashboard />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register/paciente" element={<RegisterPaciente />} />
          <Route path="/register/psicologo" element={<RegisterPsicologo />} />
          
          {/* Rutas Privadas del Dashboard */}
          <Route path="/dashboard" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<DashboardIndex />} />
            <Route path="especialistas" element={<BuscarPsicologos />} />
            <Route path="chat" element={<Chatbot />} />
            <Route path="comunidad" element={<ForoComunidad />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
