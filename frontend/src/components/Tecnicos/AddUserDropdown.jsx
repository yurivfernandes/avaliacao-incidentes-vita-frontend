import React, { useState, useRef, useEffect } from 'react';
import { FaSave, FaTimes, FaUserPlus } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { generateStrongPassword } from '../../utils/passwordGenerator';
import { formatUsername } from '../../utils/stringUtils';
import PasswordResetModal from './PasswordResetModal';
import Select from 'react-select';

function AddUserDropdown({ onClose, onSuccess }) {
  const { user: currentUser } = useAuth();
  const dropdownRef = useRef(null);
  const [empresas, setEmpresas] = useState([]);
  const [filas, setFilas] = useState([]);
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
    empresa: '',
    fila: '',
  });
  const [resetPassword, setResetPassword] = useState({ show: false, username: '', password: '' });

  // Preencher empresa e fila automaticamente para gestor
  useEffect(() => {
    if (currentUser?.is_gestor && !currentUser?.is_staff) {
      setFormData(prev => ({
        ...prev,
        empresa: currentUser.empresa?.id || '',
        fila: currentUser.fila?.id || '',
        is_tecnico: true, // Gestor só pode criar técnico
        is_gestor: false,
        is_staff: false
      }));
    }
  }, [currentUser]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        // Se for gestor, não precisa buscar as opções pois serão fixas
        if (currentUser?.is_gestor && !currentUser?.is_staff) {
          if (currentUser.empresa) {
            setEmpresas([currentUser.empresa]);
          }
          if (currentUser.fila) {
            setFilas([currentUser.fila]);
          }
          return;
        }

        // Para staff, busca todas as opções
        const [empresasResponse, filasResponse] = await Promise.all([
          api.get('/cadastro/empresa/'),
          api.get('/cadastro/fila-atendimento/')
        ]);
        
        setEmpresas(empresasResponse.data.results || empresasResponse.data);
        setFilas(filasResponse.data.results || filasResponse.data);
      } catch (error) {
        console.error('Erro ao carregar opções:', error);
      }
    };

    fetchOptions();
  }, [currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const password = generateStrongPassword();
      const username = formatUsername(formData.first_name, formData.last_name);
      
      const userData = {
        username,
        password: password.trim(),
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        full_name: `${formData.first_name} ${formData.last_name}`.trim(),
        empresa: formData.empresa,
        fila: formData.fila,
        is_staff: currentUser?.is_staff ? formData.is_staff : false,
        is_gestor: currentUser?.is_staff ? formData.is_gestor : false,
        is_tecnico: currentUser?.is_staff ? formData.is_tecnico : true,
        first_access: true
      };

      await api.post('/access/create/', userData);
      setResetPassword({ 
        show: true, 
        username: username.toLowerCase(),
        password: password.trim() 
      });
      
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      alert('Erro ao criar usuário: ' + (error.response?.data?.error || 'Erro desconhecido'));
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

  const handleModalClose = () => {
    setResetPassword({ show: false, username: '', password: '' });
    onClose();
    onSuccess(); // Garante que a lista será atualizada
  };

  const customStyles = {
    control: (base, state) => ({
      ...base,
      height: '2.5rem',
      minHeight: '2.5rem',
      background: '#f8f9fa',
      borderColor: state.isFocused ? '#6F0FAF' : 'rgba(111, 15, 175, 0.2)',
      boxShadow: state.isFocused ? '0 0 0 3px rgba(111, 15, 175, 0.1)' : 'none',
      '&:hover': {
        borderColor: 'rgba(111, 15, 175, 0.3)'
      }
    }),
    option: (base, state) => ({
      ...base,
      padding: '8px 16px',
      backgroundColor: state.isSelected 
        ? 'rgba(111, 15, 175, 0.1)'
        : state.isFocused 
          ? '#f8f0ff'
          : 'white',
      color: state.isSelected ? '#670099' : '#333333',
      '&:hover': {
        backgroundColor: '#f8f0ff',
        color: '#670099'
      }
    }),
    input: base => ({
      ...base,
      margin: 0,
      padding: 0,
    }),
    valueContainer: base => ({
      ...base,
      padding: '0 8px',
    }),
    singleValue: base => ({
      ...base,
      color: '#333333',
    }),
    placeholder: base => ({
      ...base,
      color: '#666666',
    })
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
            <div className="form-field select-container">
              <Select
                value={empresas.find(emp => emp.id === formData.empresa)}
                onChange={(option) => setFormData({...formData, empresa: option?.id || ''})}
                options={empresas}
                getOptionLabel={(option) => option.nome}
                getOptionValue={(option) => option.id}
                placeholder="Selecione uma empresa"
                styles={customStyles}
                isSearchable
                isClearable={!currentUser?.is_gestor}
                isDisabled={currentUser?.is_gestor}
                className="react-select-container"
                classNamePrefix="react-select"
              />
              <label>Empresa*</label>
            </div>
            <div className="form-field select-container">
              <Select
                value={filas.find(fila => fila.id === formData.fila)}
                onChange={(option) => setFormData({...formData, fila: option?.id || ''})}
                options={filas}
                getOptionLabel={(option) => option.nome}
                getOptionValue={(option) => option.id}
                placeholder="Selecione uma fila"
                styles={customStyles}
                isSearchable
                isClearable={!currentUser?.is_gestor}
                isDisabled={currentUser?.is_gestor}
                className="react-select-container"
                classNamePrefix="react-select"
              />
              <label>Fila de Atendimento*</label>
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

      {resetPassword.show && (
        <PasswordResetModal
          title="Usuário Criado com Sucesso"
          subtitle={`Username: ${resetPassword.username}`}
          password={resetPassword.password}
          onClose={handleModalClose}
        />
      )}
    </>
  );
}

export default AddUserDropdown;
