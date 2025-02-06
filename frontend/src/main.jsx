import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import LoginPage from './pages/LoginPage';
import WelcomePage from './pages/WelcomePage';
import PasswordPage from './pages/PasswordPage';
import TecnicosPage from './pages/TecnicosPage';
import PremissasPage from './pages/PremissasPage';
import AvaliacoesPage from './pages/AvaliacoesPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

const ProtectedGestaoUsuariosRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user?.is_staff && !user?.is_gestor) {
    return <Navigate to="/welcome" replace />;
  }
  return children;
};

const FirstAccessRoute = ({ children }) => {
  const { user } = useAuth();
  if (user?.first_access) {
    return <Navigate to="/perfil/senha" replace />;
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
                <FirstAccessRoute>
                  <WelcomePage />
                </FirstAccessRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/gestao-usuarios"
            element={
              <ProtectedRoute>
                <FirstAccessRoute>
                  <ProtectedGestaoUsuariosRoute>
                    <TecnicosPage />
                  </ProtectedGestaoUsuariosRoute>
                </FirstAccessRoute>
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
          <Route
            path="/premissas"
            element={
              <ProtectedRoute>
                <FirstAccessRoute>
                  <ProtectedGestaoUsuariosRoute>
                    <PremissasPage />
                  </ProtectedGestaoUsuariosRoute>
                </FirstAccessRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/avaliacoes"
            element={
              <ProtectedRoute>
                <FirstAccessRoute>
                  <AvaliacoesPage />
                </FirstAccessRoute>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
