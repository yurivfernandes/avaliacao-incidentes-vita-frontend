import React from 'react';
import { Link } from 'react-router-dom';
import { FaYoutube, FaInstagram, FaWhatsapp } from 'react-icons/fa';
import logo from '../../assets/logo_login.svg';

function Footer() {
  const handleClick = () => {
    window.scrollTo(0, 0);
  };

  return (
    <footer className="landing-footer">
      <div className="footer-content">
        <div className="footer-grid">
          <div className="footer-column">
            <h4>Empresa</h4>
            <ul>
              <li><Link to="/sobre" onClick={handleClick}>Sobre nós</Link></li>
            </ul>
          </div>
          <div className="footer-column">
            <h4>Produto</h4>
            <ul>
              <li><Link to="/recursos">Recursos</Link></li>
              <li><Link to="/precos">Preços</Link></li>
              <li><Link to="/casos-sucesso">Casos de Sucesso</Link></li>
              <li><Link to="/faq">FAQ</Link></li>
            </ul>
          </div>
          <div className="footer-column">
            <h4>Suporte</h4>
            <ul>
              <li><Link to="/ajuda">Central de Ajuda</Link></li>
              <li><Link to="/documentacao">Documentação</Link></li>
              <li><Link to="/status">Status</Link></li>
              <li><Link to="/contato">Contato</Link></li>
            </ul>
          </div>
          <div className="footer-column">
            <h4>Legal</h4>
            <ul>
              <li><Link to="/privacidade">Privacidade</Link></li>
              <li><Link to="/termos">Termos de Uso</Link></li>
              <li><Link to="/cookies">Cookies</Link></li>
              <li><Link to="/compliance">Compliance</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="footer-logo">
            <img 
              src={logo} 
              alt="Vita Gamify Logo" 
              className="footer-logo-img" 
              style={{ height: '26px', marginBottom: '15px' }} 
            />
            <p>Transformando o ambiente de trabalho em uma experiência gamificada e produtiva!</p>
          </div>
          <div className="footer-social">
            <div className="social-links">
              <a href="https://www.youtube.com/channel/UCvU9v-U31SvGmC_y7OwhNBA" target="_blank" rel="noopener noreferrer">
                <FaYoutube />
              </a>
              <a href="https://instagram.com/techgamify" target="_blank" rel="noopener noreferrer">
                <FaInstagram />
              </a>
              <a href="https://wa.me/5531987798823?text=Ol%C3%A1%2C%20quero%20saber%20mais%20sobre%20o%20sistema%20GameDesk" 
                target="_blank" 
                rel="noopener noreferrer">
                <FaWhatsapp />
              </a>
            </div>
            <p>&copy; 2025 Vita. Todos os direitos reservados.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
