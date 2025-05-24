import React, { useState, useEffect } from 'react';
import { FaEdit, FaCheck, FaTimes, FaSearch, FaPlus, FaPencilAlt, FaClipboardList } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Select from 'react-select';
import '../../styles/GenericTable.css';
import AddPremissaDropdown from './AddPremissaDropdown';
import CriteriosTable from './CriteriosTable';

function PremissasTable() {
  const { user: currentUser } = useAuth();
  const [premissas, setPremissas] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [assignmentGroups, setAssignmentGroups] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddPremissa, setShowAddPremissa] = useState(false);
  const [selectedPremissa, setSelectedPremissa] = useState(null);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchPremissas(currentPage, searchTerm);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [currentPage, searchTerm]);

  useEffect(() => {
    fetchAssignmentGroups();
  }, []);

  const fetchAssignmentGroups = async () => {
    try {
      const response = await api.get('/dw_analytics/assignment-group/');
      setAssignmentGroups(response.data.results || response.data);
    } catch (error) {
      console.error('Erro ao buscar assignment groups:', error);
    }
  };

  const fetchPremissas = async (page = 1, search = '') => {
    setLoading(true);
    try {
      let url = `/premissas/list/?page=${page}`;
      
      if (search.trim()) {
        url += `&search=${search}`;
      }

      const response = await api.get(url);
      setPremissas(response.data.results);
      setTotalPages(response.data.num_pages);
    } catch (error) {
      console.error('Erro ao buscar premissas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (premissa) => {
    setSelectedPremissa(premissa);
    setEditingId(null); // Reseta o modo de edição ao navegar
  };

  const handleEditQtdIncidents = (premissa) => {
    setEditingId(premissa.id);
    setEditData({
      assignment: premissa.assignment,
      qtd_incidents: premissa.qtd_incidents,
      meta_mensal: premissa.meta_mensal // Corrigido para pegar a meta_mensal
    });
  };

  const handleSave = async (id) => {
    try {
      await api.patch(`/premissas/list/${id}/`, {
        assignment: editData.assignment,
        qtd_incidents: editData.qtd_incidents,
        meta_mensal: editData.meta_mensal
      });
      setEditingId(null);
      fetchPremissas(currentPage, searchTerm);
    } catch (error) {
      console.error('Erro ao atualizar premissa:', error);
    }
  };

  const handleSuccess = () => {
    fetchPremissas(currentPage, searchTerm);
  };

  const handleCloseCriterios = () => {
    setSelectedPremissa(null);
  };

  // Atualizar renderEditRow
  const renderEditRow = (item) => {
    return (
      <>
        <td>{item.dv_assignment_group}</td>
        <td>
          <input
            className="edit-input"
            type="number"
            value={editData.qtd_incidents}
            onChange={(e) => setEditData({...editData, qtd_incidents: e.target.value})}
            style={{ width: '100%', maxWidth: '100px' }}
          />
        </td>
        <td>
          <input
            className="edit-input"
            type="number"
            value={editData.meta_mensal} // Corrigido para usar meta_mensal ao invés de meta
            onChange={(e) => setEditData({...editData, meta_mensal: parseInt(e.target.value)})}
            style={{ width: '100%', maxWidth: '100px' }}
            min="0"
          />
        </td>
        <td>
          <div className="actions-column">
            <button 
              className="edit-button criterios-button"
              onClick={() => handleEdit(item)}
              title="Gerenciar critérios"
            >
              <FaClipboardList />
            </button>
          </div>
        </td>
        <td>
          <div className="actions-column">
            <button className="save-button" onClick={() => handleSave(item.id)} title="Salvar">
              <FaCheck />
            </button>
            <button className="cancel-button" onClick={() => setEditingId(null)} title="Cancelar">
              <FaTimes />
            </button>
          </div>
        </td>
      </>
    );
  };

  if (selectedPremissa) {
    return (
      <>
        <div className="page-header">
          <div className="page-title">
            <h2>Critérios - {selectedPremissa.dv_assignment_group}</h2>
          </div>
          <button className="button-secondary" onClick={handleCloseCriterios}>
            Voltar
          </button>
        </div>
        <CriteriosTable premissaId={selectedPremissa.id} />
      </>
    );
  }

  return (
    <>
      <div className="page-header">
        <div className="page-actions">
          <div className="dropdown-wrapper">
            <button className="add-user-button" onClick={() => setShowAddPremissa(true)}>
              <FaPlus /> Adicionar Premissa
            </button>
            {showAddPremissa && (
              <AddPremissaDropdown
                onClose={() => setShowAddPremissa(false)}
                onSuccess={handleSuccess}
              />
            )}
          </div>
        </div>
        
        <div className="search-container">
          <div className="search-wrapper">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Buscar premissa..."
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
                <th>Fila</th>
                <th>Quantidade de Incidentes</th>
                <th>Meta</th> {/* Removido o (%) do cabeçalho */}
                <th>Critérios</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5">Carregando...</td></tr>
              ) : premissas.length === 0 ? (
                <tr><td colSpan="5">Nenhuma premissa encontrada</td></tr>
              ) : (
                premissas.map((premissa) => (
                  <tr key={premissa.id}>
                    {editingId === premissa.id ? (
                      renderEditRow(premissa)
                    ) : (
                      <>
                        <td>{premissa.dv_assignment_group}</td>
                        <td>{premissa.qtd_incidents}</td>
                        <td>{premissa.meta_mensal}</td> {/* Removido o símbolo % */}
                        <td>
                          <div className="actions-column">
                            <button 
                              className="edit-button criterios-button"
                              onClick={() => handleEdit(premissa)}
                              title="Gerenciar critérios"
                            >
                              <FaClipboardList />
                            </button>
                          </div>
                        </td>
                        <td>
                          <div className="actions-column">
                            <button 
                              className="edit-button" 
                              onClick={() => handleEditQtdIncidents(premissa)}
                              title="Editar"
                            >
                              <FaPencilAlt />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
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
      </div>
    </>
  );
}

export default PremissasTable;