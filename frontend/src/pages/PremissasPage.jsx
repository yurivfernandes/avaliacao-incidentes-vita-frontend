import React from 'react';
import Header from '../components/Header/Header';
import PremissasTable from '../components/Premissas/PremissasTable';
import '../styles/PremissasPage.css';

const PremissasPage = () => {
  return (
    <div className="premissas-page">
      <Header />
      <div className="premissas-content">
        <PremissasTable />
      </div>
    </div>
  );
};

export default PremissasPage; 