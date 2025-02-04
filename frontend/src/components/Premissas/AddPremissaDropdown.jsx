import React, { useState, useEffect } from 'react';
import { FaTimes, FaClipboardList } from 'react-icons/fa';
import Select from 'react-select';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

function AddPremissaDropdown({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    assignment: null,
    qtd_incidents: '',
    is_contrato_lancado: true,
    is_horas_lancadas: true,
    is_has_met_first_response_target: true,
    is_resolution_target: true,
    is_atualizaca_logs_correto: true,
    is_ticket_encerrado_corretamente: true,
    is_descricao_troubleshooting: true,
    is_cliente_notificado: true,
    is_category_correto: true
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

        <div className="field-group">
          <div className="field-group-title">Critérios de Avaliação</div>
          <div className="checkbox-grid">
            <div className="checkbox-item">
              <input
                type="checkbox"
                checked={formData.is_contrato_lancado}
                onChange={(e) => setFormData({ ...formData, is_contrato_lancado: e.target.checked })}
                id="contrato"
              />
              <label htmlFor="contrato">Contrato Lançado</label>
            </div>
            <div className="checkbox-item">
              <input
                type="checkbox"
                checked={formData.is_horas_lancadas}
                onChange={(e) => setFormData({ ...formData, is_horas_lancadas: e.target.checked })}
                id="horas"
              />
              <label htmlFor="horas">Horas Lançadas</label>
            </div>
            <div className="checkbox-item">
              <input
                type="checkbox"
                checked={formData.is_has_met_first_response_target}
                onChange={(e) => setFormData({ ...formData, is_has_met_first_response_target: e.target.checked })}
                id="first_response"
              />
              <label htmlFor="first_response">Primeira Resposta Alvo</label>
            </div>
            <div className="checkbox-item">
              <input
                type="checkbox"
                checked={formData.is_resolution_target}
                onChange={(e) => setFormData({ ...formData, is_resolution_target: e.target.checked })}
                id="resolution"
              />
              <label htmlFor="resolution">Resolução Alvo</label>
            </div>
            <div className="checkbox-item">
              <input
                type="checkbox"
                checked={formData.is_atualizaca_logs_correto}
                onChange={(e) => setFormData({ ...formData, is_atualizaca_logs_correto: e.target.checked })}
                id="logs"
              />
              <label htmlFor="logs">Atualização de Logs Correto</label>
            </div>
            <div className="checkbox-item">
              <input
                type="checkbox"
                checked={formData.is_ticket_encerrado_corretamente}
                onChange={(e) => setFormData({ ...formData, is_ticket_encerrado_corretamente: e.target.checked })}
                id="ticket"
              />
              <label htmlFor="ticket">Ticket Encerrado Corretamente</label>
            </div>
            <div className="checkbox-item">
              <input
                type="checkbox"
                checked={formData.is_descricao_troubleshooting}
                onChange={(e) => setFormData({ ...formData, is_descricao_troubleshooting: e.target.checked })}
                id="troubleshooting"
              />
              <label htmlFor="troubleshooting">Descrição de Troubleshooting</label>
            </div>
            <div className="checkbox-item">
              <input
                type="checkbox"
                checked={formData.is_cliente_notificado}
                onChange={(e) => setFormData({ ...formData, is_cliente_notificado: e.target.checked })}
                id="cliente"
              />
              <label htmlFor="cliente">Cliente Notificado</label>
            </div>
            <div className="checkbox-item">
              <input
                type="checkbox"
                checked={formData.is_category_correto}
                onChange={(e) => setFormData({ ...formData, is_category_correto: e.target.checked })}
                id="category"
              />
              <label htmlFor="category">Categoria Correta</label>
            </div>
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