import React, { useState, useEffect } from 'react';
import { FaTimes, FaClipboardList } from 'react-icons/fa';
import Select from 'react-select';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

function AddPremissaDropdown({ onClose, onSuccess }) {
  // Atualizar o estado inicial do formData
  const [formData, setFormData] = useState({
    assignment_group: null,
    qtd_incidents: '',
    meta_mensal: ''
  });
  const [assignmentGroups, setAssignmentGroups] = useState([]);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    fetchAssignmentGroups();
  }, []);

  const fetchAssignmentGroups = async () => {
    try {
      // Primeiro busca todas as premissas existentes
      const premissasResponse = await api.get('/premissas/list/');
      const premissasGroups = new Set(premissasResponse.data.results.map(p => p.assignment_group));

      // Depois busca os grupos
      const response = await api.get('/dw_analytics/assignment-group/');
      let groups = response.data.results || response.data;

      // Filtra removendo os grupos que já têm premissas
      groups = groups.filter(group => !premissasGroups.has(group.id));

      // Se não for staff, filtra apenas os grupos do gestor
      if (!currentUser.is_staff) {
        groups = groups.filter(group =>
          currentUser.assignment_groups.some(g => g.id === group.id)
        );
      }

      setAssignmentGroups(groups);
    } catch (error) {
      console.error('Erro ao buscar assignment groups:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/premissas/list/', formData);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erro ao criar premissa:', error);
    }
  };

  const customStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: '40px',
      height: 'auto',
      width: '100%',
      background: '#f8f9fa',
      borderColor: state.isFocused ? '#6F0FAF' : 'rgba(111, 15, 175, 0.2)',
      boxShadow: state.isFocused ? '0 0 0 3px rgba(111, 15, 175, 0.1)' : 'none',
      borderRadius: '8px',
      '&:hover': {
        borderColor: 'rgba(111, 15, 175, 0.3)'
      },
      padding: '2px'
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
    singleValue: base => ({
      ...base,
      color: '#333333',
    }),
    placeholder: base => ({
      ...base,
      color: '#666666',
    }),
    container: (base) => ({
      ...base,
      width: '100%',
      marginTop: '8px',
    }),
  };

  return (
    <div className="add-user-dropdown">
      <div className="add-user-header">
        <div className="header-title">
          <FaClipboardList />
          <h3>Adicionar Nova Premissa</h3>
        </div>
        <button onClick={onClose} className="modal-close">
          <FaTimes />
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-field">
            <label>Fila</label>
            <Select
              value={assignmentGroups
                .filter(group => group.id === formData.assignment_group)
                .map(group => ({
                  value: group.id,
                  label: group.dv_assignment_group
                }))[0] || null}
              onChange={(selectedOption) => {
                setFormData({ ...formData, assignment_group: selectedOption ? selectedOption.value : null });
              }}
              options={assignmentGroups.map(group => ({
                value: group.id,
                label: group.dv_assignment_group
              }))}
              placeholder="Selecione uma fila..."
              isClearable
              isSearchable
              styles={customStyles}
              className="react-select-container"
              classNamePrefix="react-select"
            />
          </div>

          <div className="form-field">
            <label>Quantidade de Incidentes</label>
            <input
              type="number"
              value={formData.qtd_incidents}
              onChange={(e) => setFormData({ ...formData, qtd_incidents: e.target.value })}
              min="1"
              required
            />
          </div>

          <div className="form-field">
            <label>Meta Mensal</label> {/* Removido o (%) do label */}
            <input
              type="number"
              value={formData.meta_mensal}
              onChange={(e) => setFormData({ ...formData, meta_mensal: e.target.value })}
              min="0"
              required
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="button-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="button-primary">
            Adicionar
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddPremissaDropdown;