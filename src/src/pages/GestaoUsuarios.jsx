import React, { useState, useEffect } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { FaUserPlus, FaSearch, FaEdit, FaCheck, FaTimes } from 'react-icons/fa';
import Header from '../components/Header/Header';
import AddUserDropdown from '../components/Tecnicos/AddUserDropdown';
import AddQueueDropdown from '../components/Tecnicos/AddQueueDropdown';
import PasswordResetModal from '../components/Tecnicos/PasswordResetModal';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Select from 'react-select';
import { generateStrongPassword } from '../utils/passwordGenerator';
import '../styles/GenericTable.css';

function TecnicosPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const tabs = [
    { id: 'usuarios', label: 'Usuários' },
    { id: 'assignment_groups', label: 'Filas' }
  ];

  const tabFromUrl = searchParams.get('tab') || 'usuarios'; // Ajustado para 'usuarios' como padrão
  const [activeTab, setActiveTab] = useState(tabFromUrl);
  const [tableData, setTableData] = useState({
    usuarios: [],
    assignment_groups: []
  });
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState({
    usuarios: 1,
    assignment_groups: 1
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddUser, setShowAddUser] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [allAssignmentGroups, setAllAssignmentGroups] = useState([]);
  const [resetPassword, setResetPassword] = useState({ show: false, password: '' });



  // Adicionar função para buscar todas as filas
  const fetchAllAssignmentGroups = async () => {
    try {
      const response = await api.get('/dw_analytics/assignment-group/');
      setAllAssignmentGroups(response.data.results);
    } catch (error) {
      console.error('Erro ao buscar filas:', error);
    }
  };

  // Adicionar função para buscar usuários
  const fetchUsuarios = async () => {
    try {
      const response = await api.get('/access/users/');
      setUsuarios(response.data.results);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    }
  };

  useEffect(() => {

    if (activeTab === 'usuarios') {
      fetchAllAssignmentGroups();
    }
  }, [activeTab]);

  useEffect(() => {
    if (!user?.is_gestor && !user?.is_staff) {
      return <Navigate to="/welcome" replace />;
    }
  }, [user]);

  const fetchData = async (type, page = 1, search = '') => {
    setLoading(true);
    try {
      switch (type) {
        case 'usuarios':
          const response = await api.get(`/access/users/?page=${page}&search=${search}`);
          setTableData(prev => ({ ...prev, usuarios: response.data.results }));
          setTotalPages(prev => ({ ...prev, usuarios: response.data.num_pages }));
          break;
        case 'assignment_groups':
          const responseGroups = await api.get(`/dw_analytics/assignment-group/?page=${page}&search=${search}`);
          setTableData(prev => ({ ...prev, assignment_groups: responseGroups.data.results }));
          setTotalPages(prev => ({ ...prev, assignment_groups: responseGroups.data.num_pages }));
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      setTableData(prev => ({ ...prev, [type]: [] }));
      setTotalPages(prev => ({ ...prev, [type]: 1 }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchData(activeTab, currentPage, searchTerm);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [activeTab, currentPage, searchTerm]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
    setCurrentPage(1);
  };

  const handleSuccess = (type) => {
    console.log(`Chamando fetchData após criação de ${type}`);
    fetchData(type, currentPage);
  };

  // Modifique o handleEdit
  const handleEdit = (row) => {
    const formattedData = {
      ...row,
      assignment_groups: row.assignment_groups || [],
      type: row.is_staff ? 'staff' : row.is_gestor ? 'gestor' : row.is_tecnico ? 'tecnico' : '',
      is_ativo: row.is_ativo,
      status: row.status,
      dv_assignment_group: row.dv_assignment_group
    };
    setEditingId(row.id);
    setEditData(formattedData);
  };

  // Função genérica para renderizar o toggle de status
  const renderStatusToggle = (row, fieldName) => {
    if (editingId === row.id) {
      return (
        <label className="switch">
          <input
            type="checkbox"
            checked={editData[fieldName]}
            onChange={(e) => setEditData({...editData, [fieldName]: e.target.checked})}
          />
          <span className="slider round"></span>
        </label>
      );
    }
    return (
      <span className={row[fieldName] ? 'status-active' : 'status-inactive'}>
        {row[fieldName] ? 'Ativo' : 'Inativo'}
      </span>
    );
  };

  const getColumns = () => {
    switch (activeTab) {
      case 'usuarios':
        return [
          { 
            header: 'Nome Completo', 
            key: 'full_name', 
            width: '40%',
            text_align: 'left',
            render: (row) => (
              editingId === row.id ? (
                <input
                  type="text"
                  value={editData.full_name || ''}
                  onChange={(e) => setEditData({...editData, full_name: e.target.value})}
                  className="edit-input"
                />
              ) : row.full_name
            )
          },
          { 
            header: 'Status', 
            key: 'is_ativo',
            width: '20%',
            text_align: 'center',
            render: (row) => renderStatusToggle(row, 'is_ativo')
          },
          { 
            header: 'Ações', 
            key: 'actions',
            width: '100px',
            text_align: 'center',
            render: (row) => (
              editingId === row.id ? (
                <>
                  <button className="save-button" onClick={() => handleSave(row.id, editData)}>
                    <FaCheck />
                  </button>
                  <button className="cancel-button" onClick={handleCancel}>
                    <FaTimes />
                  </button>
                </>
              ) : (
                <button className="edit-button" onClick={() => handleEdit(row)}>
                  <FaEdit />
                </button>
              )
            )
          }
        ];
      case 'assignment_groups':
        return [
          { 
            header: 'Nome da Fila', 
            key: 'dv_assignment_group', 
            width: '70%',
            text_align: 'left',
            render: (row) => (
              editingId === row.id ? (
                <input
                  type="text"
                  value={editData.dv_assignment_group || ''}
                  onChange={(e) => setEditData({...editData, dv_assignment_group: e.target.value})}
                  className="edit-input"
                />
              ) : row.dv_assignment_group
            )
          },
          { 
            header: 'Status', 
            key: 'status',
            width: '20%',
            text_align: 'center',
            render: (row) => renderStatusToggle(row, 'status')
          },
          { 
            header: 'Ações', 
            key: 'actions',
            width: '100px',
            text_align: 'center',
            render: (row) => (
              editingId === row.id ? (
                <>
                  <button className="save-button" onClick={() => handleSave(row.id, editData)}>
                    <FaCheck />
                  </button>
                  <button className="cancel-button" onClick={handleCancel}>
                    <FaTimes />
                  </button>
                </>
              ) : (
                <button className="edit-button" onClick={() => handleEdit(row)}>
                  <FaEdit />
                </button>
              )
            )
          }
        ];
      default:
        return [];
    }
  };

  // Modifique o handleCancel para limpar os dados corretamente
  const handleCancel = () => {
    setEditingId(null);
    setEditData({});
  };

  // Modifique o handleSave
  const handleSave = async (id, editedData) => {
    try {
      const cleanData = { ...editedData };
      
      switch (activeTab) {
        case 'usuarios':
          await api.patch(`/access/profile/${id}/`, {
            full_name: cleanData.full_name,
            is_ativo: Boolean(cleanData.is_ativo),
            is_staff: cleanData.type === 'staff',
            is_gestor: cleanData.type === 'gestor',
            is_tecnico: cleanData.type === 'tecnico',
            assignment_groups: cleanData.assignment_groups?.map(g => g.id)
          });
          break;
        case 'assignment_groups':
          await api.patch(`/dw_analytics/assignment-group/${id}/`, {
            dv_assignment_group: cleanData.dv_assignment_group,
            status: Boolean(cleanData.status)
          });
          break;
      }
      
      setEditingId(null);
      setEditData({});
      fetchData(activeTab, currentPage);
    } catch (error) {
      console.error('Erro ao atualizar:', error);
    }
  };

  // Substitua a função handleResetPassword existente por esta:
  const handleResetPassword = async (userId) => {
    try {
      const newPassword = generateStrongPassword();
      await api.patch(`/access/profile/${userId}/`, {
        password: newPassword
      });
      
      setResetPassword({ show: true, password: newPassword });
    } catch (error) {
      console.error('Erro ao resetar senha:', error);
      toast.error('Erro ao resetar senha');
    }
  };

  return (
    <>
      <div className="tecnicos-page">
        <Header />
        <main className="tecnicos-content">
          <div className="tabs-container">
            <div className="tabs">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  className={`tab ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => handleTabChange(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="page-header">
            <div className="page-actions">
              <div className="dropdown-wrapper">
                <button className="add-user-button" onClick={() => setShowAddUser(true)}>
                  <FaUserPlus /> Adicionar {activeTab === 'usuarios' ? 'usuário' : 'fila'}
                </button>
                {showAddUser && (
                  activeTab === 'usuarios' ? (
                    <AddUserDropdown
                      onClose={() => setShowAddUser(false)}
                      onSuccess={() => handleSuccess(activeTab)}
                    />
                  ) : (
                    <AddQueueDropdown
                      onClose={() => setShowAddUser(false)}
                      onSuccess={() => handleSuccess(activeTab)}
                    />
                  )
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

          <div className="tecnicos-table-container">
            <div className="tecnicos-table-scroll">
              <table className="tecnicos-table">
                <thead>
                  <tr>
                    {getColumns().map(column => (
                      <th 
                        key={column.key} 
                        style={{ 
                          width: column.width,
                          textAlign: column.text_align
                        }}
                      >
                        {column.header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={getColumns().length}>Carregando...</td>
                    </tr>
                  ) : tableData[activeTab].length === 0 ? (
                    <tr>
                      <td colSpan={getColumns().length}>Nenhum registro encontrado</td>
                    </tr>
                  ) : (
                    tableData[activeTab].map((row) => (
                      <tr key={row.id}>
                        {getColumns().map(column => (
                          <td 
                            key={column.key}
                            style={{ 
                              width: column.width,
                              textAlign: column.text_align
                            }}
                          >
                            {column.render ? column.render(row) : row[column.key] || '-'}
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
                Página {currentPage} de {totalPages[activeTab]}
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
                  disabled={currentPage === totalPages[activeTab]}
                >
                  Próxima
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {resetPassword.show && (
        <PasswordResetModal
          password={resetPassword.password}
          onClose={() => setResetPassword({ show: false, password: '' })}
        />
      )}
    </>
  );
}


export default TecnicosPage;
