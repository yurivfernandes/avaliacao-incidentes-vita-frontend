import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaCheck, FaTrophy, FaChartLine, FaSmile, FaRocket, FaChartBar, FaUsers, FaGift, FaFileAlt } from 'react-icons/fa';
import Header from '../components/Header/Header_site';
import Footer from '../components/footer/Footer';
import logo from '../assets/logo_login.svg';
import '../styles/LandingPage.css';

function LandingPage() {
  const scrollToContact = () => {
    window.location.href = "https://wa.me/5531987798823?text=Ol%C3%A1%2C%20quero%20saber%20mais%20sobre%20o%20sistema%20GameDesk";
  };

  return (
    <div className="landing-container">
      <Header />
      <main>
        <section className="hero-section">
          <div className="hero-content">
            <img src={logo} alt="GameDesk Logo" className="hero-logo" />
            <p className="hero-subtitle">Transformando o ambiente de trabalho em uma experiência gamificada e produtiva!</p>
            <p className="hero-description">
              Solução ideal para empresas de Helpdesk, Service Desk, Telemarketing e Software Houses 
              que desejam aumentar o engajamento e a produtividade de suas equipes
            </p>
            <Link to="/login" className="cta-button">
              Começar agora <FaArrowRight />
            </Link>
          </div>
        </section>

        <section className="features-section">
          <h2>Funcionalidades</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-header">
                <FaChartBar className="feature-icon" />
                <h3>Avaliação de Desempenho</h3>
              </div>
              <p>Sistema inteligente de avaliação adaptável a diferentes tipos de equipes e métricas</p>
            </div>
            <div className="feature-card">
              <div className="feature-header">
                <FaUsers className="feature-icon" />
                <h3>Ranking em Tempo Real</h3>
              </div>
              <p>Acompanhamento dinâmico do desempenho individual e em equipe</p>
            </div>
            <div className="feature-card">
              <div className="feature-header">
                <FaGift className="feature-icon" />
                <h3>Premiações</h3>
              </div>
              <p>Sistema customizável de recompensas para incentivar a excelência</p>
            </div>
            <div className="feature-card">
              <div className="feature-header">
                <FaFileAlt className="feature-icon" />
                <h3>Relatórios Detalhados</h3>
              </div>
              <p>Métricas e análises adaptadas ao seu modelo de negócio</p>
            </div>
          </div>
        </section>

        <section className="demo-section">
          <h2>Veja como funciona</h2>
          <div className="video-container">
            <iframe
              src="https://www.youtube.com/embed/o1LHpazi-og"
              title="GameDesk Demo"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </section>

        <section className="pricing-section">
          <h2>Planos de Assinatura</h2>
          <div className="pricing-grid">
            <div className="pricing-card">
              <h3>Básico</h3>
              <div className="price">R$ 99/mês</div>
              <ul>
                <li><FaCheck className="check-icon" /> Até 10 técnicos</li>
                <li><FaCheck className="check-icon" /> Avaliações básicas</li>
                <li><FaCheck className="check-icon" /> Ranking mensal</li>
                <li><FaCheck className="check-icon" /> Relatórios básicos</li>
              </ul>
              <button onClick={scrollToContact} className="plan-button">Contratar</button>
            </div>
            <div className="pricing-card featured">
              <h3>Profissional</h3>
              <div className="price">R$ 199/mês</div>
              <ul>
                <li><FaCheck className="check-icon" /> Até 25 técnicos</li>
                <li><FaCheck className="check-icon" /> Avaliações avançadas</li>
                <li><FaCheck className="check-icon" /> Ranking em tempo real</li>
                <li><FaCheck className="check-icon" /> Relatórios detalhados</li>
                <li><FaCheck className="check-icon" /> Suporte prioritário</li>
              </ul>
              <button onClick={scrollToContact} className="plan-button">Contratar</button>
            </div>
            <div className="pricing-card">
              <h3>Enterprise</h3>
              <div className="price">R$ 399/mês</div>
              <ul>
                <li><FaCheck className="check-icon" /> Técnicos ilimitados</li>
                <li><FaCheck className="check-icon" /> Recursos personalizados</li>
                <li><FaCheck className="check-icon" /> API completa</li>
                <li><FaCheck className="check-icon" /> Suporte 24/7</li>
                <li><FaCheck className="check-icon" /> Treinamento da equipe</li>
              </ul>
              <button onClick={scrollToContact} className="plan-button">Contratar</button>
            </div>
          </div>
          <div className="custom-plan">
            <h3>Precisa de um plano sob medida?</h3>
            <p>Entre em contato conosco para desenvolvermos uma solução personalizada para sua empresa.</p>
            <button onClick={scrollToContact} className="contact-button">Falar com um consultor</button>
          </div>
        </section>

        <section className="benefits-section">
          <h2>Por que escolher o GameDesk?</h2>
          <div className="benefits-grid">
            <div className="benefit-card">
              <FaTrophy className="benefit-icon" />
              <h3>Aumento do Engajamento</h3>
              <p>Transforme tarefas diárias em desafios estimulantes, aumentando o engajamento da equipe em até 80%</p>
            </div>
            <div className="benefit-card">
              <FaChartLine className="benefit-icon" />
              <h3>Melhoria na Produtividade</h3>
              <p>Nossos clientes relatam um aumento médio de 35% na produtividade após 3 meses de uso</p>
            </div>
            <div className="benefit-card">
              <FaSmile className="benefit-icon" />
              <h3>Satisfação da Equipe</h3>
              <p>Redução de 45% na rotatividade de funcionários através do reconhecimento contínuo</p>
            </div>
            <div className="benefit-card">
              <FaRocket className="benefit-icon" />
              <h3>Resultados Rápidos</h3>
              <p>Implementação em menos de 24 horas e primeiros resultados visíveis em 2 semanas</p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default LandingPage;
