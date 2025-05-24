import React, { useState, useRef, useEffect } from 'react';
import { FaSave, FaTimes } from 'react-icons/fa';
import api from '../../services/api';
import '../../styles/FilterDropdown.css';

function AddClientDropdown({ isOpen, onClose, onSuccess }) {
  const [gruposEconomicos, setGruposEconomicos] = useState([]);
  const [isGrupoDropdownOpen, setIsGrupoDropdownOpen] = useState(false);
  const [grupoSearchTerm, setGrupoSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    grupo_economico: '',
    razao_social: '',
    cnpj: '',
    vantive_id: '',
    codigo: '',
    status: true
  });
  
  const [errors, setErrors] = useState({});
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

  useEffect(() => {
    const fetchGruposEconomicos = async () => {
      try {
        const response = await api.get('/inventario/grupos-economicos/');
        setGruposEconomicos(response.data.results);
      } catch (error) {
        console.error('Erro ao carregar grupos econômicos:', error);
      }
    };

    fetchGruposEconomicos();
  }, []);

  const formatCNPJ = (value) => {
    const numbers = value.replace(/\D/g, '').substring(0, 14);
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 5) return `${numbers.slice(0, 2)}.${numbers.slice(2)}`;
    if (numbers.length <= 8) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5)}`;
    if (numbers.length <= 12) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8)}`;
    return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8, 12)}-${numbers.slice(12)}`;
  };

  const validateCNPJ = (cnpj) => {
    const numbers = cnpj.replace(/\D/g, '');
    
    if (numbers.length !== 14) return false;
    
    // Elimina CNPJs inválidos conhecidos
    if (/^(\d)\1{13}$/.test(numbers)) return false;
    
    // Validação do algoritmo
    let length = numbers.length - 2;
    let numbers_array = numbers.substring(0, length);
    const digits = numbers.substring(length);
    let sum = 0;
    let pos = length - 7;
    
    for (let i = length; i >= 1; i--) {
      sum += numbers_array.charAt(length - i) * pos--;
      if (pos < 2) pos = 9;
    }
    
    let result = sum % 11 < 2 ? 0 : 11 - sum % 11;
    if (result !== parseInt(digits.charAt(0))) return false;
    
    length = length + 1;
    numbers_array = numbers.substring(0, length);
    sum = 0;
    pos = length - 7;
    
    for (let i = length; i >= 1; i--) {
      sum += numbers_array.charAt(length - i) * pos--;
      if (pos < 2) pos = 9;
    }
    
    result = sum % 11 < 2 ? 0 : 11 - sum % 11;
    return result === parseInt(digits.charAt(1));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'cnpj') {
      const formattedCNPJ = formatCNPJ(value);
      setFormData(prev => ({
        ...prev,
        [name]: formattedCNPJ
      }));

      const unformattedCNPJ = formattedCNPJ.replace(/\D/g, '');
      if (unformattedCNPJ.length === 14) {
        const isValid = validateCNPJ(unformattedCNPJ);
        setErrors(prev => ({
          ...prev,
          cnpj: isValid ? null : 'invalid'
        }));
      } else {
        setErrors(prev => ({ ...prev, cnpj: null }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async () => {
    const unformattedCNPJ = formData.cnpj.replace(/\D/g, '');
    
    if (!validateCNPJ(unformattedCNPJ)) {
      setErrors(prev => ({ ...prev, cnpj: 'CNPJ inválido' }));
      return;
    }

    try {
      const dataToSend = {
        ...formData,
        cnpj: unformattedCNPJ // Envia apenas os números
      };
      
      await api.post('/inventario/clientes/', dataToSend);
      onSuccess();
      setFormData({
        grupo_economico: '',
        razao_social: '',
        cnpj: '',
        vantive_id: '',
        codigo: '',
        status: true
      });
      setErrors({});
    } catch (error) {
      if (error.response?.data?.cnpj) {
        setErrors(prev => ({ ...prev, cnpj: 'CNPJ já cadastrado' }));
      }
      console.error('Erro ao adicionar cliente:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="inv-filter-dropdown" ref={dropdownRef}>
      <div className="inv-dropdown-header">
        <h3>Adicionar Cliente</h3>
      </div>
      <div className="inv-filter-content">
        <div className="inv-filter-field">
          <label className="inv-filter-label">Grupo Econômico</label>
          <input
            className="inv-filter-input"
            type="text"
            value={grupoSearchTerm}
            onChange={(e) => {
              setGrupoSearchTerm(e.target.value);
              setIsGrupoDropdownOpen(true);
            }}
            onFocus={() => setIsGrupoDropdownOpen(true)}
            placeholder="Pesquisar grupo econômico..."
          />
          {isGrupoDropdownOpen && (
            <div className="inv-client-dropdown">
              {gruposEconomicos
                .filter(grupo => 
                  grupo.razao_social.toLowerCase().includes(grupoSearchTerm.toLowerCase())
                )
                .map(grupo => (
                  <div
                    key={grupo.id}
                    className="inv-client-option"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        grupo_economico: grupo.id
                      }));
                      setGrupoSearchTerm(grupo.razao_social);
                      setIsGrupoDropdownOpen(false);
                    }}
                  >
                    {grupo.razao_social}
                  </div>
                ))
              }
            </div>
          )}
        </div>

        <div className="inv-filter-field">
          <label className="inv-filter-label">Razão Social</label>
          <input
            className="inv-filter-input"
            type="text"
            name="razao_social"
            value={formData.razao_social}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="inv-filter-field">
          <label className="inv-filter-label">CNPJ</label>
          <input
            className={`inv-filter-input ${
              formData.cnpj && (
                errors.cnpj === null ? 'valid' : 
                errors.cnpj === 'invalid' ? 'invalid' : ''
              )
            }`}
            type="text"
            name="cnpj"
            value={formData.cnpj}
            onChange={handleInputChange}
            placeholder="00.000.000/0000-00"
            maxLength={18}
          />
        </div>

        <div className="inv-filter-field">
          <label className="inv-filter-label">Vantive ID</label>
          <input
            className="inv-filter-input"
            type="text"
            name="vantive_id"
            value={formData.vantive_id}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="inv-filter-field">
          <label className="inv-filter-label">Código</label>
          <input
            className="inv-filter-input"
            type="text"
            name="codigo"
            value={formData.codigo}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="inv-filter-field">
          <label className="inv-filter-label">Status</label>
          <select
            className="inv-filter-input"
            name="status"
            value={formData.status}
            onChange={handleInputChange}
          >
            <option value={true}>Ativo</option>
            <option value={false}>Inativo</option>
          </select>
        </div>
      </div>

      <div className="inv-filter-actions">
        <button className="inv-cancel-button" onClick={onClose}>
          <FaTimes /> Cancelar
        </button>
        <button className="inv-save-button" onClick={handleSubmit}>
          <FaSave /> Salvar
        </button>
      </div>
    </div>
  );
}

export default AddClientDropdown;
