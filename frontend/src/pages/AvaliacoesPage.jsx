import React from 'react';
import Header from '../components/Header/Header';
import AvaliacoesTable from '../components/Avaliacoes/AvaliacoesTable';
import '../styles/TecnicosPage.css';

function AvaliacoesPage() {
  return (
    <div className="tecnicos-page">
      <Header />
      <main className="tecnicos-content">
        <AvaliacoesTable />
      </main>
    </div>
  );
}

export default AvaliacoesPage;
