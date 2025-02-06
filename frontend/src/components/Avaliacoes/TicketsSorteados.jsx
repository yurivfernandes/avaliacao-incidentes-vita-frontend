import React, { useState, useEffect } from 'react';
import { FaSearch, FaPlus, FaClock, FaCalendar, FaTimes, FaClipboardCheck, FaCheck } from 'react-icons/fa';
import api from '../../services/api';

function TicketsSorteados() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [mesAno, setMesAno] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [avaliacaoData, setAvaliacaoData] = useState({
    is_contrato_lancado: false,
    is_horas_lancadas: false,
    is_has_met_first_response_target: false,
    is_resolution_target: false,
    is_atualizaca_logs_correto: false,
    is_ticket_encerrado_corretamente: false,
    is_descricao_troubleshooting: false,
    is_cliente_notificado: false,
    is_category_correto: false,
  });
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const labelMap = {
    contrato_lancado: 'Contrato Lançado Corretamente',
    horas_lancadas: 'Horas Lançadas Corretamente',
    has_met_first_response_target: 'Meta de Primeiro Atendimento Atingida',
    resolution_target: 'Meta de Resolução Atingida',
    atualizaca_logs_correto: 'Atualização de Logs Realizada Corretamente',
    ticket_encerrado_corretamente: 'Ticket Encerrado Corretamente',
    descricao_troubleshooting: 'Descrição do Troubleshooting Adequada',
    cliente_notificado: 'Cliente Notificado Adequadamente',
    category_correto: 'Categorização Realizada Corretamente'
  };

  useEffect(() => {
    fetchTickets();
  }, [currentPage, searchTerm, mesAno]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage,
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

  const handleAddClick = (ticket) => {
    setActiveDropdown(activeDropdown === ticket.incident_number ? null : ticket.incident_number);
    setSelectedTicket(ticket);
    
    setAvaliacaoData({
      ...Object.fromEntries(
        Object.keys(avaliacaoData).map(key => [key, false])
      ),
      is_contrato_lancado: Boolean(ticket.contract?.trim()),
      is_has_met_first_response_target: ticket.sla_atendimento,
      is_resolution_target: ticket.sla_resolucao,
    });
  };

  const handleInputChange = (e) => {
    const { name, checked } = e.target;
    setAvaliacaoData((prevData) => ({
      ...prevData,
      [name]: checked,
    }));
  };

  const handleSave = async () => {
    try {
      if (!selectedTicket) {
        console.error('Nenhum ticket selecionado');
        return;
      }

      const payload = {
        ...avaliacaoData,
        incident_id: selectedTicket.incident_id
      };

      await api.post('/avaliacao/avaliacoes/', payload);
      
      setActiveDropdown(null);
      setSelectedTicket(null);
      fetchTickets();
    } catch (error) {
      console.error('Erro ao salvar avaliação:', error.response?.data || error);
    }
  };

  const handleCancel = () => {
    setActiveDropdown(null);
    setSelectedTicket(null);
  };

  const handleToggle = (field) => {
    setAvaliacaoData(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const renderSlaStatus = (isWithinSla) => {
    return isWithinSla ? 
      <FaCheck className="status-check" /> : 
      <FaTimes className="status-times" />;
  };

  return (
    <div className="tickets-sorteados-section">
      <div className="section-header">
        <div className="header-title">
          <h2>
            <FaClock />
            Tickets Pendentes de Avaliação
          </h2>
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
                    <td>{renderSlaStatus(ticket.sla_atendimento)}</td>
                    <td>{renderSlaStatus(ticket.sla_resolucao)}</td>
                    <td>
                      <div className="actions-column">
                        <button 
                          className="add-button" 
                          title="Adicionar Avaliação" 
                          onClick={() => handleAddClick(ticket)}
                        >
                          <FaPlus />
                        </button>
                        {activeDropdown === ticket.incident_number && (
                          <div className="dropdown">
                            <div className="dropdown-header">
                              <div className="dropdown-title">
                                <FaClipboardCheck />
                                Avaliação do Incidente {ticket.incident_number}
                              </div>
                              <div className="dropdown-subtitle">
                                Cliente: {ticket.company} | Técnico: {ticket.resolved_by}
                              </div>
                            </div>
                            <div className="dropdown-items-grid">
                              {Object.keys(avaliacaoData).map((key) => {
                                const fieldName = key.replace('is_', '');
                                const isDisabled = [
                                  'is_contrato_lancado',
                                  'is_has_met_first_response_target',
                                  'is_resolution_target'
                                ].includes(key);
                              
                                return (
                                  <div className="dropdown-item" key={key}>
                                    <label style={{ color: isDisabled ? '#94a3b8' : '#1e293b' }}>
                                      {labelMap[fieldName]}
                                    </label>
                                    <div className="toggle-buttons" style={{ opacity: isDisabled ? 0.7 : 1 }}>
                                      <button
                                        className={`toggle-button ${avaliacaoData[key] ? '' : 'active'}`}
                                        onClick={() => !isDisabled && handleToggle(key)}
                                        disabled={isDisabled}
                                      >
                                        Não
                                      </button>
                                      <button
                                        className={`toggle-button ${avaliacaoData[key] ? 'active' : ''}`}
                                        onClick={() => !isDisabled && handleToggle(key)}
                                        disabled={isDisabled}
                                      >
                                        Sim
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                            <div className="dropdown-actions">
                              <button className="cancel-button" onClick={handleCancel}>
                                Cancelar
                              </button>
                              <button className="save-button" onClick={handleSave}>
                                Salvar
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
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
