import React, { useState, useEffect } from 'react';
import Header from '../components/Header/Header';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/PasswordPage.css';

function PasswordPage() {
  useEffect(() => {
    document.title = 'Gestão de Inventário - Alterar Senha';
  }, []);

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  const navigate = useNavigate();
  const { logout } = useAuth();

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
      const token = localStorage.getItem('token');
      if (!token) {
        logout();
        navigate('/login');
        return;
      }

      const response = await fetch('http://localhost:8000/access/change-password/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          current_password: formData.currentPassword,
          new_password: formData.newPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Senha alterada com sucesso! Você será redirecionado para fazer login novamente.' });
        setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        
        // Aguarda 2 segundos antes de fazer logout e redirecionar
        setTimeout(() => {
          logout();
          navigate('/login');
        }, 2000);
      } else {
        // Trata diferentes tipos de erro
        if (response.status === 401) {
          logout();
          navigate('/login');
        } else {
          setMessage({ 
            type: 'error', 
            text: data.message || 'Erro ao alterar senha. Verifique os dados e tente novamente.' 
          });
        }
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: 'Erro ao conectar com o servidor. Tente novamente mais tarde.' 
      });
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
                pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$"
              />
              <label htmlFor="newPassword">Nova Senha</label>
              <span className="password-hint">
                Mínimo 8 caracteres, 1 maiúscula, 1 minúscula, 1 número e 1 caractere especial
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
                pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$"
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
