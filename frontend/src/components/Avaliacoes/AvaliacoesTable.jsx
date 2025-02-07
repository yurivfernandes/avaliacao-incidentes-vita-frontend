import React, { useState, useEffect } from 'react';
import { FaEdit, FaCheck, FaTimes, FaSearch, FaClipboardCheck, FaClock } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import '../../styles/AvaliacoesTable.css';
import TicketsSorteados from './TicketsSorteados';

// Modifique a definição das tabs para ser dinâmica baseada nas permissões
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
  // Modifique o estado inicial do activeTab baseado nas permissões
  const [activeTab, setActiveTab] = useState(isStaffOrGestor ? 'pendentes' : 'avaliados');
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingAvaliacao, setEditingAvaliacao] = useState(null);
  const [editData, setEditData] = useState(null);

  const canEdit = currentUser?.is_staff || currentUser?.is_gestor;

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

      // Se for gestor, adicionar filtro de fila (corrigido para usar assignment_groups)
      if (currentUser?.is_gestor && currentUser?.assignment_groups?.length > 0) {
        currentUser.assignment_groups.forEach(group => {
          params.append('assignment_groups', group.id);
        });
      }
      // Se for técnico, adicionar filtro por ID do usuário
      else if (!currentUser?.is_staff) {
        params.append('resolved_by', currentUser.id);
      }

      const response = await api.get(`/avaliacao/avaliacoes/?${params}`);
      setAvaliacoes(response.data.results);
      setTotalPages(Math.ceil(response.data.count / 10)); // Assumindo 10 itens por página
    } catch (error) {
      console.error('Erro ao buscar avaliações:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (avaliacao) => {
    setEditingAvaliacao(avaliacao.id);
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

  const handleToggleEdit = (field) => {
    const isDisabled = [
      'is_contrato_lancado',
      'is_has_met_first_response_target',
      'is_resolution_target'
    ].includes(field);

    if (!isDisabled) {
      setEditData(prev => ({
        ...prev,
        [field]: !prev[field]
      }));
    }
  };

  const handleSaveEdit = async () => {
    try {
      await api.patch(`/avaliacao/avaliacoes/${editingAvaliacao}/`, editData);
      setEditingAvaliacao(null);
      setEditData(null);
      fetchAvaliacoes(currentPage, searchTerm);
    } catch (error) {
      console.error('Erro ao salvar edição:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingAvaliacao(null);
    setEditData(null);
  };

  const renderStatus = (status) => {
    return status ? 
      <FaCheck className="status-check" /> : 
      <FaTimes className="status-times" />;
  };

  // No renderContent, adicione verificação de permissão
  const renderContent = () => {
    switch (activeTab) {
      case 'pendentes':
        return isStaffOrGestor ? <TicketsSorteados /> : null;
      case 'avaliados':
        return (
          <div className="tickets-sorteados-section">
            <div className="section-header">
              <div className="header-title">
                <h2>
                  <FaClipboardCheck />
                  Avaliações Realizadas
                </h2>
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
                      <th>Nota Total</th>
                      {canEdit && <th>Ações</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={canEdit ? "17" : "16"}>Carregando...</td>
                      </tr>
                    ) : avaliacoes.length === 0 ? (
                      <tr>
                        <td colSpan={canEdit ? "17" : "16"}>Nenhuma avaliação encontrada</td>
                      </tr>
                    ) : (
                      avaliacoes.map((avaliacao) => (
                        <tr key={avaliacao.id}>
                          <td>{avaliacao.incident?.number}</td>
                          <td>{avaliacao.incident?.assignment_group}</td>
                          <td>{avaliacao.incident?.resolved_by}</td>
                          <td>{avaliacao.incident?.contract}</td>
                          <td>{avaliacao.created_by}</td>
                          <td>{new Date(avaliacao.created_at).toLocaleDateString()}</td>
                          {editingAvaliacao === avaliacao.id ? (
                            // Modo de edição
                            Object.keys(editData).map((key) => {
                              const isDisabled = [
                                'is_contrato_lancado',
                                'is_has_met_first_response_target',
                                'is_resolution_target'
                              ].includes(key);
                              
                              if (key.startsWith('is_')) {
                                return (
                                  <td key={key}>
                                    <div className="toggle-buttons" style={{ opacity: isDisabled ? 0.7 : 1 }}>
                                      <button
                                        className={`toggle-button ${!editData[key] ? 'active' : ''}`}
                                        onClick={() => !isDisabled && handleToggleEdit(key)}
                                        disabled={isDisabled}
                                      >
                                        Não
                                      </button>
                                      <button
                                        className={`toggle-button ${editData[key] ? 'active' : ''}`}
                                        onClick={() => !isDisabled && handleToggleEdit(key)}
                                        disabled={isDisabled}
                                      >
                                        Sim
                                      </button>
                                    </div>
                                  </td>
                                );
                              }
                              return null;
                            })
                          ) : (
                            <>
                              <td>{renderStatus(avaliacao.is_contrato_lancado)}</td>
                              <td>{renderStatus(avaliacao.is_horas_lancadas)}</td>
                              <td>{renderStatus(avaliacao.is_has_met_first_response_target)}</td>
                              <td>{renderStatus(avaliacao.is_resolution_target)}</td>
                              <td>{renderStatus(avaliacao.is_atualizaca_logs_correto)}</td>
                              <td>{renderStatus(avaliacao.is_ticket_encerrado_corretamente)}</td>
                              <td>{renderStatus(avaliacao.is_descricao_troubleshooting)}</td>
                              <td>{renderStatus(avaliacao.is_cliente_notificado)}</td>
                              <td>{renderStatus(avaliacao.is_category_correto)}</td>
                              <td>{avaliacao.nota_total}/9</td>
                            </>
                          )}
                          {canEdit && (
                            <td>
                              <div className="actions-column">
                                {editingAvaliacao === avaliacao.id ? (
                                  <>
                                    <button className="save-button" onClick={handleSaveEdit}>
                                      <FaCheck />
                                    </button>
                                    <button className="cancel-button" onClick={handleCancelEdit}>
                                      <FaTimes />
                                    </button>
                                  </>
                                ) : (
                                  <button 
                                    className="edit-button"
                                    onClick={() => handleEdit(avaliacao)}
                                  >
                                    <FaEdit />
                                  </button>
                                )}
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

      {renderContent()}
    </div>
  );
}

export default AvaliacoesTable;