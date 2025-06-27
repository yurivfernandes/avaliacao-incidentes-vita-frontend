import React, { useEffect, useState } from 'react';
import '../styles/TecnicosReportPage.css';
import { 
  AreaChart, 
  Area,
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ReferenceLine,
  Cell
} from 'recharts';
import Header from '../components/Header/Header';
import api from '../services/api';
import { FaChartBar, FaTrophy, FaChartLine, FaMedal, FaTicketAlt, FaUser, FaStar } from 'react-icons/fa';
import IndicadorCard from '../components/dashboard/IndicadorCard';
import Select from 'react-select';
import { useAuth } from '../context/AuthContext';
import GenericTable from '../components/GenericTable';  // Corrigindo o caminho de importação

function TecnicosReportPage() {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTecnico, setSelectedTecnico] = useState('todos');
  const [tecnicos, setTecnicos] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('6');  // default 6 meses
  const [queues, setQueues] = useState([]);
  const [selectedQueue, setSelectedQueue] = useState(null);
  const [isQueueSelected, setIsQueueSelected] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(null);

  const [activeRankingTab, setActiveRankingTab] = useState('mensal');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [availableYears, setAvailableYears] = useState([]);

  // Adicionar novos estados para os rankings
  const [rankingMensal, setRankingMensal] = useState([]);
  const [rankingAnual, setRankingAnual] = useState([]);

  const periodos = [
    { value: '2', label: 'Últimos 2 meses' },
    { value: '3', label: 'Últimos 3 meses' },
    { value: '6', label: 'Últimos 6 meses' },
    { value: '12', label: 'Últimos 12 meses' },
    { value: 'atual', label: 'Ano Atual' },
    { value: 'anterior', label: 'Ano Anterior' }
  ];

  const formatarNumero = (num) => {
    if (num === undefined || num === null) return '-';
    return num.toLocaleString('pt-BR');
  };

  // Modificar a função formatarDecimal para não incluir % por padrão
  const formatarDecimal = (num, includeSymbol = false) => {
    if (num === undefined || num === null) return '-';
    return `${Number(num).toFixed(2)}${includeSymbol ? '%' : ''}`;
  };

  const formatMes = (mes) => {
    if (!mes) return '';
    
    // Converte formato "MM/YYYY" para "Mês/YYYY"
    try {
      const [month, year] = mes.split('/');
      const monthNames = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
      ];
      
      return `${monthNames[parseInt(month) - 1]}/${year}`;
    } catch (e) {
      return mes;
    }
  };

  // Buscar filas disponíveis
  const fetchQueues = async () => {
    try {
      const response = await api.get('/dw_analytics/assignment-group/');
      const activeQueues = response.data.results
        ? response.data.results.filter(queue => queue.status)
        : [];
      
      console.log('Filas carregadas:', activeQueues);
      return activeQueues;
    } catch (error) {
      console.error('Erro ao carregar filas:', error);
      return [];
    }
  };

  // Inicialização da página
  useEffect(() => {
    const initializePage = async () => {
      setLoading(true);
      try {
        // Carregar filas
        const availableQueues = await fetchQueues();
        
        if (availableQueues.length > 0) {
          if (user?.assignment_groups?.length > 0) {
            // Usuário tem filas específicas
            const userFilteredQueues = availableQueues.filter(
              queue => user.assignment_groups.some(userQueue => userQueue.id === queue.id)
            );
            
            setQueues(userFilteredQueues);
            
            if (userFilteredQueues.length === 1) {
              // Se só tem uma fila, seleciona automaticamente
              const queueId = userFilteredQueues[0].id;
              setSelectedQueue(queueId);
              setIsQueueSelected(true);
            }
          } else {
            // Usuário não tem filas específicas, usa todas as filas disponíveis
            setQueues(availableQueues);
          }
        } else {
          setError('Nenhuma fila disponível');
        }
      } catch (error) {
        console.error('Erro na inicialização:', error);
        setError('Erro ao carregar dados iniciais');
      } finally {
        setLoading(false);
      }
    };

    initializePage();
  }, [user]);

  // Efeito quando a fila ou período é alterado
  useEffect(() => {
    if (selectedQueue) {
      setIsQueueSelected(true);
      setLoading(true);
      
      fetchData().finally(() => {
        setLoading(false);
      });
    }
  }, [selectedQueue, selectedPeriod]);

  // Buscar dados do relatório
  const fetchData = async () => {
    if (!selectedQueue) return;
    
    try {
      const endDate = new Date();
      let startDate = new Date();

      if (selectedPeriod === 'atual') {
        startDate = new Date(endDate.getFullYear(), 0, 1);
      } else if (selectedPeriod === 'anterior') {
        startDate = new Date(endDate.getFullYear() - 1, 0, 1);
        endDate.setFullYear(endDate.getFullYear() - 1, 11, 31);
      } else {
        startDate.setMonth(startDate.getMonth() - parseInt(selectedPeriod));
      }

      const params = {
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        assignment_group: selectedQueue
      };

      const [notasResponse, rankingMensalRes, rankingAnualRes] = await Promise.all([
        api.get('/avaliacao/notas-por-tecnico/', { params }),
        api.get('/avaliacao/ranking-mensal/', { params }),
        api.get('/avaliacao/ranking-anual/', { params })
      ]);

      if (notasResponse.data && Array.isArray(notasResponse.data)) {
        setData(notasResponse.data);
        
        if (notasResponse.data.length > 0) {
          // Extrair grupos únicos
          const uniqueGroups = Array.from(new Set(notasResponse.data
            .filter(item => item.assignment_group_id && item.assignment_group_nome)
            .map(item => JSON.stringify({ id: item.assignment_group_id, nome: item.assignment_group_nome }))))
            .map(item => JSON.parse(item));
          
          setGroups(uniqueGroups);
          setSelectedGroup(uniqueGroups[0]?.id);
        }
      }

      if (rankingMensalRes.data) {
        setRankingMensal(rankingMensalRes.data);
      }

      if (rankingAnualRes.data) {
        setRankingAnual(rankingAnualRes.data);
        // Atualizar anos disponíveis
        const anos = [...new Set(rankingAnualRes.data.map(item => item.ano))];
        if (anos.length > 0) {
          setAvailableYears(anos.sort((a, b) => b - a));
          setSelectedYear(Number(anos[0])); // Assegurar que é um número
        }
        
        console.log("Ranking anual recebido:", rankingAnualRes.data);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setError('Erro ao carregar os dados');
    }
  };

  const getFilteredData = () => {
    if (!data || !Array.isArray(data) || data.length === 0) return [];

    return data.map(mes => ({
      mes: mes.mes,
      meta: mes.meta_mensal,
      ...mes.tecnicos?.reduce((acc, tecnico) => ({
        ...acc,
        [tecnico.tecnico_nome]: tecnico.nota_media
      }), {})
    }));
  };

  const calcularTotalTickets = () => {
    if (!data?.length) return 0;
    return data[0]?.total_tickets || 0;
  };

  const calcularTotalPontos = () => {
    if (!data?.length) return 0;
    return data[0]?.tecnicos?.reduce((acc, t) => acc + (t.nota_total || 0), 0) || 0;
  };

  // Função ajustada para usar os dados do gráfico
  const calcularPontuacaoPeriodo = () => {
    if (selectedMonth) {
      const mesSelecionado = data.find(mes => mes.mes === selectedMonth);
      if (mesSelecionado?.tecnicos?.length) {
        const somaMedias = mesSelecionado.tecnicos.reduce((acc, tecnico) => acc + (tecnico.nota_media || 0), 0);
        return somaMedias / mesSelecionado.tecnicos.length;
      }
      return 0;
    }

    // Se nenhum mês estiver selecionado, mantém o cálculo original
    const dadosFiltrados = getFilteredData();
    if (!dadosFiltrados || dadosFiltrados.length === 0) return 0;

    let somaMedias = 0;
    let contadorMedias = 0;

    dadosFiltrados.forEach(mes => {
      Object.entries(mes).forEach(([key, value]) => {
        if (!['mes', 'meta'].includes(key)) {
          somaMedias += value || 0;
          contadorMedias++;
        }
      });
    });

    return contadorMedias > 0 ? somaMedias / contadorMedias : 0;
  };

  const calcularPontuacaoUltimoMes = () => {
    if (!data || data.length === 0) return 0;
    
    // Ordena os dados do mais recente para o mais antigo
    const dadosOrdenados = [...data].sort((a, b) => {
      const [mesA, anoA] = a.mes.split('/');
      const [mesB, anoB] = b.mes.split('/');
      return new Date(anoB, mesB - 1) - new Date(anoA, mesA - 1);
    });
    
    // Pega o mês mais recente que tem dados
    const mesRecente = dadosOrdenados[0];
    if (!mesRecente?.tecnicos?.length) return 0;
    
    // Calcula a média do mês mais recente
    const somaMedias = mesRecente.tecnicos.reduce((acc, tecnico) => acc + (tecnico.nota_media || 0), 0);
    return somaMedias / mesRecente.tecnicos.length;
  };

  const calcularPontoCritico = () => {
    if (!data?.length || !data[0]?.tecnicos?.length) return '-';

    const tecnicoCritico = data[0].tecnicos
      .reduce((min, curr) => (curr.nota_media < min.nota_media) ? curr : min);

    return `${tecnicoCritico.tecnico_nome} (${tecnicoCritico.nota_media.toFixed(2)}%)`;
  };

  // Função corrigida para calcular tendência
  const calcularTendencia = (atual, anterior) => {
    if (atual === undefined || anterior === undefined) return null;
    if (atual === 0 && anterior === 0) return 0;
    if (anterior === 0) return 100; // Se anterior era 0 e atual > 0, aumento de 100%
    return ((atual - anterior) / anterior) * 100;
  };

  // Função corrigida para calcular tendência do último mês
  const calcularTendenciaUltimoMes = () => {
    const dadosFiltrados = [...data].sort((a, b) => {
      const [mesA, anoA] = a.mes.split('/');
      const [mesB, anoB] = b.mes.split('/');
      return new Date(anoB, mesB - 1) - new Date(anoA, mesA - 1);
    });

    if (dadosFiltrados.length < 2) return null;

    const mesAtual = dadosFiltrados[0];
    const mesAnterior = dadosFiltrados[1];

    if (!mesAtual?.tecnicos?.length || !mesAnterior?.tecnicos?.length) return null;

    const mediaAtual = mesAtual.tecnicos.reduce((acc, t) => acc + t.nota_media, 0) / mesAtual.tecnicos.length;
    const mediaAnterior = mesAnterior.tecnicos.reduce((acc, t) => acc + t.nota_media, 0) / mesAnterior.tecnicos.length;

    return calcularTendencia(mediaAtual, mediaAnterior);
  };

  // Função corrigida para calcular tendência do período
  const calcularTendenciaPeriodo = () => {
    const dadosFiltrados = [...data].sort((a, b) => {
      const [mesA, anoA] = a.mes.split('/');
      const [mesB, anoB] = b.mes.split('/');
      return new Date(anoB, mesB - 1) - new Date(anoA, mesA - 1);
    });

    if (dadosFiltrados.length < 2) return null;

    const metade = Math.floor(dadosFiltrados.length / 2);
    const periodoRecente = dadosFiltrados.slice(0, metade);
    const periodoAnterior = dadosFiltrados.slice(metade);

    if (!periodoRecente.length || !periodoAnterior.length) return null;

    const mediaRecente = periodoRecente.reduce((acc, mes) => {
      if (!mes.tecnicos?.length) return acc;
      const mediaMes = mes.tecnicos.reduce((sum, t) => sum + t.nota_media, 0) / mes.tecnicos.length;
      return acc + mediaMes;
    }, 0) / periodoRecente.length;

    const mediaAnterior = periodoAnterior.reduce((acc, mes) => {
      if (!mes.tecnicos?.length) return acc;
      const mediaMes = mes.tecnicos.reduce((sum, t) => sum + t.nota_media, 0) / mes.tecnicos.length;
      return acc + mediaMes;
    }, 0) / periodoAnterior.length;

    return calcularTendencia(mediaRecente, mediaAnterior);
  };

  const colors = [
    {
      // Cor: roxo escuro
      gradient: ['rgba(103, 0, 153, 0.8)', 'rgba(103, 0, 153, 0.1)'],
      stroke: 'rgba(103, 0, 153, 1)',
      fill: 'url(#colorGradient1)'
    },
    {
      // Cor: roxo médio
      gradient: ['rgba(140, 20, 190, 0.8)', 'rgba(140, 20, 190, 0.1)'],
      stroke: 'rgba(140, 20, 190, 1)',
      fill: 'url(#colorGradient2)'
    },
    {
      // Cor: azul escuro
      gradient: ['rgba(45, 50, 180, 0.8)', 'rgba(45, 50, 180, 0.1)'],
      stroke: 'rgba(45, 50, 180, 1)',
      fill: 'url(#colorGradient3)'
    },
    {
      // Cor: azul claro
      gradient: ['rgba(0, 120, 215, 0.8)', 'rgba(0, 120, 215, 0.1)'],
      stroke: 'rgba(0, 120, 215, 1)',
      fill: 'url(#colorGradient4)'
    }
  ];

  const getMedalIcon = (posicao, media, meta) => {
    // Só mostra medalha se atingiu a meta
    if (!media || !meta || media < meta) {
      return <span className="ranking-position">{posicao}º</span>;
    }
    
    if (posicao === 1) return <FaMedal color="#FFD700" size={16} />;
    if (posicao === 2) return <FaMedal color="#D3D3D3" size={16} />;
    if (posicao === 3) return <FaMedal color="#CD7F32" size={16} />;
    return <span className="ranking-position">{posicao}º</span>;
  };

  const getColorIndex = (index, totalItems) => {
    if (totalItems <= 1) return 0;
    if (totalItems === 2) return index * 2;
    return index % colors.length;
  };

  const getFilteredRanking = () => {
    if (!rankingMensal || !Array.isArray(rankingMensal) || rankingMensal.length === 0) return [];
    
    const mesesOrdenados = [...rankingMensal].sort((a, b) => {
      const [mesA, anoA] = a.mes.split('/');
      const [mesB, anoB] = b.mes.split('/');
      return new Date(anoB, mesB - 1) - new Date(anoA, mesA - 1);
    });

    const mesSelecionado = selectedMonth 
      ? mesesOrdenados.find(m => m.mes === selectedMonth)
      : mesesOrdenados[0];

    const meta = data[0]?.meta_mensal || 0;
    const tecnicos = mesSelecionado?.tecnicos || [];
    
    return tecnicos.map(tecnico => {
      const percentualMeta = ((tecnico.media / meta) * 100) - 100;
      let alertClass = '';
      
      if (percentualMeta < -10) {
        alertClass = 'dashboard-alert-red';
      } else if (percentualMeta < 0) {
        alertClass = 'dashboard-alert-yellow';
      } else if (percentualMeta >= 0 && !tecnico.meta_atingida) {
        alertClass = 'dashboard-alert-green';
      }
      
      return {
        ...tecnico,
        meta_atingida: tecnico.media >= meta,
        alertClass
      };
    });
  };

  const getFilteredRankingAnual = () => {
    if (!rankingAnual || !Array.isArray(rankingAnual)) return [];
    
    const anoSelecionado = rankingAnual.find(item => Number(item.ano) === Number(selectedYear));
    if (!anoSelecionado) return [];
    
    const meta = data[0]?.meta_mensal || 0;
    const tecnicos = anoSelecionado.tecnicos || [];
    
    return tecnicos.map(tecnico => {
      const percentualMeta = ((tecnico.media / meta) * 100) - 100;
      let alertClass = '';
      
      if (percentualMeta < -10) {
        alertClass = 'dashboard-alert-red';
      } else if (percentualMeta < 0) {
        alertClass = 'dashboard-alert-yellow';
      } else if (percentualMeta >= 0 && !tecnico.meta_atingida) {
        alertClass = 'dashboard-alert-green';
      }
      
      return {
        ...tecnico,
        meta_atingida: tecnico.media >= meta,
        alertClass
      };
    });
  };

  // Função para obter dados do técnico top 1
  const getTopTecnico = () => {
    if (!data?.length || !data[0]?.tecnicos?.length) return { nome: '-', nota: 0 };
    
    const topTecnico = data[0].tecnicos
      .reduce((max, curr) => (curr.nota_media > max.nota_media) ? curr : max);
    
    return {
      nome: topTecnico.tecnico_nome,
      nota: topTecnico.nota_media
    };
  };

  // Função para obter a melhor nota individual
  const getMelhorNota = () => {
    if (!data?.length || !data[0]?.tecnicos?.length) return 0;
    
    return Math.max(...data[0].tecnicos.map(t => t.nota_media || 0));
  };

  // Função para obter dados do gráfico de barras horizontal
  const getBarChartData = () => {
    if (!data?.length || !data[0]?.tecnicos?.length) return [];
    
    return data[0].tecnicos
      .map(tecnico => ({
        nome: tecnico.tecnico_nome.length > 15 
          ? tecnico.tecnico_nome.substring(0, 15) + '...' 
          : tecnico.tecnico_nome,
        nomeCompleto: tecnico.tecnico_nome,
        nota: Number(tecnico.nota_media) || 0
      }))
      .sort((a, b) => b.nota - a.nota)
      .slice(0, 8); // Limita a 8 técnicos para evitar sobrecarga visual
  };

  // Função para obter dados da linha temporal (média mensal da equipe)
  const getLineChartData = () => {
    if (!data || !Array.isArray(data) || data.length === 0) return [];

    return data.map(mes => {
      const tecnicos = mes.tecnicos || [];
      const mediaEquipe = tecnicos.length > 0 
        ? tecnicos.reduce((acc, t) => acc + (Number(t.nota_media) || 0), 0) / tecnicos.length 
        : 0;
      
      return {
        mes: mes.mes,
        mediaEquipe: Number(mediaEquipe.toFixed(2)),
        meta: Number(mes.meta_mensal) || 0
      };
    }).sort((a, b) => {
      const [mesA, anoA] = a.mes.split('/');
      const [mesB, anoB] = b.mes.split('/');
      return new Date(anoA, mesA - 1) - new Date(anoB, mesB - 1);
    });
  };

  // Componente do velocímetro
  const SpeedometerChart = ({ value, meta, max = 100 }) => {
    const safeValue = Number(value) || 0;
    const safeMeta = Number(meta) || 0;
    const percentage = Math.min((safeValue / max) * 100, 100);
    const metaPercentage = Math.min((safeMeta / max) * 100, 100);
    
    // Definir cor baseada na relação com a meta
    let color = '#ff4444'; // Vermelho (abaixo da meta)
    if (safeValue >= safeMeta) {
      color = '#00aa00'; // Verde (atingiu a meta)
    } else if (safeValue >= safeMeta * 0.8) {
      color = '#ffaa00'; // Amarelo (próximo da meta)
    }

    return (
      <div className="speedometer-container">
        <div className="speedometer-chart">
          <svg width="200" height="120" viewBox="0 0 200 120">
            {/* Arco de fundo */}
            <path
              d="M 30 100 A 70 70 0 0 1 170 100"
              fill="none"
              stroke="#e0e0e0"
              strokeWidth="15"
            />
            
            {/* Arco de progresso */}
            <path
              d="M 30 100 A 70 70 0 0 1 170 100"
              fill="none"
              stroke={color}
              strokeWidth="15"
              strokeDasharray={`${percentage * 2.2} 220`}
              strokeLinecap="round"
            />
            
            {/* Marca da meta */}
            {safeMeta > 0 && (
              <line
                x1={30 + (metaPercentage / 100) * 140}
                y1="85"
                x2={30 + (metaPercentage / 100) * 140}
                y2="100"
                stroke="#670099"
                strokeWidth="3"
              />
            )}
            
            {/* Texto do valor */}
            <text x="100" y="75" textAnchor="middle" fontSize="24" fontWeight="bold" fill={color}>
              {safeValue.toFixed(1)}
            </text>
            <text x="100" y="95" textAnchor="middle" fontSize="12" fill="#666">
              Meta: {safeMeta}
            </text>
          </svg>
        </div>
      </div>
    );
  };

  const renderDashboardContent = () => {
    const handleMonthClick = (clickData) => {
      if (clickData && clickData.activeLabel) {
        setSelectedMonth(prevMonth => 
          prevMonth === clickData.activeLabel ? null : clickData.activeLabel
        );
      }
    };

    const clearMonthFilter = () => {
      setSelectedMonth(null);
    };

    // Obter dados do mês selecionado
    const getMesData = () => {
      if (selectedMonth && data.length > 0) {
        return data.find(mes => mes.mes === selectedMonth) || data[0];
      }
      return data[0];
    };

    const mesData = getMesData();

    // Calcular indicadores do mês
    const calcularTotalTicketsSelecionado = () => {
      return mesData?.total_tickets || 0;
    };

    const calcularTotalPontosSelecionado = () => {
      if (!mesData?.tecnicos?.length) return 0;
      return mesData.tecnicos.reduce((acc, t) => acc + (t.nota_total || 0), 0);
    };

    const calcularPontuacaoSelecionada = () => {
      if (!mesData?.tecnicos?.length) return 0;
      const medias = mesData.tecnicos.map(t => t.nota_media);
      return medias.reduce((a, b) => a + b, 0) / medias.length;
    };

    const calcularPontoCriticoSelecionado = () => {
      if (!mesData?.tecnicos?.length) return '-';
      const tecnicoCritico = mesData.tecnicos
        .reduce((min, curr) => (curr.nota_media < min.nota_media) ? curr : min);
      return `${tecnicoCritico.tecnico_nome} (${tecnicoCritico.nota_media.toFixed(2)}%)`;
    };

    if (!isQueueSelected) {
      return (
        <div className="dashboard-content-container">
          <div className="dashboard-report-header">
            <h1 className="dashboard-report-title">
              <FaChartBar className="title-icon" />
              Relatório de Técnicos
            </h1>
          </div>
          <div className="dashboard-filters-container">
            <div className="dashboard-filter-group">
              <label>Selecione uma Fila para continuar</label>
              <Select
                className="react-select-container"
                classNamePrefix="react-select"
                placeholder="Selecione uma fila..."
                onChange={(option) => {
                  setSelectedQueue(option.value);
                }}
                options={queues.map(queue => ({
                  value: queue.id,
                  label: queue.dv_assignment_group
                }))}
              />
            </div>
          </div>
        </div>
      );
    }

    if (loading) {
      return (
        <div className="dashboard-content-container">
          <div className="dashboard-report-header">
            <h1 className="dashboard-report-title">
              <FaChartBar className="title-icon" />
              Relatório de Técnicos
            </h1>
          </div>
          <div className="loading-container">Carregando dados...</div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="dashboard-content-container">
          <div className="dashboard-report-header">
            <h1 className="dashboard-report-title">
              <FaChartBar className="title-icon" />
              Relatório de Técnicos
            </h1>
          </div>
          <div className="error-container">{error}</div>
        </div>
      );
    }

    // Definir as variáveis no escopo correto
    const topTecnico = getTopTecnico();
    const melhorNota = getMelhorNota();
    const barData = getBarChartData();
    const lineData = getLineChartData();
    const mediaGeral = calcularPontuacaoPeriodo();

    return (
      <div className="dashboard-content-container">
        <div className="dashboard-report-header">
          <h1 className="dashboard-report-title">
            <FaChartBar className="title-icon" />
            Relatório de Técnicos
          </h1>
        </div>
        
        <div className="dashboard-filters-container">
          <div className="dashboard-filter-group">
            <label>Fila</label>
            <Select
              className="react-select-container"
              classNamePrefix="react-select"
              placeholder="Selecione a fila..."
              value={queues
                .map(q => ({ value: q.id, label: q.dv_assignment_group }))
                .find(option => option.value === selectedQueue)}
              onChange={(option) => {
                setSelectedQueue(option.value);
                setSelectedTecnico('todos');
                setSelectedGroup(option.value);
              }}
              options={queues.map(queue => ({
                value: queue.id,
                label: queue.dv_assignment_group
              }))}
            />
          </div>

          <div className="dashboard-filter-group">
            <label>Período</label>
            <Select
              className="react-select-container"
              classNamePrefix="react-select"
              value={periodos.find(option => option.value === selectedPeriod)}
              onChange={(option) => setSelectedPeriod(option.value)}
              options={periodos.map(periodo => ({
                value: periodo.value,
                label: periodo.label
              }))}
            />
          </div>
        </div>

        {/* Grid de Cards - 4 cards centralizados */}
        <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', maxWidth: '1200px', margin: '0 auto' }}>
          <IndicadorCard
            icon={FaTicketAlt}
            title="Tickets Avaliados"
            value={formatarNumero(calcularTotalTickets())}
          />
          <IndicadorCard
            icon={FaChartLine}
            title="Meta"
            value={formatarDecimal(data[0]?.meta_mensal || 0)}
            className="meta-card"
          />
          <IndicadorCard
            icon={FaTrophy}
            title="Top 1"
            value={topTecnico.nome}
            // Só mostra a nota se houver nome válido
            subtitle={topTecnico.nome && topTecnico.nome !== '-' ? `${formatarDecimal(topTecnico.nota)}` : ''}
            className={topTecnico.nota >= (data[0]?.meta_mensal || 0) ? 'meta-achieved' : ''}
          />
          <IndicadorCard
            icon={FaStar}
            title="Melhor Nota"
            value={formatarDecimal(melhorNota)}
            className={melhorNota >= (data[0]?.meta_mensal || 0) ? 'meta-achieved' : ''}
          />
        </div>

        {/* Grid de Gráficos - 3 gráficos lado a lado */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '20px', 
          margin: '30px 0',
          minHeight: '350px'
        }}>
          {/* Gráfico de Barras Horizontal */}
          <div style={{ 
            background: 'white', 
            borderRadius: '8px', 
            padding: '20px', 
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)' 
          }}>
            <h3 style={{ textAlign: 'center', marginBottom: '20px', color: '#333' }}>
              Desempenho por Técnico
            </h3>
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={barData}
                  layout="horizontal"
                  margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
                >
                  <XAxis 
                    type="number" 
                    domain={[0, 100]}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    dataKey="nome" 
                    type="category" 
                    width={90}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip 
                    formatter={(value, name, props) => [
                      `${formatarDecimal(value)}`, 
                      'Nota'
                    ]}
                    labelFormatter={(label, payload) => {
                      const item = payload?.[0]?.payload;
                      return item?.nomeCompleto || label;
                    }}
                  />
                  <Bar dataKey="nota" radius={[0, 4, 4, 0]}>
                    {barData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.nota >= (Number(data[0]?.meta_mensal) || 0) ? '#00aa00' : '#ff6b6b'} 
                      />
                    ))}
                  </Bar>
                  {data[0]?.meta_mensal && (
                    <ReferenceLine 
                      x={Number(data[0].meta_mensal)} 
                      stroke="#670099" 
                      strokeDasharray="5 5"
                      strokeWidth={2}
                    />
                  )}
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ 
                height: '300px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: '#666'
              }}>
                Nenhum dado disponível
              </div>
            )}
          </div>

          {/* Velocímetro */}
          <div style={{ 
            background: 'white', 
            borderRadius: '8px', 
            padding: '20px', 
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <h3 style={{ textAlign: 'center', marginBottom: '20px', color: '#333' }}>
              Média Geral
            </h3>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
              <SpeedometerChart 
                value={mediaGeral} 
                meta={data[0]?.meta_mensal || 0} 
              />
            </div>
          </div>

          {/* Gráfico de Linha - Evolução Mensal da Equipe */}
          <div style={{ 
            background: 'white', 
            borderRadius: '8px', 
            padding: '20px', 
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)' 
          }}>
            <h3 style={{ textAlign: 'center', marginBottom: '20px', color: '#333' }}>
              Evolução Mensal da Equipe
            </h3>
            {lineData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart
                  data={lineData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="colorMedia" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#670099" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#670099" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="mes" 
                    tickFormatter={formatMes}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis 
                    domain={[0, 100]} 
                    hide 
                  />
                  <Tooltip 
                    formatter={(value) => [`${formatarDecimal(value)}`, 'Média da Equipe']}
                    labelFormatter={formatMes}
                  />
                  <Area
                    type="monotone"
                    dataKey="mediaEquipe"
                    stroke="#670099"
                    fill="url(#colorMedia)"
                    strokeWidth={2}
                    dot={{ fill: '#FFFFFF', stroke: '#670099', strokeWidth: 2, r: 4 }}
                  />
                  {data[0]?.meta_mensal && (
                    <ReferenceLine 
                      y={Number(data[0].meta_mensal)} 
                      stroke="#670099" 
                      strokeDasharray="5 5"
                      strokeWidth={2}
                      label={{ 
                        value: `Meta: ${data[0].meta_mensal}`,
                        position: 'right',
                        style: { fontSize: '12px' }
                      }}
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ 
                height: '300px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: '#666'
              }}>
                Nenhum dado disponível
              </div>
            )}
          </div>
        </div>

        {/* Tabela de Ranking */}
        <div className="ranking-section">
          <div className="ranking-header">
            {/* Removido o título "Ranking de Técnicos" */}
            <div className="ranking-controls">
              <div className="ranking-tabs">
                <button 
                  className={`ranking-tab ${activeRankingTab === 'mensal' ? 'active' : ''}`}
                  onClick={() => setActiveRankingTab('mensal')}
                >
                  Mensal
                </button>
                <button 
                  className={`ranking-tab ${activeRankingTab === 'anual' ? 'active' : ''}`}
                  onClick={() => setActiveRankingTab('anual')}
                >
                  Anual
                </button>
              </div>

              {activeRankingTab === 'anual' && availableYears.length > 0 && (
                <Select
                  className="year-select-container"
                  classNamePrefix="react-select"
                  value={{ value: selectedYear, label: selectedYear }}
                  onChange={(option) => setSelectedYear(Number(option.value))}
                  options={availableYears.map(year => ({
                    value: year,
                    label: year
                  }))}
                  isSearchable={false}
                />
              )}
            </div>
          </div>

          {activeRankingTab === 'mensal' ? (
            renderRankingTable(getFilteredRanking())
          ) : (
            renderRankingTable(getFilteredRankingAnual())
          )}
        </div>
      </div>
    );
  };

  const renderRankingTable = (rankingData) => {
    const columns = [
      {
        header: 'Analista',
        key: 'tecnico_nome',
        render: (row) => (
          <span className="analista-nome">{row.tecnico_nome}</span>
        )
      },
      {
        header: 'Qtd. Tickets',
        key: 'total_tickets',
        render: (row) => (
          <span className="tickets-qtd">{formatarNumero(row.total_tickets || 0)}</span>
        )
      },
      {
        header: 'Posição',
        key: 'posicao',
        render: (row) => (
          <div className="ranking-position-cell">
            {getMedalIcon(row.posicao, row.media, data[0]?.meta_mensal)}
          </div>
        )
      },
      {
        header: 'Média',
        key: 'media',
        render: (row) => (
          <span className="media-valor">{formatarDecimal(row.media || 0, false)}</span>
        )
      }
    ];

    return (
      <GenericTable
        columns={columns}
        data={rankingData}
        loading={loading}
        currentPage={1}
        totalPages={1}
      />
    );
  };

  return (
    <>
      <Header />
      <div className="dashboard-report-container">
        {renderDashboardContent()}
      </div>
    </>
  );
}

export default TecnicosReportPage;

