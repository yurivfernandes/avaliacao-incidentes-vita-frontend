import React, { useState, useEffect } from 'react';
import Header from '../components/Header/Header';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import '../styles/PasswordPage.css';

function PasswordPage() {
  useEffect(() => {
    document.title = 'Vita Gamify - Alterar Senha';
  }, []);

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'As senhas não coincidem' });
      return;
    }

    try {
      const requestData = {
        new_password: formData.newPassword
      };

      // Adiciona senha atual apenas se não for primeiro acesso
      if (!user?.first_access) {
        requestData.current_password = formData.currentPassword;
      }

      const response = await api.post('/access/change-password/', requestData);

      if (response.status === 200) {
        setMessage({ type: 'success', text: 'Senha alterada com sucesso! Você será redirecionado para fazer login novamente.' });
        setTimeout(() => {
          logout();
          navigate('/login');
        }, 2000);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Erro ao alterar a senha. Tente novamente.';
      setMessage({ type: 'error', text: errorMessage });
    }
  };

  return (
    <>
      <Header />
      <div className="password-container">
        <div className="background-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
        
        <div className="password-card">
          <div className="password-header">
            <h1>Alterar Senha</h1>
          </div>
          
          <form onSubmit={handleSubmit} className="password-form">
            {!user?.first_access && (
              <div className="form-group">
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  required
                  placeholder=" "
                />
                <label htmlFor="currentPassword">Senha Atual</label>
              </div>
            )}

            <div className="form-group">
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                required
                placeholder=" "
                minLength="8"
              />
              <label htmlFor="newPassword">Nova Senha</label>
              <span className="password-hint">
                Mínimo 8 caracteres, incluindo maiúsculas, minúsculas, números e caracteres especiais
              </span>
            </div>

            <div className="form-group">
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder=" "
                minLength="8"
              />
              <label htmlFor="confirmPassword">Confirmar Nova Senha</label>
              <span className="password-hint">
                A senha deve ser idêntica à senha digitada acima
              </span>
            </div>

            {message.text && (
              <div className={`message ${message.type}`}>
                {message.text}
              </div>
            )}

            <button type="submit" className="change-password-button">
              Alterar a senha
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default PasswordPage;
