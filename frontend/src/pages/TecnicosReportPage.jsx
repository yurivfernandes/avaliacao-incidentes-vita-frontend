import React, { useEffect, useState } from 'react';
import '../styles/TecnicosReportPage.css';
import { 
  AreaChart, 
  Area,
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import Header from '../components/Header/Header';
import api from '../services/api';
import { FaChartBar, FaTrophy, FaExclamationTriangle, FaChartLine, FaMedal } from 'react-icons/fa';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import IndicadorCard, { getTendenciaIcon } from '../components/dashboard/IndicadorCard';
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
  const [dashboardData, setDashboardData] = useState(null);
  const [queues, setQueues] = useState([]);
  const [selectedQueue, setSelectedQueue] = useState(null);
  const [userQueues, setUserQueues] = useState([]);
  const [isQueueSelected, setIsQueueSelected] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(null);

  const periodos = [
    { value: '2', label: 'Últimos 2 meses' },
    { value: '3', label: 'Últimos 3 meses' },
    { value: '6', label: 'Últimos 6 meses' },
    { value: '12', label: 'Últimos 12 meses' },
    { value: 'atual', label: 'Ano Atual' },
    { value: 'anterior', label: 'Ano Anterior' }
  ];

  // Nova paleta de cores mais contrastante (apenas tons de roxo, azul e verde petróleo)
  const colors = [
    { 
      stroke: '#6b3ca4', // Roxo escuro
      fill: 'url(#colorGradient1)',
      gradient: ['rgba(107, 60, 164, 0.3)', 'rgba(107, 60, 164, 0)']
    },
    { 
      stroke: '#2d6a4f', // Verde petróleo escuro
      fill: 'url(#colorGradient2)',
      gradient: ['rgba(45, 106, 79, 0.3)', 'rgba(45, 106, 79, 0)']
    },
    { 
      stroke: '#0353a4', // Azul escuro
      fill: 'url(#colorGradient3)',
      gradient: ['rgba(3, 83, 164, 0.3)', 'rgba(3, 83, 164, 0)']
    }
  ];

  // Função para distribuir cores garantindo máximo contraste mesmo com poucos itens
  const getColorIndex = (index, totalItems) => {
    if (totalItems <= 1) return 0;
    if (totalItems === 2) return index * 2; // Garante que use roxo e verde petróleo
    // Para 3 ou mais, alterna entre as cores disponíveis
    return index % colors.length;
  };

  // Função para formatar data
  const formatMes = (mesAno) => {
    const [mes, ano] = mesAno.split('/');
    const data = new Date(ano, mes - 1);
    return format(data, 'MMM-yy', { locale: ptBR }).toUpperCase();
  };

  useEffect(() => {
    document.title = 'Avaliação de Incidentes | Relatório de Técnicos';
    checkUserQueues();
  }, []);

  useEffect(() => {
    if (selectedQueue) {
      fetchData();
    }
  }, [selectedPeriod, selectedQueue]);

  useEffect(() => {
    fetchQueues();
  }, []);

  // Adicione um novo useEffect para buscar técnicos quando a fila for selecionada
  useEffect(() => {
    if (selectedQueue) {
      fetchTecnicos();
    }
  }, [selectedQueue]);

  const checkUserQueues = async () => {
    try {
      // Assume que o user tem uma propriedade assignment_groups com as filas do usuário
      if (user?.assignment_groups?.length === 1) {
        // Se o usuário tem apenas uma fila, seleciona automaticamente
        setSelectedQueue(user.assignment_groups[0].id);
        setUserQueues(user.assignment_groups);
        setIsQueueSelected(true);
        await fetchTecnicos(user.assignment_groups[0].id);
      } else if (user?.assignment_groups?.length > 1) {
        // Se tem múltiplas filas, permite seleção
        setUserQueues(user.assignment_groups);
        setIsQueueSelected(false);
      } else {
        // Se não tem filas definidas, carrega todas (para admins)
        await fetchQueues();
      }
    } catch (error) {
      console.error('Erro ao verificar filas do usuário:', error);
      setError('Erro ao carregar filas do usuário');
    }
  };

  const fetchData = async () => {
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

      const response = await api.get('/avaliacao/notas-por-tecnico/', {
        params: {
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
          assignment_group: selectedQueue
        }
      });

      setData(response.data);
      setDashboardData(response.data);
      
      // Extrair grupos únicos
      const uniqueGroups = [...new Set(response.data.map(item => ({
        id: item.assignment_group_id,
        nome: item.assignment_group_nome
      })))];
      
      setGroups(uniqueGroups);
      setSelectedGroup(uniqueGroups[0]?.id);
      
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar os dados');
    } finally {
      setLoading(false);
    }
  };

  const fetchQueues = async () => {
    try {
      const response = await api.get('/dw_analytics/assignment-group/');
      const activeQueues = response.data.results.filter(queue => queue.status);
      setQueues(activeQueues);
      setUserQueues(activeQueues);
    } catch (error) {
      console.error('Erro ao carregar filas:', error);
    }
  };

  const fetchTecnicos = async (queueId = selectedQueue) => {
    if (!queueId) return;
    
    try {
      const response = await api.get('/access/users/');
      
      // Filtra apenas os técnicos ativos que pertencem à fila selecionada
      const tecnicosList = response.data.results
        .filter(user => 
          user.is_ativo && 
          user.is_tecnico && 
          user.assignment_groups.some(group => group.id === queueId)
        )
        .map(user => ({
          id: user.id,
          nome: user.full_name
        }));
      
      setTecnicos(tecnicosList);
      setSelectedTecnico('todos');
      setIsQueueSelected(true);
    } catch (error) {
      console.error('Erro ao carregar técnicos:', error);
    }
  };

  useEffect(() => {
    if (data.length > 0 && selectedGroup) {
      const groupData = data.find(g => g.assignment_group_id === selectedGroup);
      if (groupData) {
        const tecnicosList = groupData.tecnicos.map(t => ({
          id: t.tecnico_id,
          nome: t.tecnico_nome
        }));
        setTecnicos(tecnicosList);
      }
    }
  }, [data, selectedGroup]);

  const processData = (rawData) => {
    if (!rawData || !selectedGroup) return [];
    
    return rawData
      .filter(item => item.assignment_group_id === selectedGroup)
      .map(item => {
        const monthData = {
          mes: item.mes,
          group_id: item.assignment_group_id,
          group_nome: item.assignment_group_nome
        };

        // Adicionar dados de cada técnico
        item.tecnicos.forEach(tecnico => {
          monthData[tecnico.tecnico_nome] = tecnico.nota_media;
          monthData[`${tecnico.tecnico_nome}_detalhes`] = {
            nota_total: tecnico.nota_total,
            total_avaliacoes: tecnico.total_avaliacoes,
            melhor_criterio: tecnico.melhor_criterio,
            pior_criterio: tecnico.pior_criterio
          };
        });

        return monthData;
      })
      .sort((a, b) => {
        const [mesA, anoA] = a.mes.split('/');
        const [mesB, anoB] = b.mes.split('/');
        return new Date(anoA, mesA - 1) - new Date(anoB, mesB - 1);
      });
  };

  const formatarNumero = (numero) => {
    return numero.toLocaleString('pt-BR');
  };

  const formatarDecimal = (numero) => {
    return numero.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Atualizar função de cálculo da média do período para considerar mês selecionado
  const calcularPontuacaoPeriodo = () => {
    if (!data?.length || !selectedGroup) return 0;
    
    const dadosGrupo = data.filter(item => item.assignment_group_id === selectedGroup);
    
    if (selectedMonth) {
      const mesSelecionado = dadosGrupo.find(item => item.mes === selectedMonth);
      let totalNotas = mesSelecionado?.nota_total || 0;
      let totalAvaliacoes = mesSelecionado?.total_avaliacoes || 0;
      return totalAvaliacoes > 0 ? totalNotas / totalAvaliacoes : 0;
    }

    let totalNotas = 0;
    let totalAvaliacoes = 0;
    dadosGrupo.forEach(mes => {
      totalNotas += mes.nota_total || 0;
      totalAvaliacoes += mes.total_avaliacoes || 0;
    });
    
    return totalAvaliacoes > 0 ? totalNotas / totalAvaliacoes : 0;
  };

  const calcularPontuacaoUltimoMes = () => {
    if (!data?.length || !selectedGroup) return 0;
    
    const ultimoMes = data
      .filter(item => item.assignment_group_id === selectedGroup)
      .sort((a, b) => {
        const [mesA, anoA] = a.mes.split('/');
        const [mesB, anoB] = b.mes.split('/');
        return new Date(anoB, mesB - 1) - new Date(anoA, mesA - 1);
      })[0];

    return ultimoMes?.nota_media || 0;
  };

  const calcularPontuacaoPeriodoAnteriores = () => {
    if (!data?.length || !selectedGroup) return 0;
    
    const dadosGrupo = data.filter(item => item.assignment_group_id === selectedGroup);
    let totalNotas = 0;
    let totalAvaliacoes = 0;
    
    dadosGrupo.forEach(mes => {
      totalNotas += mes.nota_total || 0;
      totalAvaliacoes += mes.total_avaliacoes || 0;
    });
    
    return totalAvaliacoes > 0 ? totalNotas / totalAvaliacoes : 0;
  };

  const calcularPontuacaoUltimoMesAnteriores = () => {
    if (!data?.length || !selectedGroup) return 0;
    
    const ultimoMes = data
      .filter(item => item.assignment_group_id === selectedGroup)
      .sort((a, b) => {
        const [mesA, anoA] = a.mes.split('/');
        const [mesB, anoB] = b.mes.split('/');
        return new Date(anoB, mesB - 1) - new Date(anoA, mesA - 1);
      })[0];

    return ultimoMes?.total_avaliacoes > 0 ? 
      ultimoMes.nota_total / ultimoMes.total_avaliacoes : 0;
  };

  // Adicionar nova função para calcular total de tickets
  const calcularTotalTickets = () => {
    if (!data?.length || !selectedGroup) return 0;
    
    const dadosGrupo = data.filter(item => item.assignment_group_id === selectedGroup);
    
    if (selectedMonth) {
      const mesSelecionado = dadosGrupo.find(item => item.mes === selectedMonth);
      return mesSelecionado?.total_tickets || 0;
    }

    return dadosGrupo.reduce((total, mes) => total + (mes.total_tickets || 0), 0);
  };

  // Adicionar nova função para calcular total de pontos do período
  const calcularTotalPontos = () => {
    if (!data?.length || !selectedGroup) return 0;
    
    const dadosGrupo = data.filter(item => item.assignment_group_id === selectedGroup);
    
    if (selectedMonth) {
      const mesSelecionado = dadosGrupo.find(item => item.mes === selectedMonth);
      return mesSelecionado?.nota_total || 0;
    }

    return dadosGrupo.reduce((total, mes) => total + (mes.nota_total || 0), 0);
  };

  const getFilteredData = () => {
    const processedData = processData(data);
    console.log('Processed Data:', processedData); // Log para depuração
    if (selectedTecnico !== 'todos') {
      return processedData.map(item => {
        const filteredItem = { ...item };
        Object.keys(filteredItem).forEach(key => {
          if (key !== selectedTecnico && !['mes', 'group_id', 'group_nome'].includes(key)) {
            delete filteredItem[key];
          }
        });
        return filteredItem;
      });
    }
    return processedData;
  };

  const calcularTendenciaGeral = () => {
    if (!data?.length || !selectedGroup) return 'same';
    
    const dadosGrupo = data
      .filter(item => item.assignment_group_id === selectedGroup)
      .sort((a, b) => {
        const [mesA, anoA] = a.mes.split('/');
        const [mesB, anoB] = b.mes.split('/');
        return new Date(anoB, mesB - 1) - new Date(anoA, mesA - 1);
      });

    if (dadosGrupo.length < 2) return 'same';

    const ultimoMes = dadosGrupo[0];
    const penultimoMes = dadosGrupo[1];

    if (ultimoMes.nota_media > penultimoMes.nota_media) return 'up';
    if (ultimoMes.nota_media < penultimoMes.nota_media) return 'down';
    return 'same';
  };

  const getFilteredRanking = () => {
    if (!data?.length || !selectedGroup) return [];
    
    const mesesOrdenados = data
      .filter(item => item.assignment_group_id === selectedGroup)
      .sort((a, b) => {
        const [mesA, anoA] = a.mes.split('/');
        const [mesB, anoB] = b.mes.split('/');
        return new Date(anoB, mesB - 1) - new Date(anoA, mesA - 1);
      });

    if (mesesOrdenados.length < 1) return [];

    // Mês selecionado para média e pontos
    const mesSelecionado = selectedMonth 
      ? mesesOrdenados.find(m => m.mes === selectedMonth)
      : mesesOrdenados[0];
    
    const mesAnterior = mesesOrdenados[mesesOrdenados.indexOf(mesSelecionado) + 1];

    return mesSelecionado?.tecnicos
      .sort((a, b) => b.nota_media - a.nota_media)
      .map((tecnico, index) => {
        const tecnicoMesAnterior = mesAnterior?.tecnicos
          .find(t => t.tecnico_id === tecnico.tecnico_id);

        // Tendências baseadas na média e total de pontos
        const tendenciaMedia = tecnicoMesAnterior
          ? tecnico.nota_media > tecnicoMesAnterior.nota_media ? 'up'
            : tecnico.nota_media < tecnicoMesAnterior.nota_media ? 'down'
            : 'same'
          : 'same';

        const tendenciaPontos = tecnicoMesAnterior
          ? tecnico.nota_total > tecnicoMesAnterior.nota_total ? 'up'
            : tecnico.nota_total < tecnicoMesAnterior.nota_total ? 'down'
            : 'same'
          : 'same';

        return {
          ...tecnico,
          posicao_ranking: index + 1,
          media_ultimo_mes: mesSelecionado.nota_media,
          total_pontos: tecnico.nota_total,
          tendencia_media: tendenciaMedia,
          tendencia_pontos: tendenciaPontos
        };
      });
  };

  const calcularPontoCritico = () => {
    if (!data?.length || !selectedGroup) return '-';
    
    const mesesOrdenados = data
      .filter(item => item.assignment_group_id === selectedGroup)
      .sort((a, b) => {
        const [mesA, anoA] = a.mes.split('/');
        const [mesB, anoB] = b.mes.split('/');
        return new Date(anoB, mesB - 1) - new Date(anoA, mesA - 1);
      });

    // Se tiver mês selecionado, usa ele, senão usa o último mês
    const mesSelecionado = selectedMonth 
      ? mesesOrdenados.find(m => m.mes === selectedMonth)
      : mesesOrdenados[0];

    if (!mesSelecionado?.tecnicos?.length) return '-';

    const tecnicoCritico = mesSelecionado.tecnicos
      .reduce((min, curr) => curr.nota_media < min.nota_media ? curr : min);

    return `${tecnicoCritico.tecnico_nome} (${tecnicoCritico.nota_media.toFixed(2)}%)`;
  };

  const getMedalIcon = (position) => {
    const medalColors = {
      1: '#FFD700', // Ouro
      2: '#C0C0C0', // Prata
      3: '#CD7F32'  // Bronze
    };

    if (position <= 3) {
      return <FaMedal color={medalColors[position]} size={20} className="medal-icon" />;
    }
    return <span className="dashboard-ranking-number">{position}</span>;
  };

  const renderDashboardContent = () => {
    const handleMonthClick = (data) => {
      if (data && data.activeLabel) {
        // Se clicar no mês que já está selecionado, limpa o filtro
        if (selectedMonth === data.activeLabel) {
          setSelectedMonth(null);
        } else {
          setSelectedMonth(data.activeLabel);
        }
      }
    };

    const clearMonthFilter = () => {
      setSelectedMonth(null);
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
                value={userQueues
                  .map(q => ({ value: q.id, label: q.dv_assignment_group }))
                  .find(option => option.value === selectedQueue)}
                onChange={(option) => {
                  setSelectedQueue(option.value);
                  fetchTecnicos(option.value);
                }}
                options={userQueues.map(queue => ({
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

    const groupOptions = groups.map(group => ({
      value: group.id,
      label: group.nome
    }));

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
              value={queues.map(q => ({ value: q.id, label: q.dv_assignment_group }))
                .find(option => option.value === selectedQueue)}
              onChange={(option) => {
                setSelectedQueue(option.value);
                setSelectedTecnico('todos'); // Reset seleção do técnico
                setSelectedGroup(option.value); // Atualiza o grupo selecionado
                fetchTecnicos(option.value); // Busca os técnicos da nova fila
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
              isDisabled={!selectedQueue} // Desabilita se não houver fila selecionada
              value={tecnicoOptions.find(option => option.value === selectedTecnico) || { value: 'todos', label: 'Todos os Técnicos' }}
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
            icon={FaChartBar}
            title="Tickets Avaliados"
            value={formatarNumero(calcularTotalTickets())}
          />
          <IndicadorCard
            icon={FaChartBar}
            title="Total de Pontos"
            value={formatarNumero(Math.round(calcularTotalPontos()))}
            tendencia={calcularTendenciaGeral()}
          />
          <IndicadorCard
            icon={FaChartBar}
            title="Média Período"
            value={formatarDecimal(calcularPontuacaoPeriodo())}
            tendencia={calcularTendenciaGeral()}
          />
          <IndicadorCard
            icon={FaChartBar}
            title="Média Último Mês"
            value={formatarDecimal(calcularPontuacaoUltimoMes())}
            tendencia={calcularTendenciaGeral()}
          />
          <IndicadorCard
            icon={FaExclamationTriangle}
            title="Ponto Crítico"
            value={calcularPontoCritico()}
            className="critical"
          />
        </div>

        <div className="dashboard-flex">
          <div className="dashboard-chart-container">
            <h3 className="dashboard-chart-title" style={{ textAlign: 'center' }}>
              Evolução da Média
            </h3>
            <div className="chart-wrapper">
              <div className="chart-outer-container">
                <ResponsiveContainer width="95%" height={360}> {/* Reduzido de 400 */}
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
                      padding={{ left: 10, right: 10 }}
                    />
                    <YAxis 
                      hide={true}
                      domain={[0, 100]}
                    />
                    <Tooltip 
                      formatter={(value, name) => [`${formatarDecimal(value)}`, name.split('_')[0]]}
                      labelFormatter={formatMes}
                    />
                    <Legend 
                      formatter={(value) => value.split('_')[0]}
                      wrapperStyle={{ paddingTop: '20px' }}
                    />
                    {Object.keys(getFilteredData()[0] || {})
                      .filter(key => !['mes', 'group_id', 'group_nome'].includes(key) && 
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
                              strokeWidth: 2.5
                            }}
                            activeDot={{ 
                              r: 8,
                              fill: '#FFFFFF',
                              stroke: colors[colorIndex].stroke,
                              strokeWidth: 2.5
                            }}
                            label={props => {
                              const { x, y, value, index: dataIndex } = props;
                              const data = getFilteredData();
                              const proximosValores = Object.keys(data[dataIndex])
                                .filter(k => !['mes', 'group_id', 'group_nome'].includes(k) && 
                                  !k.includes('_detalhes') && !k.includes('_tendencia'))
                                .map(k => ({
                                  valor: data[dataIndex][k],
                                  nome: k,
                                  y: data[dataIndex][k] // armazena o valor Y para comparação
                                }))
                                .sort((a, b) => b.y - a.y); // ordena por valor decrescente

                              if (proximosValores.length <= 2) {
                                const posicao = proximosValores.findIndex(v => v.nome === tecnico);
                                // Ajusta o offset baseado na posição e no valor
                                const offsetY = posicao === 0 ? -25 : posicao === 1 ? 25 : 0;
                                
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
                                    {Math.ceil(value)} {/* Removido o % e usando Math.ceil */}
                                  </text>
                                );
                              }
                              return null;
                            }}
                          />
                        );
                      })}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="dashboard-ranking-container">
            <h3>
              <FaTrophy className="card-icon" />
              Ranking dos Técnicos
            </h3>
            <div className="ranking-list-container">
              <div className="dashboard-ranking-header">
                <span>Técnico</span>
                <span>Média</span>
                <span>Total Pontos</span>
              </div>
              <ul className="ranking-list">
                {getFilteredRanking().map((tecnico, index) => (
                  <li key={tecnico.tecnico_id} 
                      className={`dashboard-ranking-item ${index === 0 ? 'top-1' : ''} ${index < 3 ? `dashboard-top-${index + 1}` : ''}`}>
                    <div className="dashboard-ranking-info">
                      {getMedalIcon(index + 1)}
                      <span className="ranking-name">{tecnico.tecnico_nome}</span>
                    </div>
                    <div className="ranking-percentage">
                      {formatarDecimal(tecnico.nota_media || 0)}
                      {getTendenciaIcon(tecnico.tendencia_media)}
                    </div>
                    <div className="ranking-pontos">
                      {formatarNumero(Math.round(tecnico.nota_total || 0))}
                      {getTendenciaIcon(tecnico.tendencia_pontos)}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
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
