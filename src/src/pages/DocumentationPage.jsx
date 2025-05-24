import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header/Header';
import '../styles/DocumentationPage.css';

function DocumentationPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.is_staff) {
      navigate('/welcome');
      return;
    }

    const loadDocs = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/docs/', {
          credentials: 'include',
          headers: {
            'Authorization': `Token ${localStorage.getItem('token')}`
          }
        });                const container = document.getElementById('doc-container');        if (container) {          const iframe = document.createElement('iframe');          iframe.src = 'http://localhost:8000/api/docs/';          iframe.style.width = '100%';          iframe.style.height = 'calc(100vh - 64px)';          iframe.style.border = 'none';          iframe.allow = 'same-origin';                    container.innerHTML = '';          container.appendChild(iframe);        }
      } catch (error) {
        console.error('Erro ao carregar documentação:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDocs();
  }, [user]);

  if (loading) {
    return <div>Carregando documentação...</div>;
  }

  return (
    <>
      <Header />
      <div id="doc-container" className="doc-container" />
    </>
  );
}

export default DocumentationPage;
