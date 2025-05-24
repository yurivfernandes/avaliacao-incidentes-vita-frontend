import React, { useState, useEffect } from 'react';
import { FaEdit, FaCheck, FaTimes, FaSearch, FaClipboardCheck, FaClock, FaCalendarAlt } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import '../../styles/GenericTable.css';
import TicketsSorteados from './TicketsSorteados';
import EditAvaliacaoModal from './EditAvaliacaoModal';

// Funções auxiliares
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

const renderStatus = (valor) => {
  return valor ? 
    <FaCheck className="status-check" style={{ color: '#10b981' }} /> : 
    <FaTimes className="status-times" style={{ color: '#ef4444' }} />;
};

const renderConversao = (nomeConversao) => {
  return nomeConversao || '-';
};

function AvaliacoesTable({ activeTab }) {
  const { user: currentUser } = useAuth();
  const isStaffOrGestor = currentUser?.is_staff || currentUser?.is_gestor;
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [monthFilter, setMonthFilter] = useState('');
  const [editingAvaliacao, setEditingAvaliacao] = useState(null);
  const [loadingEdit, setLoadingEdit] = useState(false);

  useEffect(() => {
    if (activeTab === 'avaliados') {
      fetchAvaliacoes(currentPage, searchTerm, monthFilter);
    } 
  }, [activeTab, currentPage, searchTerm, monthFilter]);

  const fetchAvaliacoes = async (page = 1, search = '', month = '') => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page });
      if (search.trim()) params.append('search', search);
      if (month) params.append('month', month);
      if (currentUser?.is_gestor && currentUser?.assignment_groups?.length > 0) {
        currentUser.assignment_groups.forEach(group => params.append('assignment_groups', group.id));
      } else if (!currentUser?.is_staff) {
        params.append('resolved_by', currentUser.id);
      }

      const response = await api.get(`/avaliacao/list/?${params}`);

      setAvaliacoes(response.data.results);
      setTotalPages(response.data.num_pages || 1);
    } catch (error) {
      console.error('Erro ao buscar avaliações:', error);
      setAvaliacoes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (avaliacao) => {
    try {
      setLoadingEdit(true);
      const response = await api.get(`/avaliacao/detail/${avaliacao.id}/`);
      const avaliacaoCompleta = response.data;
      
      setEditingAvaliacao({
        id: avaliacao.id, // Adicionar o ID da avaliação
        incident: avaliacao.incident,
        incident_number: avaliacao.number,
        resolved_by: avaliacao.resolved_by,
        assignment_group: avaliacao.assignment_group,
        notas_booleanas: avaliacaoCompleta.notas_booleanas || [],
        notas_conversao: avaliacaoCompleta.notas_conversao || []
      });
    } catch (error) {
      console.error('Erro ao buscar dados da avaliação:', error);
    } finally {
      setLoadingEdit(false);
    }
  };

  const handleModalClose = () => {
    setEditingAvaliacao(null);
  };

  const handleModalSuccess = () => {
    setEditingAvaliacao(null);
    fetchAvaliacoes(currentPage, searchTerm, monthFilter);
  };

  const generateColumns = (firstItem) => {
    if (!firstItem) return [];

    return [
      { header: 'Incidente', key: 'number' },
      { header: 'Fila', key: 'assignment_group' },
      { header: 'Técnico', key: 'resolved_by' },
      { 
        header: 'Data', 
        key: 'data_referencia',
        render: (row) => row.data_referencia || '-'
      },
      // Colunas dinâmicas para notas booleanas
      ...(firstItem.notas_booleanas || []).map(nota => ({
        header: nota.criterio_nome,
        key: `boolean_${nota.criterio_nome}`,
        render: (row) => renderStatus(row.notas_booleanas?.find(n => n.criterio_nome === nota.criterio_nome)?.valor || false)
      })),
      // Colunas dinâmicas para notas de conversão
      ...(firstItem.notas_conversao || []).map(nota => ({
        header: nota.criterio_nome,
        key: `conversao_${nota.criterio_nome}`,
        render: (row) => renderConversao(row.notas_conversao?.find(n => n.criterio_nome === nota.criterio_nome)?.nome_conversao || '-')
      })),
      {
        header: 'Ações',
        key: 'actions',
        render: (row) => (
          <div className="actions-column">
            <button
              className="edit-button"
              onClick={() => handleEdit(row)}
              title="Editar avaliação"
            >
              <FaEdit size={14} />
            </button>
          </div>
        )
      }
    ];
  };

  return (
    <>
      {activeTab === 'pendentes' ? (
        <TicketsSorteados />
      ) : (
        <>
          {!loadingEdit && editingAvaliacao && (
            <EditAvaliacaoModal
              ticket={editingAvaliacao}
              onClose={() => setEditingAvaliacao(null)}
              onSuccess={handleModalSuccess}
            />
          )}
          <div className="filters-container">
            <div className="filter-date-container">
              <div className="filter-group">
                <span className="filter-label">Data Referência:</span>
                <div className="date-filter-wrapper">
                  <FaCalendarAlt className="date-icon" />
                  <input
                    type="month"
                    className="date-filter-input"
                    value={monthFilter}
                    onChange={(e) => setMonthFilter(e.target.value)}
                  />
                  {monthFilter && (
                    <FaTimes
                      className="clear-filter"
                      onClick={() => setMonthFilter('')}
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="search-container" style={{ marginLeft: 'auto' }}>
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
                    {avaliacoes[0] && generateColumns(avaliacoes[0]).map(column => (
                      <th key={column.key}>{column.header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={avaliacoes[0] ? generateColumns(avaliacoes[0]).length : 1}>
                        Carregando...
                      </td>
                    </tr>
                  ) : avaliacoes.length === 0 ? (
                    <tr>
                      <td colSpan={avaliacoes[0] ? generateColumns(avaliacoes[0]).length : 1}>
                        Nenhuma avaliação encontrada
                      </td>
                    </tr>
                  ) : (
                    avaliacoes.map((avaliacao) => (
                      <tr key={avaliacao.id}>
                        {generateColumns(avaliacoes[0]).map(column => (
                          <td key={column.key}>
                            {column.render ? column.render(avaliacao) : avaliacao[column.key] || '-'}
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
        </>
      )}
    </>
  );
}

export default AvaliacoesTable;