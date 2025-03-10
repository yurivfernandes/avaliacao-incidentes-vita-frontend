import React, { useState, useEffect } from 'react';
import { FaEdit, FaCheck, FaTimes, FaSearch, FaClipboardCheck, FaClock } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import '../../styles/TecnicosTable.css';
import TicketsSorteados from './TicketsSorteados';

const getTabs = (isStaffOrGestor) => {
  const baseTabs = [
    { id: 'avaliados', label: 'Tickets Avaliados', icon: <FaClipboardCheck /> }
  ];

  if (isStaffOrGestor) {
    baseTabs.unshift({ 
      id: 'pendentes', 
      label: 'Tickets Pendentes', 
      icon: <FaClock /> 
    });
  }

  return baseTabs;
};

function AvaliacoesTable() {
  const { user: currentUser } = useAuth();
  const isStaffOrGestor = currentUser?.is_staff || currentUser?.is_gestor;
  const [activeTab, setActiveTab] = useState(isStaffOrGestor ? 'pendentes' : 'avaliados');
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    if (activeTab === 'avaliados') {
      fetchAvaliacoes(currentPage, searchTerm);
    }
  }, [activeTab, currentPage, searchTerm]);

  const fetchAvaliacoes = async (page = 1, search = '') => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page,
        page_size: 10,
      });
      
      if (search.trim()) {
        params.append('search', search);
      }

      if (currentUser?.is_gestor && currentUser?.assignment_groups?.length > 0) {
        currentUser.assignment_groups.forEach(group => {
          params.append('assignment_groups', group.id);
        });
      } else if (!currentUser?.is_staff) {
        params.append('resolved_by', currentUser.id);
      }

      const response = await api.get(`/avaliacao/avaliacoes/?${params}`);
      setAvaliacoes(response.data.results);
      setTotalPages(response.data.num_pages || 1);
    } catch (error) {
      console.error('Erro ao buscar avaliações:', error);
      setAvaliacoes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (avaliacao) => {
    setEditingId(avaliacao.id);
    setEditData({
      is_contrato_lancado: avaliacao.is_contrato_lancado,
      is_horas_lancadas: avaliacao.is_horas_lancadas,
      is_has_met_first_response_target: avaliacao.is_has_met_first_response_target,
      is_resolution_target: avaliacao.is_resolution_target,
      is_atualizaca_logs_correto: avaliacao.is_atualizaca_logs_correto,
      is_ticket_encerrado_corretamente: avaliacao.is_ticket_encerrado_corretamente,
      is_descricao_troubleshooting: avaliacao.is_descricao_troubleshooting,
      is_cliente_notificado: avaliacao.is_cliente_notificado,
      is_category_correto: avaliacao.is_category_correto,
    });
  };

  const handleSave = async (id) => {
    try {
      await api.patch(`/avaliacao/avaliacoes/${id}/`, editData);
      setEditingId(null);
      setEditData({});
      fetchAvaliacoes(currentPage, searchTerm);
    } catch (error) {
      console.error('Erro ao salvar edição:', error);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData({});
  };

  const renderStatus = (status) => {
    return status ? 
      <FaCheck className="status-check" /> : 
      <FaTimes className="status-times" />;
  };

  const renderEditRow = (avaliacao) => (
    <>
      <td>{avaliacao.number}</td>
      <td>{avaliacao.assignment_group}</td>
      <td>{avaliacao.resolved_by}</td>
      <td>{avaliacao.contract}</td>
      <td>{avaliacao.created_by}</td>
      <td>{new Date(avaliacao.created_at).toLocaleDateString()}</td>
      <td>
        <input
          type="checkbox"
          checked={editData.is_contrato_lancado}
          onChange={() => setEditData({...editData, is_contrato_lancado: !editData.is_contrato_lancado})}
          disabled={true}
        />
      </td>
      <td>
        <input
          type="checkbox"
          checked={editData.is_horas_lancadas}
          onChange={() => setEditData({...editData, is_horas_lancadas: !editData.is_horas_lancadas})}
        />
      </td>
      <td>
        <input
          type="checkbox"
          checked={editData.is_has_met_first_response_target}
          onChange={() => setEditData({...editData, is_has_met_first_response_target: !editData.is_has_met_first_response_target})}
          disabled={true}
        />
      </td>
      <td>
        <input
          type="checkbox"
          checked={editData.is_resolution_target}
          onChange={() => setEditData({...editData, is_resolution_target: !editData.is_resolution_target})}
          disabled={true}
        />
      </td>
      <td>
        <input
          type="checkbox"
          checked={editData.is_atualizaca_logs_correto}
          onChange={() => setEditData({...editData, is_atualizaca_logs_correto: !editData.is_atualizaca_logs_correto})}
        />
      </td>
      <td>
        <input
          type="checkbox"
          checked={editData.is_ticket_encerrado_corretamente}
          onChange={() => setEditData({...editData, is_ticket_encerrado_corretamente: !editData.is_ticket_encerrado_corretamente})}
        />
      </td>
      <td>
        <input
          type="checkbox"
          checked={editData.is_descricao_troubleshooting}
          onChange={() => setEditData({...editData, is_descricao_troubleshooting: !editData.is_descricao_troubleshooting})}
        />
      </td>
      <td>
        <input
          type="checkbox"
          checked={editData.is_cliente_notificado}
          onChange={() => setEditData({...editData, is_cliente_notificado: !editData.is_cliente_notificado})}
        />
      </td>
      <td>
        <input
          type="checkbox"
          checked={editData.is_category_correto}
          onChange={() => setEditData({...editData, is_category_correto: !editData.is_category_correto})}
        />
      </td>
      <td>{`${avaliacao.nota_total}/9`}</td>
      <td>
        <div className="actions-column">
          <button className="save-button" onClick={() => handleSave(avaliacao.id)} title="Salvar">
            <FaCheck />
          </button>
          <button className="cancel-button" onClick={handleCancel} title="Cancelar">
            <FaTimes />
          </button>
        </div>
      </td>
    </>
  );

  return (
    <>
      <div className="tabs-container">
        <div className="tabs">
          {getTabs(isStaffOrGestor).map(tab => (
            <button
              key={tab.id}
              className={`tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'pendentes' ? (
        isStaffOrGestor && <TicketsSorteados />
      ) : (
        <>
          <div className="page-header">
            <div className="page-actions">
              {/* Espaço para botões de ação, caso seja necessário adicionar no futuro */}
            </div>
            
            <div className="search-container">
              <div className="search-wrapper">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Buscar avaliação..."
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
                    <th>Incidente</th>
                    <th>Fila</th>
                    <th>Técnico</th>
                    <th>Contrato</th>
                    <th>Avaliador</th>
                    <th>Data</th>
                    <th>Contrato</th>
                    <th>Horas Lançadas</th>
                    <th>First Response</th>
                    <th>Resolution Target</th>
                    <th>Logs Correto</th>
                    <th>Ticket Encerrado</th>
                    <th>Troubleshooting</th>
                    <th>Cliente Notificado</th>
                    <th>Categoria Correta</th>
                    <th>Nota Total</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={17}>Carregando...</td>
                    </tr>
                  ) : avaliacoes.length === 0 ? (
                    <tr>
                      <td colSpan={17}>Nenhuma avaliação encontrada</td>
                    </tr>
                  ) : (
                    avaliacoes.map((avaliacao) => (
                      <tr key={avaliacao.id}>
                        {editingId === avaliacao.id ? (
                          renderEditRow(avaliacao)
                        ) : (
                          <>
                            <td>{avaliacao.number}</td>
                            <td>{avaliacao.assignment_group}</td>
                            <td>{avaliacao.resolved_by}</td>
                            <td>{avaliacao.contract}</td>
                            <td>{avaliacao.created_by}</td>
                            <td>{new Date(avaliacao.created_at).toLocaleDateString()}</td>
                            <td>{renderStatus(avaliacao.is_contrato_lancado)}</td>
                            <td>{renderStatus(avaliacao.is_horas_lancadas)}</td>
                            <td>{renderStatus(avaliacao.is_has_met_first_response_target)}</td>
                            <td>{renderStatus(avaliacao.is_resolution_target)}</td>
                            <td>{renderStatus(avaliacao.is_atualizaca_logs_correto)}</td>
                            <td>{renderStatus(avaliacao.is_ticket_encerrado_corretamente)}</td>
                            <td>{renderStatus(avaliacao.is_descricao_troubleshooting)}</td>
                            <td>{renderStatus(avaliacao.is_cliente_notificado)}</td>
                            <td>{renderStatus(avaliacao.is_category_correto)}</td>
                            <td>{`${avaliacao.nota_total}/9`}</td>
                            <td>
                              <div className="actions-column">
                                <button 
                                  className="edit-button" 
                                  onClick={() => handleEdit(avaliacao)}
                                  title="Editar avaliação"
                                >
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
      )}
    </>
  );
}

export default AvaliacoesTable;