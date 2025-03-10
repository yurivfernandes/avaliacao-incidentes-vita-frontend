import React, { useState, useEffect } from 'react';
import { FaTimes, FaClipboardList } from 'react-icons/fa';
import Select from 'react-select';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

function AddPremissaDropdown({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    assignment: null,
    qtd_incidents: '',
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
      const premissasGroups = new Set(premissasResponse.data.results.map(p => p.assignment));

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
                .filter(group => group.id === formData.assignment)
                .map(group => ({
                  value: group.id,
                  label: group.dv_assignment_group
                }))[0]}
              onChange={(selectedOption) => {
                setFormData({ ...formData, assignment: selectedOption.value });
              }}
              options={assignmentGroups.map(group => ({
                value: group.id,
                label: group.dv_assignment_group
              }))}
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