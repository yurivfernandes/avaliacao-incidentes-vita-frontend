import React, { useState, useRef, useEffect } from 'react';
import { FaSave } from 'react-icons/fa';
import api from '../../services/api';

function AddQueueDropdown({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    nome: '',
    status: true
  });
  const dropdownRef = useRef(null);

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
      await api.post('/dw_analytics/assignment-group/create/', {
        dv_assignment_group: formData.nome,
        status: formData.status
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erro ao criar fila:', error);
      alert('Erro ao criar fila de atendimento');
    }
  };

  return (
    <div className="add-user-dropdown" ref={dropdownRef}>
      <div className="add-user-header">
        <div className="header-title">
          <h2>Nova Fila de Atendimento</h2>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-field">
            <input
              required
              value={formData.nome}
              onChange={e => setFormData({...formData, nome: e.target.value})}
              placeholder="Digite o nome"
            />
            <label>Nome*</label>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="button-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="button-primary">
            <FaSave /> Criar Fila
          </button>
        </div>
      </form>
    </div>
  );
}


export default AddQueueDropdown;
