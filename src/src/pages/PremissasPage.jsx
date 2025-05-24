import React, { useState, useEffect } from 'react';
import Header from '../components/Header/Header';
import PremissasTable from '../components/Premissas/PremissasTable';
import '../styles/TecnicosPage.css'; // Usamos o mesmo CSS da tela de técnicos para manter padrão
import '../styles/PremissasPage.css'; // Mantemos o CSS específico de premissas para ajustes pontuais

const PremissasPage = () => {
  return (
    <div className="tecnicos-page premissas-page"> {/* Adicionamos a classe premissas-page */}
      <Header />
      <main className="tecnicos-content">
        <PremissasTable />
      </main>
    </div>
  );
};

export default PremissasPage;