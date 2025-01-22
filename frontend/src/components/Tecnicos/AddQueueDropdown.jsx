import React, { useState, useRef, useEffect } from 'react';
import { FaSave, FaTimes } from 'react-icons/fa';
import Select from 'react-select';
import api from '../../services/api';

function AddQueueDropdown({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    nome: '',
    codigo: '',
    status: true,
    empresa: ''
  });
  const [empresas, setEmpresas] = useState([]);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchEmpresas = async () => {
      try {
        const response = await api.get('/cadastro/empresa/');
        setEmpresas(response.data.results || response.data);
      } catch (error) {
        console.error('Erro ao carregar empresas:', error);
      }
    };
    fetchEmpresas();
  }, []);

  const customStyles = {
    // ...same styles as AddUserDropdown...
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/cadastro/fila-atendimento/', formData);
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
        <button className="close-button" onClick={onClose}>
          <FaTimes />
        </button>
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
          <div className="form-field">
            <input
              required
              value={formData.codigo}
              onChange={e => setFormData({...formData, codigo: e.target.value})}
              placeholder="Digite o código"
            />
            <label>Código*</label>
          </div>
        </div>

        <div className="form-row">
          <div className="form-field select-container">
            <Select
              value={empresas.find(emp => emp.id === formData.empresa)}
              onChange={(option) => setFormData({...formData, empresa: option?.id})}
              options={empresas}
              getOptionLabel={(option) => option.nome}
              getOptionValue={(option) => option.id}
              placeholder="Selecione uma empresa"
              styles={customStyles}
              isSearchable
              required
              className="react-select-container"
              classNamePrefix="react-select"
            />
            <label>Empresa*</label>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="button-secondary" onClick={onClose}>
            <FaTimes /> Cancelar
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
