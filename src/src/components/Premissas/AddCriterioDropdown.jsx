import React, { useState, useEffect } from 'react';
import { FaTimes, FaClipboardList } from 'react-icons/fa';
import Select from 'react-select';
import api from '../../services/api';

// Atualizado para incluir o tipo "conversao"
const tipoOptions = [
  { value: 'boolean', label: 'Booleano' },
  { value: 'conversao', label: 'Conversão' }
];

function AddCriterioDropdown({ onClose, onSuccess, premissaId }) {
  const [formData, setFormData] = useState({
    nome: '',
    tipo: null,
    peso: '',
    field_service_now: null,
    ativo: true // Mantém o critério como ativo por padrão
  });
  
  const [serviceNowFields, setServiceNowFields] = useState([]);
  const [loadingFields, setLoadingFields] = useState(true);

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
    menu: (base) => ({
      ...base,
      zIndex: 9999,
    }),
    menuPortal: (base) => ({
      ...base,
      zIndex: 9999,
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

  useEffect(() => {
    fetchServiceNowFields();
  }, []);

  const fetchServiceNowFields = async () => {
    try {
      setLoadingFields(true);
      const response = await api.get('/dw_analytics/incident-fields/');
      
      // Usar os campos exatamente como vêm da API
      if (response.data && response.data.fields) {
        const formattedFields = response.data.fields.map(field => ({
          value: field,
          label: field // Manter o campo exatamente igual
        }));
        
        setServiceNowFields(formattedFields);
      } else {
        console.error('Formato inesperado de dados:', response.data);
        setServiceNowFields([]);
      }
    } catch (error) {
      console.error('Erro ao buscar campos do ServiceNow:', error);
      setServiceNowFields([]);
    } finally {
      setLoadingFields(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await api.post(`/premissas/criterios/?premissa=${premissaId}`, formData);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erro ao criar critério:', error);
    }
  };

  return (
    <div className="add-user-dropdown">
      <div className="add-user-header">
        <div className="header-title">
          <FaClipboardList />
          <h3>Adicionar Novo Critério</h3>
        </div>
        <button onClick={onClose} className="modal-close">
          <FaTimes />
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-field">
            <label>Nome</label>
            <input
              type="text"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              required
              className="form-input"
            />
          </div>
          <div className="form-field">
            <label>Tipo</label>
            <Select
              value={tipoOptions.find(opt => opt.value === formData.tipo)}
              onChange={(selected) => setFormData({ ...formData, tipo: selected.value })}
              options={tipoOptions}
              required
              styles={customStyles}
              menuPortalTarget={document.body}
              className="react-select-container"
              classNamePrefix="react-select"
              placeholder="Selecione o tipo"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-field">
            <label>Peso</label>
            <input
              type="number"
              value={formData.peso}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 99)) {
                  setFormData({ ...formData, peso: value });
                }
              }}
              required
              min="0"
              max="99"
              className="form-input peso-input"
              style={{ width: '70px' }}
            />
          </div>
          <div className="form-field">
            <label>Campo ServiceNow</label>
            <Select
              value={serviceNowFields.find(opt => opt.value === formData.field_service_now)}
              onChange={(selected) => setFormData({ ...formData, field_service_now: selected?.value })}
              options={serviceNowFields}
              isLoading={loadingFields}
              isClearable
              styles={customStyles}
              menuPortalTarget={document.body}
              className="react-select-container"
              classNamePrefix="react-select"
              placeholder={loadingFields ? "Carregando campos..." : "Selecione o campo"}
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

export default AddCriterioDropdown;
