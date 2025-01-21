import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSignOutAlt, FaKey, FaUser } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/logo_header.svg';
import './../../styles//Header.css';

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <header className="app-header">
      <div className="app-header-content">
        <Link to="/welcome" className="app-logo">
          <img src={logo} alt="Logo" />
        </Link>

        <div className="hamburger" onClick={toggleMenu}>
          <span className={`bar ${menuOpen ? 'active' : ''}`}></span>
          <span className={`bar ${menuOpen ? 'active' : ''}`}></span>
          <span className={`bar ${menuOpen ? 'active' : ''}`}></span>
        </div>

        <nav className={`app-nav ${menuOpen ? 'active' : ''}`}>
          <ul className="app-menu">
            <li className="app-menu-divider" />
            <li className="app-menu-item user-menu">
              <span className="user-name">
                <FaUser />
                <span>{`${user?.first_name || ''} ${user?.last_name || ''}`}</span>
              </span>
              <ul className="user-submenu">
                <li>
                  <Link to="/perfil/senha">
                    <FaKey />
                    <span>Alterar Senha</span>
                  </Link>
                </li>
                <li>
                  <button onClick={handleLogout} className="app-logout">
                    <FaSignOutAlt />
                    <span>Sair</span>
                  </button>
                </li>
              </ul>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Header;
