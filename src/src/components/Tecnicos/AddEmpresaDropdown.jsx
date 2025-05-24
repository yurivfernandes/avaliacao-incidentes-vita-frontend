import React, { useState, useRef, useEffect } from 'react';
import { FaSave, FaTimes, FaBuilding } from 'react-icons/fa';
import api from '../../services/api';

function AddEmpresaDropdown({ onClose, onSuccess }) {
  const dropdownRef = useRef(null);
  const [formData, setFormData] = useState({
    nome: '',
    cnpj: '',
    cep: '',
    telefone: '',
    numero: '',
    complemento: ''
  });
  const [validation, setValidation] = useState({
    cnpj: null,
    cep: null,
    telefone: null
  });

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
      await api.post('/access/empresa/create/', formData);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erro ao criar empresa:', error);
      alert('Erro ao criar empresa: ' + (error.response?.data?.error || 'Erro desconhecido'));
    }
  };

  const formatCNPJ = (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .slice(0, 18);
  };

  const formatCEP = (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/^(\d{5})(\d)/, '$1-$2')
      .slice(0, 9);
  };

  const formatTelefone = (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/(\d)(\d{4})$/, '$1-$2')
      .slice(0, 15);
  };

  const validateCNPJ = (cnpj) => {
    const stripped = cnpj.replace(/\D/g, '');
    return stripped.length === 14;
  };

  const validateCEP = (cep) => {
    const stripped = cep.replace(/\D/g, '');
    return stripped.length === 8;
  };

  const validateTelefone = (telefone) => {
    const stripped = telefone.replace(/\D/g, '');
    return stripped.length >= 10 && stripped.length <= 11;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;
    
    if (name === 'cnpj') {
      formattedValue = formatCNPJ(value);
      setValidation(prev => ({
        ...prev,
        cnpj: validateCNPJ(formattedValue)
      }));
    } else if (name === 'cep') {
      formattedValue = formatCEP(value);
      setValidation(prev => ({
        ...prev,
        cep: validateCEP(formattedValue)
      }));
    } else if (name === 'telefone') {
      formattedValue = formatTelefone(value);
      setValidation(prev => ({
        ...prev,
        telefone: validateTelefone(formattedValue)
      }));
    }

    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }));
  };

  return (
    <div className="add-user-dropdown" ref={dropdownRef}>
      <div className="add-user-header">
        <div className="header-title">
          <FaBuilding size={18} />
          <h2>Nova Empresa</h2>
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
              placeholder="Nome da Empresa"
            />
            <label>Nome*</label>
          </div>
          <div className="form-field">
            <input
              required
              name="cnpj"
              value={formData.cnpj}
              onChange={handleInputChange}
              placeholder="CNPJ"
              style={{
                borderColor: validation.cnpj === null ? '' : 
                           validation.cnpj ? '#28a745' : '#dc3545'
              }}
            />
            <label>CNPJ*</label>
          </div>
        </div>

        <div className="form-row">
          <div className="form-field">
            <input
              required
              name="cep"
              value={formData.cep}
              onChange={handleInputChange}
              placeholder="CEP"
              style={{
                borderColor: validation.cep === null ? '' : 
                           validation.cep ? '#28a745' : '#dc3545'
              }}
            />
            <label>CEP*</label>
          </div>
          <div className="form-field">
            <input
              required
              name="telefone"
              value={formData.telefone}
              onChange={handleInputChange}
              placeholder="Telefone"
              style={{
                borderColor: validation.telefone === null ? '' : 
                           validation.telefone ? '#28a745' : '#dc3545'
              }}
            />
            <label>Telefone*</label>
          </div>
        </div>

        <div className="form-row">
          <div className="form-field">
            <input
              required
              value={formData.numero}
              onChange={e => setFormData({...formData, numero: e.target.value})}
              placeholder="Número"
            />
            <label>Número*</label>
          </div>
          <div className="form-field">
            <input
              value={formData.complemento}
              onChange={e => setFormData({...formData, complemento: e.target.value})}
              placeholder="Complemento"
            />
            <label>Complemento</label>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="button-secondary" onClick={onClose}>
            <FaTimes /> Cancelar
          </button>
          <button type="submit" className="button-primary">
            <FaSave /> Criar Empresa
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddEmpresaDropdown;
