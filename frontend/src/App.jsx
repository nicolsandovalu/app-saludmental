import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';

// Placeholders temporales para las páginas
const Landing = () => <div className="p-10 font-sans text-center">Landing Page - Bienvenido</div>;
const RegisterPaciente = () => <div className="p-10 font-sans text-center">Registro de Paciente</div>;
const RegisterPsicologo = () => <div className="p-10 font-sans text-center">Registro de Psicólogo</div>;
const Dashboard = () => <div className="p-10 font-sans text-center">Panel de Control (Dashboard)</div>;
const Chat = () => <div className="p-10 font-sans text-center text-red-500">Chat de PAP (Emergencias)</div>;

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register/paciente" element={<RegisterPaciente />} />
          <Route path="/register/psicologo" element={<RegisterPsicologo />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/chat" element={<Chat />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
