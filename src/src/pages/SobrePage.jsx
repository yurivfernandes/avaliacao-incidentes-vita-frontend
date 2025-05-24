import React, { useEffect } from 'react';
import { FaGithub, FaGlobe, FaCode, FaLightbulb, FaHandshake, FaLinkedin, FaWhatsapp } from 'react-icons/fa';
import Header from '../components/Header/Header_site';
import Footer from '../components/footer/Footer';
import '../styles/SobrePage.css';

function SobrePage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="landing-container">
      <Header />

      <main className="sobre-main">
        <section className="hero-section sobre-hero">
          <div className="sobre-description">
            <h1>Nossa História</h1>
            <p className="sobre-description">
              Transformando experiências através da tecnologia e inovação
            </p>
          </div>
        </section>

        <section className="sobre-content">
          <div className="mission-cards">
            <div className="mission-card">
              <FaLightbulb className="mission-icon" />
              <h3>Visão</h3>
              <p>Revolucionar a forma como as empresas gerenciam e motivam suas equipes técnicas, tornando o ambiente de trabalho mais engajador e produtivo.</p>
            </div>
            <div className="mission-card">
              <FaCode className="mission-icon" />
              <h3>Tecnologia</h3>
              <p>Desenvolvido com as mais modernas tecnologias, o GameDesk é uma solução robusta e escalável, adaptável às necessidades específicas de cada empresa.</p>
            </div>
            <div className="mission-card">
              <FaHandshake className="mission-icon" />
              <h3>Compromisso</h3>
              <p>Nosso compromisso é entregar uma ferramenta que realmente faça a diferença na gestão e motivação das equipes técnicas.</p>
            </div>
          </div>

          <div className="developer-section">
            <h2>Desenvolvedor</h2>
            <div className="developer-content">
              <div className="developer-info">
                <h3>Yuri Viana Fernandes</h3>
                <p>Analista de Dados Senior com mais de uma década de experiência em Service Desk e desenvolvimento de software. Especialista em criar soluções que transformam ambientes corporativos em espaços mais produtivos e engajadores.</p>
                <p>O GameDesk nasceu da observação direta das necessidades reais de equipes técnicas, combinando gamificação com gestão eficiente de desempenho.</p>
              </div>
              <div className="developer-social">
                <h4>Conecte-se</h4>
                <div className="social-links">
                  <a href="https://github.com/yurivfernandes" target="_blank" rel="noopener noreferrer" className="social-button">
                    <FaGithub /> GitHub
                  </a>
                  <a href="https://www.linkedin.com/in/yurianalistabi/" target="_blank" rel="noopener noreferrer" className="social-button">
                    <FaLinkedin /> LinkedIn
                  </a>
                  <a href="https://yurivf.com.br" target="_blank" rel="noopener noreferrer" className="social-button">
                    <FaGlobe /> Website
                  </a>
                  <a href="https://wa.me/5531987798823?text=Ol%C3%A1%2C%20Gostaria%20de%20conversar%20sobre%20parcerias%20ou%20desenvolvimento" 
                     target="_blank" 
                     rel="noopener noreferrer" 
                     className="social-button">
                    <FaWhatsapp /> WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default SobrePage;
