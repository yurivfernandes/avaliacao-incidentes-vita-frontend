import React, { useState, useEffect } from 'react';
import { FaEdit, FaCheck, FaTimes, FaSearch, FaPlus, FaChevronDown, FaChevronRight } from 'react-icons/fa';
import api from '../../services/api';
import Select from 'react-select';
import AddCriterioDropdown from './AddCriterioDropdown';
import '../../styles/TecnicosTable.css';

// Atualizado para incluir o tipo "conversao"
const tipoOptions = [
  { value: 'boolean', label: 'Booleano' },
  { value: 'integer', label: 'Inteiro' },
  { value: 'conversao', label: 'Conversão' }
];

function CriteriosTable({ premissaId }) {
  const [criterios, setCriterios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [serviceNowFields, setServiceNowFields] = useState([]);
  const [loadingFields, setLoadingFields] = useState(false);
  const [expandedCriterios, setExpandedCriterios] = useState({});
  const [conversoes, setConversoes] = useState({});
  const [editingConversao, setEditingConversao] = useState({ criterioId: null, conversaoId: null });
  const [editConversaoData, setEditConversaoData] = useState({});
  const [showAddConversao, setShowAddConversao] = useState(null);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchCriterios();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [premissaId, searchTerm, currentPage]);

  useEffect(() => {
    fetchServiceNowFields();
  }, []);

  const fetchServiceNowFields = async () => {
    try {
      setLoadingFields(true);
      const response = await api.get('/dw_analytics/incident-fields/');
      
      if (response.data && response.data.fields) {
        const formattedFields = response.data.fields.map(field => ({
          value: field,
          label: field
        }));
        
        setServiceNowFields(formattedFields);
      } else {
        console.error('Formato inesperado de dados:', response.data);
        setServiceNowFields([]);
      }
    } catch (error) {
      console.error('Erro ao buscar campos do ServiceNow:', error);
    } finally {
      setLoadingFields(false);
    }
  };

  const fetchConversoesByCriterio = async (criterioId) => {
    try {
      const response = await api.get(`/premissas/conversoes/?criterio=${criterioId}`);
      const data = response.data.results || response.data;
      
      setConversoes(prev => ({
        ...prev,
        [criterioId]: data
      }));
    } catch (error) {
      console.error(`Erro ao buscar conversões para critério ${criterioId}:`, error);
      setConversoes(prev => ({
        ...prev,
        [criterioId]: []
      }));
    }
  };

  const fetchCriterios = async () => {
    setLoading(true);
    try {
      let url = `/premissas/criterios/?premissa=${premissaId}`;
      if (searchTerm) {
        url += `&search=${searchTerm}`;
      }
      if (currentPage > 1) {
        url += `&page=${currentPage}`;
      }
      
      const response = await api.get(url);
      const criteriosData = response.data.results || [];
      setCriterios(criteriosData);
      setTotalPages(response.data.num_pages || 1);
      
      const conversaoCriterios = criteriosData.filter(c => c.tipo === 'conversao');
      for (const criterio of conversaoCriterios) {
        fetchConversoesByCriterio(criterio.id);
      }
    } catch (error) {
      console.error('Erro ao buscar critérios:', error);
      setCriterios([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (criterio) => {
    setEditingId(criterio.id);
    setEditData({
      nome: criterio.nome,
      tipo: criterio.tipo,
      ativo: criterio.ativo,
      peso: criterio.peso,
      field_service_now: criterio.field_service_now
    });
  };

  const handleSave = async (id) => {
    try {
      await api.patch(`/premissas/criterios/${id}/?premissa=${premissaId}`, editData);
      setEditingId(null);
      fetchCriterios();
    } catch (error) {
      console.error('Erro ao atualizar critério:', error);
    }
  };

  const handleSuccess = () => {
    fetchCriterios();
  };

  const toggleCriterioExpand = (criterioId) => {
    if (!expandedCriterios[criterioId]) {
      fetchConversoesByCriterio(criterioId);
    }
    
    setExpandedCriterios(prev => ({
      ...prev,
      [criterioId]: !prev[criterioId]
    }));
  };

  const handleEditConversao = (criterioId, conversao) => {
    setEditingConversao({ criterioId, conversaoId: conversao.id });
    setEditConversaoData({
      nome: conversao.nome,
      percentual: conversao.percentual
    });
  };

  const handleSaveConversao = async (conversaoId) => {
    try {
      await api.patch(`/premissas/conversoes/${conversaoId}/`, editConversaoData);
      setEditingConversao({ criterioId: null, conversaoId: null });
      fetchConversoesByCriterio(editingConversao.criterioId);
    } catch (error) {
      console.error('Erro ao atualizar conversão:', error);
    }
  };

  const handleAddConversao = async (criterioId) => {
    try {
      await api.post('/premissas/conversoes/', {
        ...editConversaoData,
        criterio: criterioId
      });
      
      setShowAddConversao(null);
      setEditConversaoData({});
      fetchConversoesByCriterio(criterioId);
    } catch (error) {
      console.error('Erro ao adicionar conversão:', error);
    }
  };

  const renderEditRow = (criterio) => (
    <>
      <td>
        <input
          type="text"
          value={editData.nome || ''}
          onChange={(e) => setEditData({ ...editData, nome: e.target.value })}
          className="edit-input"
          placeholder="Nome"
        />
      </td>
      <td>
        <Select
          value={tipoOptions.find(opt => opt.value === editData.tipo)}
          onChange={(selected) => setEditData({ ...editData, tipo: selected.value })}
          options={tipoOptions}
          className="react-select-container"
          classNamePrefix="react-select"
          isSearchable={false}
          menuPlacement="auto"
        />
      </td>
      <td>
        <input
          type="number"
          value={editData.peso || ''}
          onChange={(e) => {
            const value = e.target.value;
            if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 99)) {
              setEditData({ ...editData, peso: value });
            }
          }}
          className="edit-input"
          min="0"
          max="99"
          maxLength="2"
        />
      </td>
      <td>
        <Select
          value={serviceNowFields.find(opt => opt.value === editData.field_service_now)}
          onChange={(selected) => setEditData({ ...editData, field_service_now: selected?.value })}
          options={serviceNowFields}
          isClearable
          isLoading={loadingFields}
          className="react-select-container"
          classNamePrefix="react-select"
          menuPlacement="auto"
        />
      </td>
      <td>
        <input
          type="checkbox"
          checked={editData.ativo}
          onChange={(e) => setEditData({ ...editData, ativo: e.target.checked })}
        />
      </td>
      <td>
        <div className="actions-column">
          <button className="edit-button" onClick={() => handleSave(criterio.id)} title="Salvar">
            <FaCheck />
          </button>
          <button className="edit-button" onClick={() => setEditingId(null)} title="Cancelar">
            <FaTimes />
          </button>
        </div>
      </td>
    </>
  );

  const renderConversaoTable = (criterioId) => {
    const conversoesList = conversoes[criterioId] || [];
    
    return (
      <tr className="conversao-row">
        <td colSpan="6">
          <div className="conversao-container">
            <div className="conversao-header">
              <h4>Tabela de Conversão</h4>
              
              {showAddConversao !== criterioId && (
                <button className="add-user-button add-conversao-button" onClick={() => setShowAddConversao(criterioId)}>
                  <FaPlus /> Adicionar Conversão
                </button>
              )}
            </div>
            
            <div className="tecnicos-table-container conversao-table-container">
              <div className="tecnicos-table-scroll">
                <table className="tecnicos-table conversao-table">
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>Percentual (%)</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {conversoesList.map(conversao => (
                      editingConversao.criterioId === criterioId && editingConversao.conversaoId === conversao.id ? (
                        <tr key={conversao.id} className="edit-conversao-row">
                          <td>
                            <input
                              type="text"
                              value={editConversaoData.nome || ''}
                              onChange={(e) => setEditConversaoData({...editConversaoData, nome: e.target.value})}
                              className="edit-input"
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              value={editConversaoData.percentual || ''}
                              onChange={(e) => {
                                const value = e.target.value;
                                if (value === '' || (parseFloat(value) >= 0 && parseFloat(value) <= 100)) {
                                  setEditConversaoData({...editConversaoData, percentual: value});
                                }
                              }}
                              step="0.01"
                              min="0"
                              max="100"
                              className="edit-input percentual-input"
                            />
                          </td>
                          <td>
                            <div className="actions-column">
                              <button className="save-button" onClick={() => handleSaveConversao(conversao.id)} title="Salvar">
                                <FaCheck />
                              </button>
                              <button className="cancel-button" onClick={() => setEditingConversao({criterioId: null, conversaoId: null})} title="Cancelar">
                                <FaTimes />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        <tr key={conversao.id}>
                          <td>{conversao.nome}</td>
                          <td>{conversao.percentual}%</td>
                          <td>
                            <div className="actions-column">
                              <button className="edit-button" onClick={() => handleEditConversao(criterioId, conversao)} title="Editar conversão">
                                <FaEdit />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    ))}
                    {showAddConversao === criterioId && (
                      <tr className="edit-conversao-row">
                        <td>
                          <input
                            type="text"
                            value={editConversaoData.nome || ''}
                            onChange={(e) => setEditConversaoData({...editConversaoData, nome: e.target.value})}
                            placeholder="Nome da conversão"
                            className="edit-input"
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            value={editConversaoData.percentual || ''}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value === '' || (parseFloat(value) >= 0 && parseFloat(value) <= 100)) {
                                setEditConversaoData({...editConversaoData, percentual: value});
                              }
                            }}
                            step="0.01"
                            min="0"
                            max="100"
                            placeholder="0.00"
                            className="edit-input percentual-input"
                          />
                        </td>
                        <td>
                          <div className="actions-column">
                            <button className="save-button" onClick={() => handleAddConversao(criterioId)} title="Salvar">
                              <FaCheck />
                            </button>
                            <button className="cancel-button" onClick={() => setShowAddConversao(null)} title="Cancelar">
                              <FaTimes />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                    {conversoesList.length === 0 && !showAddConversao && (
                      <tr>
                        <td colSpan="3" style={{ textAlign: 'center', fontStyle: 'italic' }}>
                          Nenhuma conversão cadastrada
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <>
      <div className="page-header">
        <div className="page-actions">
          <div className="dropdown-wrapper">
            <button 
              className="add-user-button" 
              onClick={() => setShowAddForm(true)}
            >
              <FaPlus /> Adicionar Critério
            </button>
            {showAddForm && (
              <AddCriterioDropdown
                onClose={() => setShowAddForm(false)}
                onSuccess={handleSuccess}
                premissaId={premissaId}
              />
            )}
          </div>
        </div>
        
        <div className="search-container">
          <div className="search-wrapper">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Buscar critérios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
      </div>

      <div className="tecnicos-table-container">
        <div className="tecnicos-table-scroll">
          <table className="tecnicos-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Tipo</th>
                <th>Peso</th>
                <th>Campo ServiceNow</th>
                <th>Ativo</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6">Carregando critérios...</td>
                </tr>
              ) : criterios.length === 0 ? (
                <tr>
                  <td colSpan="6">Nenhum critério encontrado</td>
                </tr>
              ) : (
                criterios.map(criterio => (
                  <React.Fragment key={criterio.id}>
                    <tr>
                      {editingId === criterio.id ? (
                        renderEditRow(criterio)
                      ) : (
                        <>
                          <td>
                            {criterio.tipo === 'conversao' && (
                              <span 
                                className="toggle-expand" 
                                onClick={() => toggleCriterioExpand(criterio.id)}
                              >
                                {expandedCriterios[criterio.id] ? <FaChevronDown /> : <FaChevronRight />}
                              </span>
                            )}
                            {criterio.nome}
                          </td>
                          <td>{criterio.tipo === 'boolean' ? 'Booleano' : criterio.tipo === 'integer' ? 'Inteiro' : 'Conversão'}</td>
                          <td>{criterio.peso}</td>
                          <td>{criterio.field_service_now || '-'}</td>
                          <td>
                            <span className={criterio.ativo ? 'status-active' : 'status-inactive'}>
                              {criterio.ativo ? 'Sim' : 'Não'}
                            </span>
                          </td>
                          <td>
                            <div className="actions-column">
                              <button 
                                className="edit-button" 
                                onClick={() => handleEdit(criterio)}
                                title="Editar critério"
                              >
                                <FaEdit />
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                    {criterio.tipo === 'conversao' && expandedCriterios[criterio.id] && renderConversaoTable(criterio.id)}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="tecnicos-pagination">
            <div className="tecnicos-pagination-info">
              Página {currentPage} de {totalPages}
            </div>
            <div className="tecnicos-pagination-controls">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Anterior
              </button>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Próxima
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default CriteriosTable;
