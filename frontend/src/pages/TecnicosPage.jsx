import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import Header from '../components/Header/Header';
import TecnicosTable from '../components/Tecnicos/TecnicosTable';
import AddUserDropdown from '../components/Tecnicos/AddUserDropdown';
import AddCompanyDropdown from '../components/Tecnicos/AddCompanyDropdown';
import AddQueueDropdown from '../components/Tecnicos/AddQueueDropdown';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import '../styles/TecnicosPage.css';
import { FaUserPlus, FaListUl } from 'react-icons/fa';

const tabs = [
  { id: 'empresas', label: 'Empresas' },
  { id: 'filas', label: 'Filas de Atendimento' },
  { id: 'usuarios', label: 'Usuários' }
];

function TecnicosPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('usuarios'); // Mudando a aba inicial para 'usuarios'
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
  const [showAddCompany, setShowAddCompany] = useState(false);
  const [showAddQueue, setShowAddQueue] = useState(false);

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
        case 'empresas':
          const responseEmpresas = await api.get(`/cadastro/empresa/?page=${page}`);
          // Ajuste aqui: a API pode estar retornando diretamente o array de empresas
          const empresasData = Array.isArray(responseEmpresas.data) 
            ? responseEmpresas.data 
            : responseEmpresas.data.results;
          
          setTableData(prev => ({ 
            ...prev, 
            empresas: empresasData 
          }));
          
          // Se não houver paginação, assume 1 página
          setTotalPages(prev => ({ 
            ...prev, 
            empresas: responseEmpresas.data.num_pages || 1 
          }));
          break;
        case 'filas':
          const responseFilas = await api.get(`/cadastro/fila-atendimento/?page=${page}`);
          const filasData = Array.isArray(responseFilas.data) 
            ? responseFilas.data 
            : responseFilas.data.results;
          
          setTableData(prev => ({ 
            ...prev, 
            filas: filasData 
          }));
          
          setTotalPages(prev => ({ 
            ...prev, 
            filas: responseFilas.data.num_pages || 1 
          }));
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
    fetchData(activeTab, currentPage);
  }, [activeTab, currentPage]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setCurrentPage(1);
  };

  const handleSuccess = (type) => {
    console.log(`Chamando fetchData após criação de ${type}`);
    fetchData(type, currentPage);
  };

  const renderTable = () => {
    if (loading) return <div>Carregando...</div>;

    switch (activeTab) {
      case 'filas':
        return (
          <TecnicosTable 
            type="filas"
            data={tableData.filas}
            loading={loading}
            onPageChange={(page) => setCurrentPage(page)}
            totalPages={totalPages.filas}
            currentPage={currentPage}
            fetchData={(page) => fetchData('filas', page)}
          />
        );
      case 'empresas':
        return (
          <TecnicosTable 
            type="empresas"
            data={tableData.empresas}
            loading={loading}
            onPageChange={(page) => setCurrentPage(page)}
            totalPages={totalPages.empresas}
            currentPage={currentPage}
            fetchData={(page) => fetchData('empresas', page)}
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

        {activeTab === 'usuarios' && (
          <div className="page-actions">
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
          </div>
        )}

        {activeTab === 'empresas' && (
          <div className="page-actions">
            <div className="dropdown-wrapper">
              <button className="add-company-button" onClick={() => setShowAddCompany(true)}>
                <FaUserPlus /> Adicionar empresa
              </button>
              {showAddCompany && (
                <AddCompanyDropdown
                  onClose={() => setShowAddCompany(false)}
                  onSuccess={() => handleSuccess('empresas')}
                />
              )}
            </div>
          </div>
        )}

        {activeTab === 'filas' && (
          <div className="page-actions">
            <div className="dropdown-wrapper">
              <button className="add-queue-button" onClick={() => setShowAddQueue(true)}>
                <FaListUl /> Adicionar fila
              </button>
              {showAddQueue && (
                <AddQueueDropdown
                  onClose={() => setShowAddQueue(false)}
                  onSuccess={() => handleSuccess('filas')}
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
