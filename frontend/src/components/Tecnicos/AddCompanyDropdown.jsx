import React, { useState, useRef, useEffect } from 'react';
import { FaSave, FaTimes, FaBuilding } from 'react-icons/fa';
import api from '../../services/api';

function AddCompanyDropdown({ onClose, onSuccess }) {
  const dropdownRef = useRef(null);
  const [formData, setFormData] = useState({
    nome: '',
    codigo: '',
    status: true,
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/cadastro/empresa/', formData);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erro ao adicionar empresa:', error);
      alert('Erro ao adicionar empresa');
    }
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
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              placeholder="Digite o nome da empresa"
              required
              maxLength={50}
            />
            <label>Nome da Empresa*</label>
          </div>
          <div className="form-field">
            <input
              type="text"
              name="codigo"
              value={formData.codigo}
              onChange={handleChange}
              placeholder="Digite o código"
              required
              maxLength={20}
            />
            <label>Código*</label>
          </div>
        </div>

        <div className="form-row">
          <div className="form-field">
            <label>Status da Empresa</label>
            <div className="role-selector">
              <button
                type="button"
                className={`role-button ${formData.status ? 'active' : ''}`}
                onClick={() => setFormData({...formData, status: true})}
              >
                Ativo
              </button>
              <button
                type="button"
                className={`role-button ${!formData.status ? 'active' : ''}`}
                onClick={() => setFormData({...formData, status: false})}
              >
                Inativo
              </button>
            </div>
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

export default AddCompanyDropdown;
