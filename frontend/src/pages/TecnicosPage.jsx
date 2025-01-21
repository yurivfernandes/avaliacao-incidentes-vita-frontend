import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import Header from '../components/Header/Header';
import TecnicosTable from '../components/Tecnicos/TecnicosTable';
import AddUserDropdown from '../components/Tecnicos/AddUserDropdown';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import '../styles/TecnicosPage.css';
import { FaUserPlus } from 'react-icons/fa';

const tabs = [
  { id: 'filas', label: 'Filas de Atendimento' },
  { id: 'empresas', label: 'Empresas' },
  { id: 'usuarios', label: 'Usuários' }
];

function TecnicosPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('filas');
  const [tableData, setTableData] = useState({
    filas: [],
    empresas: [],
    usuarios: []
  });
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState({
    filas: 1,
    empresas: 1,
    usuarios: 1
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddUser, setShowAddUser] = useState(false);

  useEffect(() => {
    if (!user?.is_gestor && !user?.is_staff) {
      return <Navigate to="/welcome" replace />;
    }
  }, [user]);

  const fetchData = async (type, page = 1) => {
    setLoading(true);
    try {
      switch (type) {
        case 'usuarios':
          const response = await api.get(`/access/users/?page=${page}`);
          setTableData(prev => ({ ...prev, usuarios: response.data.results }));
          setTotalPages(prev => ({ ...prev, usuarios: response.data.num_pages }));
          break;
        case 'filas':
          // await api.get('/access/filas/');
          break;
        case 'empresas':
          // await api.get('/access/empresas/');
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(activeTab, currentPage);
  }, [activeTab, currentPage]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setCurrentPage(1);
  };

  const handleSuccess = () => {
    console.log('Chamando fetchData após criação do usuário');
    fetchData('usuarios', currentPage);
  };

  const renderTable = () => {
    if (loading) return <div>Carregando...</div>;

    switch (activeTab) {
      case 'filas':
        return <div>Tabela de Filas - Em desenvolvimento</div>;
      case 'empresas':
        return <div>Tabela de Empresas - Em desenvolvimento</div>;
      case 'usuarios':
        return (
          <TecnicosTable 
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

        {activeTab === 'usuarios' && (
          <div className="page-actions">
            <div className="dropdown-wrapper">
              <button className="add-user-button" onClick={() => setShowAddUser(true)}>
                <FaUserPlus /> Adicionar usuário
              </button>
              {showAddUser && (
                <AddUserDropdown
                  onClose={() => setShowAddUser(false)}
                  onSuccess={handleSuccess}
                />
              )}
            </div>
          </div>
        )}

        <div className="table-container">
          {renderTable()}
        </div>
      </main>
    </div>
  );
}

export default TecnicosPage;
