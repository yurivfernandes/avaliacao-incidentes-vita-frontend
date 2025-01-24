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
  const [assignmentGroups, setAssignmentGroups] = useState([]);
  const [formData, setFormData] = useState({
    username: '',
    first_name: '',
    last_name: '',
    full_name: '',
    is_staff: false,
    is_gestor: false,
    is_tecnico: !currentUser?.is_staff,
    assignment_groups: []
  });
  const [resetPassword, setResetPassword] = useState({ show: false, username: '', password: '' });

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
        const response = await api.get('/dw_analytics/assignment-group/');
        setAssignmentGroups(response.data.results || response.data);
      } catch (error) {
        console.error('Erro ao carregar assignment groups:', error);
      }
    };

    fetchOptions();
  }, [currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.assignment_groups.length === 0) {
      alert('É necessário selecionar ao menos um grupo.');
      return;
    }
    try {
      const password = generateStrongPassword();
      const username = formatUsername(formData.first_name, formData.last_name);
      
      const userData = {
        username,
        password: password.trim(),
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        full_name: `${formData.first_name} ${formData.last_name}`.trim(),
        assignment_groups: formData.assignment_groups.map(group => group.id),
        is_staff: currentUser?.is_staff ? formData.is_staff : false,
        is_gestor: currentUser?.is_staff ? formData.is_gestor : false,
        is_tecnico: currentUser?.is_staff ? formData.is_tecnico : true,
        first_access: true,
        is_ativo: true  // Adicionado is_ativo
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
      minHeight: '2.5rem',
      height: 'auto',
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
    valueContainer: (base) => ({
      ...base,
      padding: '2px 6px',
      maxHeight: '100px',
      overflow: 'auto',
      flexWrap: 'wrap',
      alignItems: 'flex-start',
      '&::-webkit-scrollbar': {
        width: '4px'
      },
      '&::-webkit-scrollbar-thumb': {
        background: 'rgba(111, 15, 175, 0.2)',
        borderRadius: '4px'
      }
    }),
    singleValue: base => ({
      ...base,
      color: '#333333',
    }),
    placeholder: base => ({
      ...base,
      color: '#666666',
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: 'rgba(111, 15, 175, 0.1)',
      borderRadius: '4px',
      margin: '2px',
      maxWidth: 'calc(100% - 4px)',
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: '#670099',
      padding: '2px 6px',
      fontSize: '0.85em',
      whiteSpace: 'normal',
      wordWrap: 'break-word'
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: '#670099',
      ':hover': {
        backgroundColor: 'rgba(111, 15, 175, 0.2)',
        color: '#670099',
      },
    }),
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
                value={formData.assignment_groups}
                onChange={(options) => setFormData({...formData, assignment_groups: options || []})}
                options={assignmentGroups}
                getOptionLabel={(option) => option.dv_assignment_group}
                getOptionValue={(option) => option.id}
                placeholder="Selecione um ou mais Assignment Groups"
                styles={customStyles}
                isSearchable
                isClearable
                isMulti
                className="react-select-container"
                classNamePrefix="react-select"
              />
              <label>Assignment Groups*</label>
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
