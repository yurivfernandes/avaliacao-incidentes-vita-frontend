import React, { useState, useRef, useEffect } from 'react';
import { FaSave, FaTimes, FaUserPlus } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { generateStrongPassword } from '../../utils/passwordGenerator';
import { formatUsername } from '../../utils/stringUtils';
import PasswordResetModal from './PasswordResetModal';

function AddUserDropdown({ onClose, onSuccess }) {
  const { user: currentUser } = useAuth();
  const dropdownRef = useRef(null);
  const [formData, setFormData] = useState({
    username: '',
    first_name: '',
    last_name: '',
    full_name: '',
    company_name: '',
    fila_atendimento: '',
    is_staff: false,
    is_gestor: false,
    is_tecnico: !currentUser?.is_staff, // Se não for staff, sempre será técnico
  });
  const [newUserCredentials, setNewUserCredentials] = useState(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const password = generateStrongPassword();
      const username = formatUsername(formData.first_name, formData.last_name);
      
      const updatedData = {
        username,
        password,
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        full_name: `${formData.first_name} ${formData.last_name}`.trim(),
        company_name: formData.company_name.trim() || '',
        fila_atendimento: formData.fila_atendimento.trim() || '',
        is_staff: currentUser?.is_staff ? formData.is_staff : false,
        is_gestor: currentUser?.is_staff ? formData.is_gestor : false,
        is_tecnico: currentUser?.is_staff ? formData.is_tecnico : true
      };

      await api.post('/access/create/', updatedData);
      setNewUserCredentials({ username, password });
      // Não chama onClose() nem onSuccess() aqui
      
    } catch (error) {
      console.error('Erro ao criar usuário:', error.response?.data || error);
      alert(`Erro ao criar usuário: ${error.response?.data?.error || 'Erro desconhecido'}`);
    }
  };

  const handleRoleChange = (role) => {
    setFormData({
      ...formData,
      is_staff: role === 'staff',
      is_gestor: role === 'gestor',
      is_tecnico: role === 'tecnico'
    });
  };

  const handleCloseAndUpdate = () => {
    console.log('Chamando handleCloseAndUpdate');
    setNewUserCredentials(null);
    onClose();
    onSuccess();
  };

  return (
    <>
      <div className="add-user-dropdown" ref={dropdownRef}>
        <div className="add-user-header">
          <div className="header-title">
            <FaUserPlus size={18} />
            <h2>Novo Usuário</h2>
          </div>
          <button className="close-button" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-field">
              <input
                required
                maxLength={30}
                value={formData.first_name}
                onChange={e => setFormData({...formData, first_name: e.target.value})}
                placeholder="Digite o primeiro nome"
              />
              <label>Primeiro Nome*</label>
            </div>
            <div className="form-field">
              <input
                required
                maxLength={30}
                value={formData.last_name}
                onChange={e => setFormData({...formData, last_name: e.target.value})}
                placeholder="Digite o último nome"
              />
              <label>Último Nome*</label>
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <input
                maxLength={30}
                value={formData.company_name}
                onChange={e => setFormData({...formData, company_name: e.target.value})}
                placeholder="Digite a empresa"
              />
              <label>Empresa</label>
            </div>
            <div className="form-field">
              <input
                maxLength={30}
                value={formData.fila_atendimento}
                onChange={e => setFormData({...formData, fila_atendimento: e.target.value})}
                placeholder="Digite a fila"
              />
              <label>Fila de Atendimento</label>
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>Tipo de Usuário</label>
              <div className="role-selector">
                {currentUser?.is_staff ? (
                  <>
                    <button
                      type="button"
                      className={`role-button ${formData.is_staff ? 'active' : ''}`}
                      onClick={() => handleRoleChange('staff')}
                    >
                      Staff
                    </button>
                    <button
                      type="button"
                      className={`role-button ${formData.is_gestor ? 'active' : ''}`}
                      onClick={() => handleRoleChange('gestor')}
                    >
                      Gestor
                    </button>
                    <button
                      type="button"
                      className={`role-button ${formData.is_tecnico ? 'active' : ''}`}
                      onClick={() => handleRoleChange('tecnico')}
                    >
                      Técnico
                    </button>
                  </>
                ) : (
                  <div className="role-info">Usuário será criado como Técnico</div>
                )}
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="button-secondary" onClick={onClose}>
              <FaTimes /> Cancelar
            </button>
            <button type="submit" className="button-primary">
              <FaSave /> Criar Usuário
            </button>
          </div>
        </form>
      </div>

      {newUserCredentials && (
        <PasswordResetModal
          title="Usuário Criado com Sucesso"
          subtitle={`Username: ${newUserCredentials.username}`}
          password={newUserCredentials.password}
          onClose={handleCloseAndUpdate}
        />
      )}
    </>
  );
}

export default AddUserDropdown;
