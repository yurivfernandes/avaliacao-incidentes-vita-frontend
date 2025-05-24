import React, { useEffect } from 'react';
import Header from '../components/Header/Header_site';
import Footer from '../components/footer/Footer';
import '../styles/Legal.css';

function PrivacyPolicy() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="legal-container">
      <Header />
      <main className="legal-content">
        <h1>Política de Privacidade</h1>
        <div className="legal-section">
          <h2>1. Introdução</h2>
          <p>A GameDesk está comprometida com a proteção de seus dados pessoais. Esta Política de Privacidade explica como coletamos, usamos e protegemos suas informações.</p>
        </div>

        <div className="legal-section">
          <h2>2. Dados que Coletamos</h2>
          <ul>
            <li>Dados de cadastro (nome, e-mail, telefone)</li>
            <li>Dados de uso do sistema</li>
            <li>Métricas de desempenho</li>
            <li>Informações de acesso e segurança</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2>3. Como Utilizamos seus Dados</h2>
          <ul>
            <li>Fornecimento dos serviços contratados</li>
            <li>Melhorias no sistema</li>
            <li>Comunicações sobre o serviço</li>
            <li>Geração de relatórios de desempenho</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2>4. Seus Direitos (LGPD)</h2>
          <ul>
            <li>Acesso aos dados</li>
            <li>Correção de dados incompletos</li>
            <li>Portabilidade dos dados</li>
            <li>Eliminação dos dados</li>
            <li>Revogação do consentimento</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2>5. Contato</h2>
          <p>Para exercer seus direitos ou esclarecer dúvidas, entre em contato com nosso DPO através do e-mail: gamedeskbr@gmail.com</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default PrivacyPolicy;
