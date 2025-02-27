import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../components/Header/Header';
import AvaliacoesTable from '../components/Avaliacoes/AvaliacoesTable';
import '../styles/AvaliacoesPage.css';

const AvaliacoesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab') || 'pendentes';
  const [activeTab, setActiveTab] = useState(tabFromUrl);

  useEffect(() => {
    setActiveTab(tabFromUrl);
  }, [tabFromUrl]);

  return (
    <div className="avaliacoes-page">
      <Header />
      <div className="avaliacoes-content">
        <AvaliacoesTable tipo={activeTab} />
      </div>
    </div>
  );
};

export default AvaliacoesPage;
