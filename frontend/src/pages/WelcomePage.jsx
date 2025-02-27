import React, { useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header/Header';
import '../styles/WelcomePage.css';
import { 
  FaUserCog, 
  FaChartBar,
  FaBook,
  FaUsers,
  FaUser,  // Adicionando o import que faltava
  FaReact,
  FaPython,
  FaFileAlt,
  FaTicketAlt,
  FaListAlt,
  FaHeadset,
  FaClipboardList,
} from 'react-icons/fa';
import api from '../services/api'; // Importar o serviço de API

function WelcomePage() {
  const { user } = useAuth();

  useEffect(() => {
    document.title = 'Avaliação de Incidentes | Home';
  }, []);

  const handleDocClick = (e, path) => {
    e.preventDefault();
    window.open(`${api.defaults.baseURL}/docs/`, '_blank'); // Usar o serviço de API
  };

  const cards = [
    ...(user?.is_staff || user?.is_gestor ? [{
      title: 'Gestão de Usuários',
      description: 'Gerencie a equipe técnica',
      active: true,
      icon: <FaUsers size={32} />,
      subItems: [
        { 
          name: 'Usuários', 
          icon: <FaUser size={16} />, 
          path: '/gestao-usuarios?tab=usuarios'
        },
        { 
          name: 'Assignment Groups', 
          icon: <FaUsers size={16} />, 
          path: '/gestao-usuarios?tab=assignment_groups'
        }
      ]
    }] : []),
    ...(user?.is_staff || user?.is_gestor ? [{
      title: 'Premissas',
      description: 'Edite as premissas do sistema',
      active: true,
      icon: <FaClipboardList size={32} />,
      subItems: [
        { 
          name: 'Editar Premissas', 
          icon: <FaClipboardList size={16} />, 
          path: '/premissas/'
        }
      ]
    }] : []),
    {
      title: 'Avaliação de Incidentes',
      description: 'Realize avaliações de incidentes',
      active: true,
      icon: <FaHeadset size={32} />,
      subItems: [
        { 
          name: 'Tickets Pendentes', 
          icon: <FaTicketAlt size={16} />, 
          path: '/avaliacoes?tab=pendentes'
        },
        { 
          name: 'Tickets Avaliados', 
          icon: <FaListAlt size={16} />, 
          path: '/avaliacoes?tab=avaliados'
        }
      ]
    },
    {
      title: 'Relatórios',
      description: 'Acesse relatórios detalhados e estatísticas',
      active: true,
      icon: <FaChartBar size={32} />, // Alterado de FaChartPie para FaChartBar
      subItems: [
        {
          name: 'Técnicos',
          icon: <FaUsers size={16} />,
          path: '/relatorios/tecnicos'
        },
        {
          name: 'Equipes',
          icon: <FaUserCog size={16} />,
          path: '/relatorios/equipes'
        }
      ]
    },
    {
      title: 'Documentação',
      description: 'Acesse as documentações disponíveis do sistema',
      active: user?.is_staff || false,
      icon: <FaBook size={32} />,
      subItems: [
        { 
          name: 'Documentação', 
          icon: <FaBook size={16} />, 
          path: '#',  // mudado para '#' já que vamos usar handleDocClick
        },
        { 
          name: 'Manual do Usuário', 
          icon: <FaFileAlt size={16} />, 
          path: '/documentation/manual'
        },
        { 
          name: 'Backend', 
          icon: <FaPython size={16} />, 
          path: '/documentation/backend'
        },
        { 
          name: 'Frontend', 
          icon: <FaReact size={16} />, 
          path: '/documentation/frontend'
        }
      ]
    }
  ];

  return (
    <>
      <Header />
      <div className="welcome-container">
        <div className="background-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
        <header className="welcome-header">
          <h1>Bem-vindo ao Sistema de Análise de Incidentes{user?.first_name ? `, ${user.first_name}` : ''}!</h1>
          <p className="welcome-subtitle">
            Selecione uma das opções abaixo para começar sua jornada:
          </p>
        </header>
        
        <main className="welcome-cards-grid">
          {cards.map((card, index) => (
            <div key={index} className={`welcome-card ${!card.active ? 'disabled' : ''}`}>
              <div className="welcome-card-content">
                <div className="welcome-card-header">
                  <div className="welcome-card-icon">{card.icon}</div>
                  <h2>{card.title}</h2>
                </div>
                <p>{card.description}</p>
                {card.subItems && (
                  <ul className="sub-items">
                    {card.subItems.map((item, i) => (
                      <li key={i}>
                        {card.title === 'Documentação' ? (
                          <a 
                            href="#"
                            onClick={handleDocClick}
                            rel="noopener noreferrer"
                          >
                            <span className="sub-item-icon">{item.icon}</span>
                            {item.name}
                          </a>
                        ) : (
                          <Link to={item.path}>
                            <span className="sub-item-icon">{item.icon}</span>
                            {item.name}
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </main>
      </div>
    </>
  );
}

export default WelcomePage;
