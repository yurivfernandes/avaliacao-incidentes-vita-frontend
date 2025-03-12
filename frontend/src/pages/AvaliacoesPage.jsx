import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { FaClipboardCheck, FaClock } from 'react-icons/fa';
import Header from '../components/Header/Header';
import AvaliacoesTable from '../components/Avaliacoes/AvaliacoesTable';
import { useAuth } from '../context/AuthContext';
import '../styles/AvaliacoesPage.css';

function AvaliacoesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user: currentUser } = useAuth();
  const isStaffOrGestor = currentUser?.is_staff || currentUser?.is_gestor;
  
  const tabs = isStaffOrGestor 
    ? [
        { id: 'pendentes', label: 'Tickets Pendentes', icon: <FaClock /> },
        { id: 'avaliados', label: 'Tickets Avaliados', icon: <FaClipboardCheck /> }
      ]
    : [
        { id: 'avaliados', label: 'Tickets Avaliados', icon: <FaClipboardCheck /> }
      ];

  const defaultTab = isStaffOrGestor ? 'pendentes' : 'avaliados';
  const activeTab = searchParams.get('tab') || defaultTab;

  const handleTabChange = (tabId) => {
    setSearchParams({ tab: tabId });
  };

  return (
    <div className="avaliacoes-page">
      <Header />
      <main className="avaliacoes-content">
        <div className="tabs-container">
          <div className="tabs">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => handleTabChange(tab.id)}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>
        <AvaliacoesTable activeTab={activeTab} />
      </main>
    </div>
  );
}

export default AvaliacoesPage;
