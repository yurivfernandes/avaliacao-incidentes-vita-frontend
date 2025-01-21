import React, { useState, useEffect, useRef } from 'react';
import { FaSearch } from 'react-icons/fa';
import { MdFilterAltOff } from 'react-icons/md';
import api from '../../services/api';
import '../../styles/FilterDropdown.css';

function FilterDropdown({ isOpen, onClose, filters, setFilters, onApply }) {
  const [clients, setClients] = useState([]);
  const [gruposEconomicos, setGruposEconomicos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState(filters.cliente || '');
  const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState({ ...filters });
  const dropdownRef = useRef(null);

  const [grupoSearchTerm, setGrupoSearchTerm] = useState('');
  const [isGrupoDropdownOpen, setIsGrupoDropdownOpen] = useState(false);
  const [selectedGrupo, setSelectedGrupo] = useState(filters.grupo_economico || '');

  useEffect(() => {
    fetchClients();
    fetchGruposEconomicos();
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (filters.cliente) {
      const client = clients.find(client => client.id === filters.cliente);
      if (client) {
        setSearchTerm(client.razao_social);
        setSelectedClient(client.id);
      }
    }
  }, [filters.cliente, clients]);

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      onClose();
    }
  };

  const fetchClients = async () => {
    try {
      const response = await api.get('/inventario/clientes/');
      setClients(response.data.results);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    }
  };

  const fetchGruposEconomicos = async () => {
    try {
      const response = await api.get('/inventario/grupos-economicos/');
      setGruposEconomicos(response.data.results);
    } catch (error) {
      console.error('Erro ao carregar grupos econômicos:', error);
    }
  };

  const handleApply = () => {
    setFilters(prev => ({ ...prev, ...localFilters, cliente: selectedClient }));
    onApply();
    onClose();
  };

  const clearFilters = () => {
    setLocalFilters({});
    setSearchTerm(''); // Limpar o termo de busca do cliente
    setSelectedClient(''); // Limpar o cliente selecionado
  };

  if (!isOpen) return null;

  return (
    <div className="inv-filter-dropdown" ref={dropdownRef}>
      <div className="inv-filter-content">
        {/* Grupo Econômico e Cliente lado a lado */}
        <div className="inv-filter-row">
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
                        setSelectedGrupo(grupo.id);
                        setGrupoSearchTerm(grupo.razao_social);
                        setIsGrupoDropdownOpen(false);
                        setLocalFilters(prev => ({...prev, grupo_economico: grupo.id}));
                      }}
                    >
                      {grupo.razao_social}
                    </div>
                  ))
                }
              </div>
            )}
          </div>

          <div className="inv-filter-field client-search">
            <label className="inv-filter-label">Cliente</label>
            <input
              className="inv-filter-input"
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setIsClientDropdownOpen(true);
              }}
              onFocus={() => setIsClientDropdownOpen(true)}
              placeholder="Digite para pesquisar cliente..."
            />
            {isClientDropdownOpen && (
              <div className="inv-client-dropdown">
                {clients
                  .filter(client => 
                    client.razao_social.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map(client => (
                    <div
                      key={client.id}
                      className="inv-client-option"
                      onClick={() => {
                        setSelectedClient(client.id);
                        setSearchTerm(client.razao_social);
                        setIsClientDropdownOpen(false);
                      }}
                    >
                      {client.razao_social} ({client.codigo})
                    </div>
                  ))
                }
              </div>
            )}
          </div>
        </div>

        {/* Filtros de Site */}
        <div className="inv-filter-field">
          <label className="inv-filter-label">Código Vivo Site</label>
          <input
            className="inv-filter-input"
            type="text"
            value={localFilters.codigo_vivo || ''}
            onChange={(e) => setLocalFilters(prev => ({...prev, codigo_vivo: e.target.value}))}
          />
        </div>

        <div className="inv-filter-field">
          <label className="inv-filter-label">Código Sistema</label>
          <input
            className="inv-filter-input"
            type="text"
            value={localFilters.codigo_sys_cliente || ''}
            onChange={(e) => setLocalFilters(prev => ({...prev, codigo_sys_cliente: e.target.value}))}
          />
        </div>

        <div className="inv-filter-field">
          <label className="inv-filter-label">Tipo Site</label>
          <input
            className="inv-filter-input"
            type="text"
            value={localFilters.tipo_site || ''}
            onChange={(e) => setLocalFilters(prev => ({...prev, tipo_site: e.target.value}))}
          />
        </div>

        <div className="inv-filter-field">
          <label className="inv-filter-label">Tipo Negócio</label>
          <input
            className="inv-filter-input"
            type="text"
            value={localFilters.tipo_negocio || ''}
            onChange={(e) => setLocalFilters(prev => ({...prev, tipo_negocio: e.target.value}))}
          />
        </div>

        {/* Filtros de Equipamento */}
        <div className="inv-filter-field">
          <label className="inv-filter-label">Código Equipamento</label>
          <input
            className="inv-filter-input"
            type="text"
            value={localFilters.codigo_equipamento || ''}
            onChange={(e) => setLocalFilters(prev => ({...prev, codigo_equipamento: e.target.value}))}
          />
        </div>

        <div className="inv-filter-field">
          <label className="inv-filter-label">Tipo Equipamento</label>
          <input
            className="inv-filter-input"
            type="text"
            value={localFilters.tipo_equipamento || ''}
            onChange={(e) => setLocalFilters(prev => ({...prev, tipo_equipamento: e.target.value}))}
          />
        </div>

        <div className="inv-filter-field">
          <label className="inv-filter-label">Designador Equipamento</label>
          <input
            className="inv-filter-input"
            type="text"
            value={localFilters.designador_equipamento || ''}
            onChange={(e) => setLocalFilters(prev => ({...prev, designador_equipamento: e.target.value}))}
          />
        </div>

        {/* Filtros de Serviço */}
        <div className="inv-filter-field">
          <label className="inv-filter-label">Código Serviço</label>
          <input
            className="inv-filter-input"
            type="text"
            value={localFilters.codigo_servico || ''}
            onChange={(e) => setLocalFilters(prev => ({...prev, codigo_servico: e.target.value}))}
          />
        </div>

        <div className="inv-filter-field">
          <label className="inv-filter-label">Tipo Serviço</label>
          <input
            className="inv-filter-input"
            type="text"
            value={localFilters.tipo_servico || ''}
            onChange={(e) => setLocalFilters(prev => ({...prev, tipo_servico: e.target.value}))}
          />
        </div>

        <div className="inv-filter-field">
          <label className="inv-filter-label">Designador Serviço</label>
          <input
            className="inv-filter-input"
            type="text"
            value={localFilters.designador_servico || ''}
            onChange={(e) => setLocalFilters(prev => ({...prev, designador_servico: e.target.value}))}
          />
        </div>

        {/* Status (geral para todas as APIs) */}
        <div className="inv-filter-field">
          <label className="inv-filter-label">Status</label>
          <select
            className="inv-filter-input"
            value={localFilters.status || ''}
            onChange={(e) => setLocalFilters(prev => ({...prev, status: e.target.value}))}
          >
            <option value="">Todos</option>
            <option value="true">Ativo</option>
            <option value="false">Inativo</option>
          </select>
        </div>

        <div className="inv-filter-field">
          <label className="inv-filter-label">Status Vantive</label>
          <select
            className="inv-filter-input"
            value={localFilters.status_vantive || ''}
            onChange={(e) => setLocalFilters(prev => ({...prev, status_vantive: e.target.value}))}
          >
            <option value="">Todos</option>
            <option value="true">Ativo</option>
            <option value="false">Inativo</option>
          </select>
        </div>
      </div>

      <div className="inv-filter-actions">
        <button className="inv-clear-button" onClick={clearFilters}>
          <MdFilterAltOff /> Limpar
        </button>
        <button className="inv-apply-button" onClick={handleApply}>
          <FaSearch /> Consultar
        </button>
      </div>
    </div>
  );
}

export default FilterDropdown;
