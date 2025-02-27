import React, { useState, useEffect } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import Header from '../components/Header/Header';
import TecnicosTable from '../components/Tecnicos/TecnicosTable';
import AddUserDropdown from '../components/Tecnicos/AddUserDropdown';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import '../styles/TecnicosPage.css';
import { FaUserPlus, FaSearch } from 'react-icons/fa';

const tabs = [
  { id: 'usuarios', label: 'Usuários' },
  { id: 'assignment_groups', label: 'Assignment Groups' }
];

function TecnicosPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab') || 'usuarios';
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
      // Limpar os dados em caso de erro
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

  const renderTable = () => {
    if (loading) return <div>Carregando...</div>;

    switch (activeTab) {
      case 'assignment_groups':
        return (
          <TecnicosTable 
            type="assignment_groups"
            data={tableData.assignment_groups}
            loading={loading}
            onPageChange={(page) => setCurrentPage(page)}
            totalPages={totalPages.assignment_groups}
            currentPage={currentPage}
            fetchData={(page) => fetchData('assignment_groups', page)}
          />
        );
      case 'usuarios':
        return (
          <TecnicosTable 
            type="usuarios"
            data={tableData.usuarios}
            loading={loading}
            onPageChange={(page) => setCurrentPage(page)}
            totalPages={totalPages.usuarios}
            currentPage={currentPage}
            fetchData={(page) => fetchData('usuarios', page)}
          />
        );
      default:
        return null;
    }
  };

  return (
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
            {activeTab === 'usuarios' && user?.is_staff && (
              <div className="dropdown-wrapper">
                <button className="add-user-button" onClick={() => setShowAddUser(true)}>
                  <FaUserPlus /> Adicionar usuário
                </button>
                {showAddUser && (
                  <AddUserDropdown
                    onClose={() => setShowAddUser(false)}
                    onSuccess={() => handleSuccess('usuarios')}
                  />
                )}
              </div>
            )}
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

        <div className="table-container">
          {renderTable()}
        </div>
      </main>
    </div>
  );
}

export default TecnicosPage;
