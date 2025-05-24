import React, { useEffect } from 'react';
import Header from '../components/Header/Header_site';
import Footer from '../components/footer/Footer';
import '../styles/Legal.css';

function Terms() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="legal-container">
      <Header />
      <main className="legal-content">
        <h1>Termos de Uso</h1>
        <div className="legal-section">
          <h2>1. Aceitação dos Termos</h2>
          <p>Ao acessar e usar o GameDesk, você concorda com estes termos de uso e todas as leis e regulamentos aplicáveis.</p>
        </div>

        <div className="legal-section">
          <h2>2. Descrição do Serviço</h2>
          <p>O GameDesk é uma plataforma de gamificação para ambientes corporativos que oferece:</p>
          <ul>
            <li>Sistema de avaliação de desempenho</li>
            <li>Ranking em tempo real</li>
            <li>Sistema de recompensas</li>
            <li>Relatórios analíticos</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2>3. Responsabilidades do Cliente</h2>
          <ul>
            <li>Manter a confidencialidade das credenciais de acesso</li>
            <li>Usar o sistema de acordo com as leis aplicáveis</li>
            <li>Garantir a precisão das informações fornecidas</li>
            <li>Respeitar os direitos de propriedade intelectual</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2>4. Limitação de Responsabilidade</h2>
          <p>O GameDesk não se responsabiliza por:</p>
          <ul>
            <li>Uso indevido da plataforma</li>
            <li>Perdas ou danos indiretos</li>
            <li>Interrupções temporárias do serviço</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2>5. Alterações dos Termos</h2>
          <p>Reservamo-nos o direito de modificar estes termos a qualquer momento, notificando os usuários sobre mudanças significativas.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default Terms;
