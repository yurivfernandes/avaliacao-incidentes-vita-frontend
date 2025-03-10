import React, { useState, useEffect } from 'react';
import { FaSearch, FaCalendarAlt, FaTimes, FaPlus, FaFilter, FaCheck, FaClock } from 'react-icons/fa';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import AddAvaliacaoModal from './AddAvaliacaoModal';
import '../../styles/TecnicosTable.css';

function TicketsSorteados() {
  const { user: currentUser } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [filterActive, setFilterActive] = useState(false);
  const [showAddAvaliacaoModal, setShowAddAvaliacaoModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  useEffect(() => {
    fetchTickets(currentPage, searchTerm);
  }, [currentPage, searchTerm]);

  const fetchTickets = async (page = 1, search = '') => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page,
        page_size: 10,
      });
      
      if (search) {
        params.append('search', search);
      }

      if (filterActive && selectedMonth) {
        params.append('month', selectedMonth);
      }

      if (currentUser?.is_gestor && currentUser?.assignment_groups?.length > 0) {
        currentUser.assignment_groups.forEach(group => {
          params.append('assignment_groups', group.id);
        });
      }

      const response = await api.get(`/dw_analytics/sorted-tickets/?${params}`);
      setTickets(response.data.results || []);
      setTotalPages(response.data.num_pages || 1);
    } catch (error) {
      console.error('Erro ao buscar tickets sorteados:', error);
      setTickets([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAvaliacao = (ticket) => {
    setSelectedTicket(ticket);
    setShowAddAvaliacaoModal(true);
  };

  const handleAvaliacaoSuccess = () => {
    fetchTickets(currentPage, searchTerm);
    setShowAddAvaliacaoModal(false);
    setSelectedTicket(null);
  };

  const applyFilter = () => {
    if (selectedMonth) {
      setFilterActive(true);
      setCurrentPage(1);
      fetchTickets(1, searchTerm);
    }
  };

  const clearFilters = () => {
    setSelectedMonth('');
    setFilterActive(false);
    setCurrentPage(1);
    fetchTickets(1, searchTerm);
  };
  
  // Função para formatar a data
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  // Função para renderizar status de SLA
  const renderSLAStatus = (status) => {
    return status ? (
      <span className="status-active"><FaCheck /> Dentro</span>
    ) : (
      <span className="status-inactive"><FaClock /> Fora</span>
    );
  };

  return (
    <>
      <div className="filters-container">
        <div className="filter-date-container">
          <div className="filter-group">
            <div className="filter-label">Mês:</div>
            <div className="filter-controls">
              <div className="date-filter-wrapper">
                <FaCalendarAlt className="date-icon" />
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="date-filter-input"
                />
                <button 
                  className={`date-filter-button ${filterActive ? 'active' : ''}`} 
                  onClick={applyFilter}
                  disabled={!selectedMonth}
                >
                  <FaFilter /> Filtrar
                </button>
                {filterActive && (
                  <button
                    className="clear-filter-button"
                    onClick={clearFilters}
                    title="Limpar filtros"
                  >
                    <FaTimes /> Limpar
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="search-container">
          <div className="search-wrapper">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Buscar tickets..."
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
                <th>Técnico</th>
                <th>Fila</th>
                <th>Contrato</th>
                <th>Empresa</th>
                <th>Categoria</th>
                <th>Sub-categoria</th>
                <th>Detalhe</th>
                <th>Aberto em</th>
                <th>Fechado em</th>
                <th>SLA Atendimento</th>
                <th>SLA Resolução</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={13}>Carregando...</td>
                </tr>
              ) : tickets.length === 0 ? (
                <tr>
                  <td colSpan={13}>Nenhum ticket sorteado encontrado</td>
                </tr>
              ) : (
                tickets.map((ticket) => (
                  <tr key={ticket.incident_id}>
                    <td className="number-cell">{ticket.incident_number}</td>
                    <td>{ticket.resolved_by}</td>
                    <td>{ticket.assignment_group}</td>
                    <td>{ticket.contract || '-'}</td>
                    <td>{ticket.company}</td>
                    <td>{ticket.categoria_falha}</td>
                    <td>{ticket.sub_categoria_falha}</td>
                    <td>{ticket.dv_u_detalhe_sub_categoria_da_falha || '-'}</td>
                    <td>{formatDate(ticket.opened_at)}</td>
                    <td>{formatDate(ticket.closed_at)}</td>
                    <td>{renderSLAStatus(ticket.sla_atendimento)}</td>
                    <td>{renderSLAStatus(ticket.sla_resolucao)}</td>
                    <td>
                      <div className="actions-column">
                        <button
                          className="simple-add-button"
                          onClick={() => handleOpenAvaliacao(ticket)}
                          title="Adicionar avaliação"
                        >
                          <FaPlus />
                        </button>
                      </div>
                    </td>
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
      
      {showAddAvaliacaoModal && selectedTicket && (
        <AddAvaliacaoModal
          ticket={selectedTicket}
          onClose={() => setShowAddAvaliacaoModal(false)}
          onSuccess={handleAvaliacaoSuccess}
        />
      )}
    </>
  );
}

export default TicketsSorteados;
