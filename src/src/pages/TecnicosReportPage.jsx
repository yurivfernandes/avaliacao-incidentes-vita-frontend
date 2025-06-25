import React, { useEffect, useState } from 'react';
import '../styles/TecnicosReportPage.css';
import { 
  AreaChart, 
  Area,
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import Header from '../components/Header/Header';
import api from '../services/api';
import { FaChartBar, FaTrophy, FaChartLine, FaMedal } from 'react-icons/fa';
import IndicadorCard from '../components/dashboard/IndicadorCard';
import Select from 'react-select';
import { useAuth } from '../context/AuthContext';

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

    const tecnicoOptions = tecnicos.map(tecnico => ({
      value: tecnico.id,
      label: tecnico.nome
    }));

    const periodoOptions = periodos.map(periodo => ({
      value: periodo.value,
      label: periodo.label
    }));

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
                setSelectedTecnico('todos'); // Reset seleção do técnico
                setSelectedGroup(option.value); // Atualiza o grupo selecionado
              }}
              options={queues.map(queue => ({
                value: queue.id,
                label: queue.dv_assignment_group
              }))}
            />
          </div>

          <div className="dashboard-filter-group">
            <label>Técnico</label>
            <Select
              className="react-select-container"
              classNamePrefix="react-select"
              isDisabled={!selectedQueue || tecnicoOptions.length === 0} // Desabilita se não houver fila selecionada
              value={tecnicoOptions.find(option => option.value === selectedTecnico) || 
                    { value: 'todos', label: 'Todos os Técnicos' }}
              onChange={(option) => setSelectedTecnico(option.value)}
              options={[{ value: 'todos', label: 'Todos os Técnicos' }, ...tecnicoOptions]}
            />
          </div>

          <div className="dashboard-filter-group">
            <label>Período</label>
            <Select
              className="react-select-container"
              classNamePrefix="react-select"
              value={periodoOptions.find(option => option.value === selectedPeriod)}
              onChange={(option) => setSelectedPeriod(option.value)}
              options={periodoOptions}
            />
          </div>
        </div>

        {/* Indicador de filtro movido para antes dos cards */}
        <div className="active-filter-indicator">
          {selectedMonth ? (
            <>
              <span>Filtrando por: {formatMes(selectedMonth)}</span>
              <button onClick={clearMonthFilter} className="clear-filter-btn">
                Limpar filtro
              </button>
            </>
          ) : null}
        </div>

        <div className="dashboard-grid">
          <IndicadorCard
            icon={FaChartLine}
            title="Meta"
            value={formatarDecimal(mesData?.meta_mensal || 0)}
            className="meta-card"
          />
          <IndicadorCard
            icon={FaChartBar}
            title="Tickets Avaliados"
            value={formatarNumero(calcularTotalTicketsSelecionado())}
          />
          <IndicadorCard
            icon={FaChartBar}
            title="Média Período"
            value={formatarDecimal(calcularPontuacaoPeriodo())}
            className={calcularPontuacaoPeriodo() >= (mesData?.meta_mensal || 0) ? 'meta-achieved' : ''}
          />
          <IndicadorCard
            icon={FaChartBar}
            title="Média Último Mês"
            value={formatarDecimal(calcularPontuacaoUltimoMes())}
            className={calcularPontuacaoUltimoMes() >= (mesData?.meta_mensal || 0) ? 'meta-achieved' : ''}
          />
        </div>

        <div className="dashboard-flex">
          <div className="dashboard-chart-container">
            <h3 className="dashboard-chart-title" style={{ textAlign: 'center' }}>
              Evolução da Média
            </h3>
            <div className="chart-wrapper">
              <div className="chart-outer-container">
                <ResponsiveContainer width="95%" height={360}>
                  <AreaChart 
                    data={getFilteredData()
                      .sort((a, b) => {
                        const [mesA, anoA] = a.mes.split('/');
                        const [mesB, anoB] = b.mes.split('/');
                        return new Date(anoA, mesA - 1) - new Date(anoB, mesB - 1);
                      })} 
                    margin={{ top: 20, right: 40, left: 20, bottom: 20 }}
                    onClick={handleMonthClick}
                  >
                    <defs>
                      {colors.map((color, index) => (
                        <linearGradient
                          key={`gradient-${index}`}
                          id={`colorGradient${index + 1}`}
                          x1="0" y1="0"
                          x2="0" y2="1"
                        >
                          <stop offset="5%" stopColor={color.gradient[0]} stopOpacity={0.8}/>
                          <stop offset="95%" stopColor={color.gradient[1]} stopOpacity={0.1}/>
                        </linearGradient>
                      ))}
                    </defs>
                    
                    <XAxis 
                      dataKey="mes" 
                      tickFormatter={formatMes}
                      style={{ 
                        fontFamily: 'Poppins',
                        fontSize: '12px',
                      }}
                      axisLine={false}
                      tickLine={false}
                      interval={0}
                      padding={{ left: 30, right: 30 }} // Aumentado o padding
                    />
                    <YAxis 
                      hide={true}
                      domain={[0, 100]}
                    />
                    <Tooltip 
                      formatter={(value, name) => [`${formatarDecimal(value)}`, name]}
                      labelFormatter={formatMes}
                    />
                    <Legend 
                      wrapperStyle={{ paddingTop: '20px' }}
                    />
                    {Object.keys(getFilteredData()[0] || {})
                      .filter(key => !['mes', 'meta', 'group_id', 'group_nome'].includes(key) && 
                        !key.includes('_detalhes') && !key.includes('_tendencia'))
                      .sort() // Ordena alfabeticamente
                      .map((tecnico, index, array) => {
                        const colorIndex = getColorIndex(index, array.length);
                        return (
                          <Area
                            key={tecnico}
                            type="monotone"
                            dataKey={tecnico}
                            name={tecnico}
                            stroke={colors[colorIndex].stroke}
                            fill={colors[colorIndex].fill}
                            strokeWidth={2}
                            dot={{ 
                              r: 6,
                              fill: '#FFFFFF',
                              stroke: colors[colorIndex].stroke,
                              strokeWidth: 2.5,
                              strokeOpacity: 1,
                              fillOpacity: 1, // Garante preenchimento sólido
                            }}
                            activeDot={{ 
                              r: 8,
                              fill: '#FFFFFF',
                              stroke: colors[colorIndex].stroke,
                              strokeWidth: 2.5,
                              strokeOpacity: 1,
                              fillOpacity: 1, // Garante preenchimento sólido
                            }}
                            label={props => {
                              const { x, y, value, index: dataIndex } = props;
                              // Só exibe valores em um máximo de 4 séries para evitar sobreposição
                              if (array.length > 4) return null;
                              
                              // Calcular offset para evitar sobreposição de labels
                              const proximosValores = Object.keys(getFilteredData()[dataIndex] || {})
                                .filter(k => !['mes', 'meta', 'group_id', 'group_nome'].includes(k) && 
                                  !k.includes('_detalhes') && !k.includes('_tendencia'))
                                .map(k => ({
                                  valor: getFilteredData()[dataIndex][k],
                                  nome: k
                                }));
                              
                              // Ordenar para determinar posição
                              const valoresOrdenados = [...proximosValores]
                                .sort((a, b) => b.valor - a.valor);
                              
                              // Encontrar a posição do técnico atual
                              const posicao = valoresOrdenados.findIndex(v => v.nome === tecnico);
                              
                              // Ajustar o offset baseado na posição
                              const offsetY = [-25, 25, -45, 45][posicao] || 0;
                              
                              return (
                                <text
                                  x={x}
                                  y={y + offsetY}
                                  fill={colors[colorIndex].stroke}
                                  fontSize={11}
                                  fontWeight="500"
                                  textAnchor="middle"
                                  className="area-chart-label"
                                >
                                  {Math.round(value)}
                                </text>
                              );
                            }}
                          />
                        );
                      })}
                    {/* Adicionar linha de meta com mais espessura */}
                    <ReferenceLine 
                      y={data[0]?.meta_mensal} 
                      stroke="#670099" 
                      strokeDasharray="5 5"
                      strokeWidth={2}
                      label={{ 
                        value: `Meta: ${data[0]?.meta_mensal || 0}`,
                        position: 'right',
                        fill: '#670099',
                        fontWeight: 500
                      }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="dashboard-ranking-container">
            <div className="ranking-header">
              <h3>
                <FaTrophy className="card-icon" />
                Ranking
              </h3>
              <div className="ranking-header-content">
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

            <table className="generic-table">
              <thead>
                <tr>
                  <th>Técnico</th>
                  <th style={{textAlign: 'center'}}>Média</th>
                  <th style={{textAlign: 'center'}}>Pontos</th>
                </tr>
              </thead>
              <tbody>
                {activeRankingTab === 'mensal' ? (
                  // Ranking Mensal
                  getFilteredRanking().map((tecnico, index) => (
                    <tr 
                      key={tecnico.tecnico_id || index} 
                      className={`${tecnico.meta_atingida && tecnico.posicao <= 3 ? `dashboard-top-${tecnico.posicao}` : ''} ${tecnico.alertClass}`}
                    >
                      <td>
                        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                          {getMedalIcon(tecnico.posicao, tecnico.media, data[0]?.meta_mensal)}
                          <span>{tecnico.tecnico_nome}</span>
                        </div>
                      </td>
                      <td style={{textAlign: 'center'}}>
                        {formatarDecimal(tecnico.media || 0, false)}
                      </td>
                      <td style={{textAlign: 'center'}}>
                        {formatarNumero(Math.round(tecnico.total || 0))}
                      </td>
                    </tr>
                  ))
                ) : (
                  // Ranking Anual
                  getFilteredRankingAnual().map((tecnico, index) => (
                    <tr  
                      key={tecnico.tecnico_id || index} 
                      className={`${tecnico.meta_atingida && tecnico.posicao <= 3 ? `dashboard-top-${tecnico.posicao}` : ''} ${tecnico.alertClass}`}
                    >
                      <td>
                        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                          {getMedalIcon(tecnico.posicao, tecnico.media, data[0]?.meta_mensal)}
                          <span>{tecnico.tecnico_nome}</span>
                        </div>
                      </td>
                      <td style={{textAlign: 'center'}}>
                        {formatarDecimal(tecnico.media || 0, false)}
                      </td>
                      <td style={{textAlign: 'center'}}>
                        {formatarNumero(Math.round(tecnico.total || 0))}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
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
