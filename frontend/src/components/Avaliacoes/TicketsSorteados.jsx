import React, { useState, useEffect } from 'react';
import { FaSearch, FaPlus, FaClock, FaCalendar, FaTimes } from 'react-icons/fa';
import api from '../../services/api';

function TicketsSorteados() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [mesAno, setMesAno] = useState('');

  useEffect(() => {
    fetchTickets();
  }, [currentPage, searchTerm, mesAno]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage,  // Aqui a página já está sendo passada
        mes_ano: mesAno,
      });
      if (searchTerm) params.append('search', searchTerm);

      const response = await api.get(`/dw_analytics/sorted-tickets/?${params}`);
      setTickets(response.data.results);
      setTotalPages(response.data.num_pages);
    } catch (error) {
      console.error('Erro ao buscar tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tickets-sorteados-section">
      <div className="section-header">
        <div className="header-title">
          <FaClock style={{ color: '#670099', fontSize: '1.5rem' }} />
          <h2>Tickets Pendentes de Avaliação</h2>
        </div>
        
        <div className="filters">
          <div className="month-filter-wrapper">
            <FaCalendar className="calendar-icon" />
            <input
              type="month"
              value={mesAno}
              onChange={(e) => setMesAno(e.target.value)}
              className="month-filter"
              placeholder="Selecione um mês"
            />
            {mesAno && (
              <FaTimes
                className="clear-filter"
                onClick={() => setMesAno('')}
                title="Limpar filtro"
              />
            )}
          </div>
          <div className="search-wrapper">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Buscar ticket..."
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
                <th>Técnico</th>
                <th>Fila</th>
                <th>Contrato</th>
                <th>Cliente</th>
                <th>Data de Fechamento</th>
                <th>SLA Atendimento</th>
                <th>SLA Resolução</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9">Carregando...</td>
                </tr>
              ) : (
                tickets.map((ticket) => (
                  <tr key={ticket.incident_number}>
                    <td>{ticket.incident_number}</td>
                    <td>{ticket.resolved_by}</td>
                    <td>{ticket.assignment_group}</td>
                    <td>{ticket.contract}</td>
                    <td>{ticket.company}</td>
                    <td>{new Date(ticket.closed_at).toLocaleDateString()}</td>
                    <td>{ticket.sla_atendimento ? 'Sim' : 'Não'}</td>
                    <td>{ticket.sla_resolucao ? 'Sim' : 'Não'}</td>
                    <td>
                      <button className="add-button" title="Adicionar Avaliação">
                        <FaPlus />
                      </button>
                    </td>
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

// Função auxiliar para gerar os últimos N meses
const generateLastMonths = (count) => {
  const months = [];
  const date = new Date();
  
  for (let i = 0; i < count; i++) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    
    const value = `${year}-${String(month).padStart(2, '0')}`;
    const label = new Intl.DateTimeFormat('pt-BR', { 
      month: 'long', 
      year: 'numeric' 
    }).format(date);
    
    months.unshift({ value, label });
    date.setMonth(date.getMonth() - 1);
  }
  
  return months;
};

export default TicketsSorteados;
