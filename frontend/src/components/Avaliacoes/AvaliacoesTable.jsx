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

  const handleEdit = (avaliacao) => {
    setEditingId(avaliacao.id);
    const editData = {
      notas_booleanas: avaliacao.notas_booleanas.map(nota => ({
        ...nota,
        valor: nota.valor
      })),
      notas_conversao: avaliacao.notas_conversao.map(nota => ({
        ...nota,
        valor_convertido: nota.valor_convertido
      }))
    };
    setEditData(editData);
  };

  const handleSave = async (avaliacaoId) => {
    try {
      const payload = {
        incident: avaliacaoId,
        criterios: [
          ...editData.notas_booleanas.map(nota => ({
            tipo: 'booleano',
            criterio_id: nota.criterio_id,
            valor: nota.valor
          })),
          ...editData.notas_conversao.map(nota => ({
            tipo: 'conversao',
            criterio_id: nota.criterio_id,
            conversao_id: nota.valor_convertido
          }))
        ]
      };
      
      await api.post('/avaliacao/save/', payload);
      setEditingId(null);
      setEditData({});
      fetchAvaliacoes(currentPage, searchTerm);
    } catch (error) {
      console.error('Erro ao salvar avaliação:', error);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData({});
  };

  const renderStatus = (valor) => {
    return valor ? 
      <FaCheck className="status-check" style={{ color: '#10b981' }} /> : 
      <FaTimes className="status-times" style={{ color: '#ef4444' }} />;
  };

  const renderConversao = (valor) => {
    return `${valor}%`;
  };

  const renderEditCell = (row, column) => {
    if (column.type === 'boolean') {
      const nota = editData.notas_booleanas.find(n => 
        `boolean_${n.criterio_nome}` === column.key
      );
      return (
        <label className="switch">
          <input
            type="checkbox"
            checked={nota?.valor || false}
            onChange={() => {
              const updatedNotas = editData.notas_booleanas.map(n =>
                n.criterio_nome === nota.criterio_nome
                  ? { ...n, valor: !n.valor }
                  : n
              );
              setEditData({ ...editData, notas_booleanas: updatedNotas });
            }}
          />
          <span className="slider round"></span>
        </label>
      );
    }
    
    if (column.type === 'conversao') {
      const nota = editData.notas_conversao.find(n => 
        `conversao_${n.criterio_nome}` === column.key
      );
      const conversoes = criteriosConversao[nota?.criterio_id] || [];
      return (
        <select
          value={nota?.valor_convertido || ''}
          onChange={(e) => {
            const updatedNotas = editData.notas_conversao.map(n =>
              n.criterio_nome === nota.criterio_nome
                ? { ...n, valor_convertido: e.target.value }
                : n
            );
            setEditData({ ...editData, notas_conversao: updatedNotas });
          }}
          className="form-select"
        >
          <option value="">Selecione</option>
          {conversoes.map(conv => (
            <option key={conv.id} value={conv.id}>
              {conv.nome} ({conv.percentual}%)
            </option>
          ))}
        </select>
      );
    }

    return column.render ? column.render(row) : row[column.key];
  };

  const generateColumns = (firstItem) => {
    if (!firstItem) return [];

    const baseColumns = [
      { header: 'Incidente', key: 'number' },
      { header: 'Fila', key: 'assignment_group' },
      { header: 'Técnico', key: 'resolved_by' },
      { 
        header: 'Data', 
        key: 'data_referencia',
        render: (row) => row.data_referencia || '-'
      },
      { header: 'Avaliador', key: 'created_by' },
    ];

    // Adicionar colunas para notas booleanas
    const booleanColumns = (firstItem.notas_booleanas || []).map(nota => ({
      header: nota.criterio_nome,
      key: `boolean_${nota.criterio_nome}`,
      type: 'boolean',
      editable: true,
      render: (row) => {
        const notaItem = row.notas_booleanas.find(n => n.criterio_nome === nota.criterio_nome);
        return renderStatus(notaItem?.valor || false);
      }
    }));

    // Adicionar colunas para notas de conversão
    const conversaoColumns = (firstItem.notas_conversao || []).map(nota => ({
      header: nota.criterio_nome,
      key: `conversao_${nota.criterio_nome}`,
      type: 'conversao',
      editable: true,
      render: (row) => {
        const notaItem = row.notas_conversao.find(n => n.criterio_nome === nota.criterio_nome);
        return renderConversao(notaItem?.valor_convertido || 0);
      }
    }));

    // Adicionar coluna de ações
    const actionsColumn = {
      header: 'Ações',
      key: 'actions',
      render: (row) => (
        <div className="actions-column">
          <button 
            className="edit-button" 
            onClick={() => handleEdit(row)}
            title="Editar avaliação"
          >
            <FaEdit />
          </button>
        </div>
      )
    };

    return [...baseColumns, ...booleanColumns, ...conversaoColumns, actionsColumn];
  };

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
                            {editingId === avaliacao.id && column.editable ? 
                              renderEditCell(avaliacao, column) : 
                              (column.render ? column.render(avaliacao) : avaliacao[column.key] || '-')}
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