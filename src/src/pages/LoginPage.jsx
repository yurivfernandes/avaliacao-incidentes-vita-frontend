import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/LoginPage.css';
import logo from '../assets/logo_login.svg';
import api from '../services/api'; // Importar o serviço de API

function LoginPage() {
  useEffect(() => {
    document.title = 'Vita Gamify - Login';
    const savedFormData = localStorage.getItem('loginFormData');
    if (savedFormData) {
      setFormData(JSON.parse(savedFormData));
    }
  }, []);

  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const value = e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    localStorage.setItem('loginFormData', JSON.stringify(formData));
    
    try {
      const response = await api.post('/access/login/', formData); // Usar o serviço de API

      const data = response.data;

      if (response.status === 200) {
        localStorage.setItem('token', data.token);
        await login(data.token);
        navigate('/welcome');
      } else {
        if (data.error === 'Usuário inativo') {
          setError('Sua conta está inativa. Por favor, entre em contato com o suporte.');
        } else {
          setError(data.error || 'Credenciais inválidas. Por favor, tente novamente.');
        }
      }
    } catch (error) {
      setError('Erro ao conectar com o servidor. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <Link to="/">
            <img src={logo} alt="Vita Logo" className="login-logo" />
          </Link>
          <h2>Bem-vindo de volta</h2>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Usuário</label>
            <input
              type="text"
              id="username"
              name="username"
              autoComplete="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Senha</label>
            <input
              type="password"
              id="password"
              name="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
