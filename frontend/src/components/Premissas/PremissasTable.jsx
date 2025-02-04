import React, { useState, useEffect } from 'react';
import { FaEdit, FaCheck, FaTimes, FaSearch, FaPlus } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Select from 'react-select';
import '../../styles/PremissasTable.css';
import AddPremissaDropdown from './AddPremissaDropdown';

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
    setEditingId(premissa.id);
    setEditData({
      assignment: premissa.assignment,
      qtd_incidents: premissa.qtd_incidents,
      is_contrato_lancado: premissa.is_contrato_lancado,
      is_horas_lancadas: premissa.is_horas_lancadas,
      is_has_met_first_response_target: premissa.is_has_met_first_response_target,
      is_resolution_target: premissa.is_resolution_target,
      is_atualizaca_logs_correto: premissa.is_atualizaca_logs_correto,
      is_ticket_encerrado_corretamente: premissa.is_ticket_encerrado_corretamente,
      is_descricao_troubleshooting: premissa.is_descricao_troubleshooting,
      is_cliente_notificado: premissa.is_cliente_notificado,
      is_category_correto: premissa.is_category_correto,
    });
  };

  const handleSave = async (id) => {
    try {
      await api.patch(`/premissas/list/${id}/`, editData);
      setEditingId(null);
      fetchPremissas(currentPage, searchTerm);
    } catch (error) {
      console.error('Erro ao atualizar premissa:', error);
    }
  };

  const handleSuccess = () => {
    fetchPremissas(currentPage, searchTerm);
  };

  const renderEditRow = (premissa) => (
    <>
      <td>
        <Select
          value={{
            value: editData.assignment,
            label: premissa.dv_assignment_group
          }}
          onChange={(selectedOption) => {
            setEditData({ ...editData, assignment: selectedOption.value });
          }}
          options={assignmentGroups?.map(group => ({
            value: group.id,
            label: group.dv_assignment_group
          }))}
          className="react-select-container"
          classNamePrefix="react-select"
          isDisabled={true}
        />
      </td>
      <td>
        <input
          type="number"
          value={editData.qtd_incidents}
          onChange={(e) => setEditData({ ...editData, qtd_incidents: e.target.value })}
          className="edit-input"
          min="1"
        />
      </td>
      <td>
        <input
          type="checkbox"
          checked={editData.is_contrato_lancado}
          onChange={(e) => setEditData({ ...editData, is_contrato_lancado: e.target.checked })}
        />
      </td>
      <td>
        <input
          type="checkbox"
          checked={editData.is_horas_lancadas}
          onChange={(e) => setEditData({ ...editData, is_horas_lancadas: e.target.checked })}
        />
      </td>
      <td>
        <input
          type="checkbox"
          checked={editData.is_has_met_first_response_target}
          onChange={(e) => setEditData({ ...editData, is_has_met_first_response_target: e.target.checked })}
        />
      </td>
      <td>
        <input
          type="checkbox"
          checked={editData.is_resolution_target}
          onChange={(e) => setEditData({ ...editData, is_resolution_target: e.target.checked })}
        />
      </td>
      <td>
        <input
          type="checkbox"
          checked={editData.is_atualizaca_logs_correto}
          onChange={(e) => setEditData({ ...editData, is_atualizaca_logs_correto: e.target.checked })}
        />
      </td>
      <td>
        <input
          type="checkbox"
          checked={editData.is_ticket_encerrado_corretamente}
          onChange={(e) => setEditData({ ...editData, is_ticket_encerrado_corretamente: e.target.checked })}
        />
      </td>
      <td>
        <input
          type="checkbox"
          checked={editData.is_descricao_troubleshooting}
          onChange={(e) => setEditData({ ...editData, is_descricao_troubleshooting: e.target.checked })}
        />
      </td>
      <td>
        <input
          type="checkbox"
          checked={editData.is_cliente_notificado}
          onChange={(e) => setEditData({ ...editData, is_cliente_notificado: e.target.checked })}
        />
      </td>
      <td>
        <input
          type="checkbox"
          checked={editData.is_category_correto}
          onChange={(e) => setEditData({ ...editData, is_category_correto: e.target.checked })}
        />
      </td>
      <td>
        <div className="actions-column">
          <button className="edit-button" onClick={() => handleSave(premissa.id)}>
            <FaCheck />
          </button>
          <button className="edit-button" onClick={() => setEditingId(null)}>
            <FaTimes />
          </button>
        </div>
      </td>
    </>
  );

  return (
    <div className="tecnicos-content">
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
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
      </div>

      <div className="table-container">
        <div className="table-scroll">
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Fila</th>
                <th>Quantidade de Incidentes</th>
                <th>Contrato Lançado</th>
                <th>Horas Lançadas</th>
                <th>Met First Response Target</th>
                <th>Resolution Target</th>
                <th>Atualização de Logs Correto</th>
                <th>Ticket Encerrado Corretamente</th>
                <th>Descrição de Troubleshooting</th>
                <th>Cliente Notificado</th>
                <th>Categoria Correta</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="12">Carregando...</td>
                </tr>
              ) : (
                premissas.map((premissa) => (
                  <tr key={premissa.id}>
                    {editingId === premissa.id ? (
                      renderEditRow(premissa)
                    ) : (
                      <>
                        <td>{premissa.dv_assignment_group}</td>
                        <td>{premissa.qtd_incidents}</td>
                        <td>{premissa.is_contrato_lancado ? 'Sim' : 'Não'}</td>
                        <td>{premissa.is_horas_lancadas ? 'Sim' : 'Não'}</td>
                        <td>{premissa.is_has_met_first_response_target ? 'Sim' : 'Não'}</td>
                        <td>{premissa.is_resolution_target ? 'Sim' : 'Não'}</td>
                        <td>{premissa.is_atualizaca_logs_correto ? 'Sim' : 'Não'}</td>
                        <td>{premissa.is_ticket_encerrado_corretamente ? 'Sim' : 'Não'}</td>
                        <td>{premissa.is_descricao_troubleshooting ? 'Sim' : 'Não'}</td>
                        <td>{premissa.is_cliente_notificado ? 'Sim' : 'Não'}</td>
                        <td>{premissa.is_category_correto ? 'Sim' : 'Não'}</td>
                        <td>
                          <div className="actions-column">
                            <button className="edit-button" onClick={() => handleEdit(premissa)}>
                              <FaEdit />
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

        <div className="pagination">
          <div className="pagination-info">
            Página {currentPage} de {totalPages}
          </div>
          <div className="pagination-controls">
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
    </div>
  );
}

export default PremissasTable;