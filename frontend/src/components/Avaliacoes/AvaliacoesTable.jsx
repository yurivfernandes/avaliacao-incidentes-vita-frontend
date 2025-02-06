import React, { useState, useEffect } from 'react';
import { FaEdit, FaCheck, FaTimes, FaSearch, FaClipboardCheck, FaClock } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import '../../styles/AvaliacoesTable.css';
import TicketsSorteados from './TicketsSorteados';

const tabs = [
  { id: 'pendentes', label: 'Tickets Pendentes', icon: <FaClock /> },
  { id: 'avaliados', label: 'Tickets Avaliados', icon: <FaClipboardCheck /> }
];

function AvaliacoesTable() {
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('pendentes');
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  const canEdit = currentUser?.is_staff || currentUser?.is_gestor;

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchAvaliacoes(currentPage, searchTerm);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [currentPage, searchTerm]);

  const fetchAvaliacoes = async (page = 1, search = '') => {
    setLoading(true);
    try {
      let url = `/avaliacoes/?page=${page}`;
      
      if (search.trim()) {
        url += `&search=${search}`;
      }

      const response = await api.get(url);
      setAvaliacoes(response.data.results);
      setTotalPages(response.data.num_pages);
    } catch (error) {
      console.error('Erro ao buscar avaliações:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStatus = (status) => {
    return status ? <FaCheck /> : <FaTimes />;
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'pendentes':
        return <TicketsSorteados />;
      case 'avaliados':
        return (
          <div className="tickets-sorteados-section">
            <div className="section-header">
              <div className="header-title">
                <FaClipboardCheck style={{ color: '#670099', fontSize: '1.5rem' }} />
                <h2>Avaliações Realizadas</h2>
              </div>

              <div className="filters">
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

            <div className="table-container">
              <div className="table-scroll">
                <table className="inventory-table">
                  <thead>
                    <tr>
                      <th>Incidente</th>
                      <th>Fila</th>
                      <th>Técnico</th>
                      <th>Contrato</th>
                      <th>Avaliador</th>
                      <th>Data da Avaliação</th>
                      <th>Contrato</th>
                      <th>Horas Lançadas</th>
                      <th>Met First Response Target</th>
                      <th>Resolution Target</th>
                      <th>Atualização de Logs Correto</th>
                      <th>Ticket Encerrado Corretamente</th>
                      <th>Descrição de Troubleshooting</th>
                      <th>Cliente Notificado</th>
                      <th>Categoria Correta</th>
                      <th>Status</th>
                      <th>Nota Total</th>
                      {canEdit && <th>Ações</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={canEdit ? "18" : "17"}>Carregando...</td>
                      </tr>
                    ) : (
                      avaliacoes.map((avaliacao) => (
                        <tr key={avaliacao.id}>
                          <td>{avaliacao.incident?.number}</td>
                          <td>{avaliacao.assignment_group?.name}</td>
                          <td>{avaliacao.incident?.resolved_by}</td>
                          <td>{avaliacao.incident?.contract}</td>
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
                          <td>{avaliacao.status}</td>
                          <td>{avaliacao.nota_total}/9</td>
                          {canEdit && (
                            <td>
                              <div className="actions-column">
                                <button className="edit-button">
                                  <FaEdit />
                                </button>
                              </div>
                            </td>
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
      default:
        return null;
    }
  };

  return (
    <div className="tecnicos-content">
      <div className="tabs-container">
        <div className="tabs">
          {tabs.map(tab => (
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

      {renderContent()}
    </div>
  );
}

export default AvaliacoesTable;