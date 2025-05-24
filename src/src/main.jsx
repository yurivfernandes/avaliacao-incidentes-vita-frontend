import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import './index.css';
import LoginPage from './pages/LoginPage';
import WelcomePage from './pages/WelcomePage';
import PasswordPage from './pages/PasswordPage';
import GestaoUsuarios from './pages/GestaoUsuarios';
import PremissasPage from './pages/PremissasPage';
import AvaliacoesPage from './pages/AvaliacoesPage';
import TecnicosReportPage from './pages/TecnicosReportPage';
import LandingPage from './pages/LandingPage';
import SobrePage from './pages/SobrePage';
import Terms from './pages/Terms';
import PrivacyPolicy from './pages/PrivacyPolicy';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import logo from './assets/logo_login.svg'; // Certifique-se de que o caminho para o logo está correto

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

const ErrorBoundary = ({ children }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleUnhandledRejection = (event) => {
      console.error('Unhandled error:', event.reason);
      if (user) {
        navigate('/welcome');
      } else {
        navigate('/login');
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleUnhandledRejection);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleUnhandledRejection);
    };
  }, [user, navigate]);

  return children;
};

const App = () => {
  const { loading, user } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh', 
        background: '#f8f9fa',
        position: 'relative' 
      }}>
        <img 
          src={logo} 
          alt="Vita Logo" 
          style={{ 
            width: '120px',
            position: 'relative',
            zIndex: 2
          }} 
        />
        <div style={{
          position: 'absolute',
          width: '150px',
          height: '150px',
          border: '3px solid transparent',
          borderTopColor: '#670099',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          zIndex: 1
        }} />
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/sobre" element={<SobrePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/termos" element={<Terms />} />
      <Route path="/privacidade" element={<PrivacyPolicy />} />
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
                <GestaoUsuarios />
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
      <Route
        path="/relatorios/tecnicos"
        element={
          <ProtectedRoute>
            <FirstAccessRoute>
              <TecnicosReportPage />
            </FirstAccessRoute>
          </ProtectedRoute>
        }
      />
      <Route path="/landing" element={<LandingPage />} />
    </Routes>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <AuthProvider>
      <Router>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </Router>
    </AuthProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
