import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaYoutube, FaInstagram, FaWhatsapp, FaSignInAlt } from 'react-icons/fa';
import logo from '../../assets/logo_login.svg';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMenuOpen && !event.target.closest('.landing-nav') && !event.target.closest('.mobile-menu-button')) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMenuOpen]);

  // Fechar menu ao redimensionar a tela
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMenuOpen]);

  const scrollToContact = () => {
    window.location.href = "https://wa.me/5531987798823?text=Ol%C3%A1%2C%20quero%20saber%20mais%20sobre%20o%20sistema%20GameDesk";
  };

  return (
    <header className="landing-header">
      <div className="header-content">
        <Link to="/">
          <img src={logo} alt="GameDesk Logo" className="landing-logo" style={{ height: '26px' }} />
        </Link>
        
        <div className={`landing-nav ${isMenuOpen ? 'mobile-open' : ''}`}>
          <div className="nav-links">
            <a href="https://www.youtube.com/@yurivfernandes" 
              target="_blank" 
              rel="noopener noreferrer"
              className="nav-icon">
              <FaYoutube />
            </a>
            <a href="https://instagram.com/gamedesk.br" 
              target="_blank" 
              rel="noopener noreferrer"
              className="nav-icon">
              <FaInstagram />
            </a>
            <a href="https://wa.me/5531987798823?text=Ol%C3%A1%2C%20quero%20saber%20mais%20sobre%20o%20sistema%20GameDesk"
              target="_blank"
              rel="noopener noreferrer"
              className="nav-icon">
              <FaWhatsapp />
            </a>
            <Link to="/login" className="login-link mobile-login">
              <FaSignInAlt />
              Entrar
            </Link>
          </div>
        </div>
        <button 
          className={`mobile-menu-button ${isMenuOpen ? 'active' : ''}`} 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </header>
  );
}

export default Header;
