import React from 'react';
import Header from '../components/Header/Header';
import AvaliacoesTable from '../components/Avaliacoes/AvaliacoesTable';
import '../styles/AvaliacoesPage.css';

const AvaliacoesPage = () => {
  return (
    <div className="avaliacoes-page">
      <Header />
      <div className="avaliacoes-content">
        <AvaliacoesTable />
      </div>
    </div>
  );
};

export default AvaliacoesPage;
