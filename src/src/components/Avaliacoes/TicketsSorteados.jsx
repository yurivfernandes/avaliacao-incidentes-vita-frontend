import React, { useState, useEffect } from 'react';
import { FaSearch, FaCalendarAlt, FaTimes, FaPlus, FaFilter, FaCheck, FaClock } from 'react-icons/fa';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import AddAvaliacaoModal from './AddAvaliacaoModal';
import '../../styles/GenericTable.css';

const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('pt-BR');
};

const renderSLAStatus = (status) => {
  return status ? 
    <FaCheck style={{ color: '#10b981' }} /> : 
    <FaTimes style={{ color: '#ef4444' }} />;
};

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

  const generateColumns = (firstItem) => {
    if (!firstItem) return [];

    return [
      { header: 'Incidente', key: 'incident_number' },
      { header: 'Técnico', key: 'resolved_by' },
      { header: 'Fila', key: 'assignment_group' },
      { header: 'Aberto em', key: 'opened_at', render: (row) => formatDate(row.opened_at) },
      { header: 'Fechado em', key: 'closed_at', render: (row) => formatDate(row.closed_at) },
      {
        header: 'SLA Atendimento', 
        key: 'sla_atendimento',
        render: (row) => renderSLAStatus(row.sla_atendimento)
      },
      { header: 'Ações', key: 'actions' }
    ];
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
                {generateColumns(tickets[0]).map(column => (
                  <th key={column.key}>{column.header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8}>Carregando...</td>
                </tr>
              ) : tickets.length === 0 ? (
                <tr>
                  <td colSpan={8}>Nenhum ticket sorteado encontrado</td>
                </tr>
              ) : (
                tickets.map((ticket) => (
                  <tr key={ticket.incident_id}>
                    {generateColumns(tickets[0]).map(column => (
                      <td key={column.key}>
                        {column.key === 'actions' ? (
                          <div className="actions-column">
                            <button
                              className="simple-add-button"
                              onClick={() => handleOpenAvaliacao(ticket)}
                              title="Adicionar avaliação"
                            >
                              <FaPlus />
                            </button>
                          </div>
                        ) : (
                          column.render ? column.render(ticket) : ticket[column.key]
                        )}
                      </td>
                    ))}
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
