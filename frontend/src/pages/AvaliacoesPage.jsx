import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../components/Header/Header';
import AvaliacoesTable from '../components/Avaliacoes/AvaliacoesTable';
import '../styles/AvaliacoesPage.css';

const tabs = [
  { id: 'pendentes', label: 'Tickets Pendentes' },
  { id: 'avaliados', label: 'Tickets Avaliados' }
];

const AvaliacoesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab') || 'pendentes';
  const [activeTab, setActiveTab] = useState(tabFromUrl);

  useEffect(() => {
    setActiveTab(tabFromUrl);
  }, [tabFromUrl]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  return (
    <div className="avaliacoes-page">
      <Header />
      <div className="avaliacoes-content">
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
        <AvaliacoesTable tipo={activeTab} />
      </div>
    </div>
  );
};

export default AvaliacoesPage;
