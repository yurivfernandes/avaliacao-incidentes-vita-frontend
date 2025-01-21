import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import LoginPage from './pages/LoginPage';
import WelcomePage from './pages/WelcomePage';
import PasswordPage from './pages/PasswordPage';
import TecnicosPage from './pages/TecnicosPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

const ProtectedGestaoUsuariosRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user?.is_staff && !user?.is_gestor) {
    return <Navigate to="/welcome" replace />;
  }
  return children;
};

ReactDOM.render(
  <React.StrictMode>
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/welcome"
            element={
              <ProtectedRoute>
                <WelcomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/gestao-usuarios"
            element={
              <ProtectedRoute>
                <ProtectedGestaoUsuariosRoute>
                  <TecnicosPage />
                </ProtectedGestaoUsuariosRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/perfil/senha"
            element={
              <ProtectedRoute>
                <PasswordPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
