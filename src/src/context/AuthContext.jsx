import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { Navigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [firstAccess, setFirstAccess] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserProfile(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async (token) => {
    try {
      const response = await api.get('/access/profile/', {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      setUser(response.data);
      setFirstAccess(response.data.first_access);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      setUser(null);
      localStorage.removeItem('token'); // Remove token inválido
    } finally {
      setLoading(false);
    }
  };

  const login = async (token) => {
    localStorage.setItem('token', token);
    await fetchUserProfile(token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, firstAccess }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Carregando...</div>; // Exibe uma mensagem enquanto o estado de autenticação é resolvido
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};
