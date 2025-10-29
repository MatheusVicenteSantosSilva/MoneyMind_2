import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Dashboard from './pages/Dashboard';
import AddTransaction from './pages/AddTransaction';
import Analytics from './pages/Analytics';
import Projection from './pages/Projection';
import Reports from './pages/Reports';
import Login from './pages/Login';
import Register from './pages/Register';
// NOVO: Importa a página de recuperação de senha
import ForgotPassword from './pages/ForgotPassword'; 

// Protege rotas que precisam de login
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return null; // ou um loader

  return user ? children : <Navigate to="/login" />;
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Rotas públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          {/* ROTA DE RECUPERAÇÃO DE SENHA ADICIONADA AQUI */}
          <Route path="/forgot-password" element={<ForgotPassword />} /> 

          {/* Rotas privadas */}
          <Route 
            path="/" 
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/add-transaction" 
            element={
              <PrivateRoute>
                <AddTransaction />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/analytics" 
            element={
              <PrivateRoute>
                <Analytics />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/projection" 
            element={
              <PrivateRoute>
                <Projection />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/reports" 
            element={
              <PrivateRoute>
                <Reports />
              </PrivateRoute>
            } 
          />
          
          {/* Redireciona qualquer rota desconhecida */}
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;