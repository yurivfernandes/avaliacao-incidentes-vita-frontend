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

function TecnicosReportPage() {
  const [data, setData] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTecnico, setSelectedTecnico] = useState('todos');
  const [tecnicos, setTecnicos] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('6');  // default 6 meses
  const [dashboardData, setDashboardData] = useState(null);

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
    fetchData();
  }, [selectedPeriod]);

  const fetchData = async () => {
    try {
      const endDate = new Date();
      let startDate = new Date();

      if (selectedPeriod === 'atual') {
        startDate = new Date(endDate.getFullYear(), 0, 1); // 1º dia do ano atual
      } else if (selectedPeriod === 'anterior') {
        startDate = new Date(endDate.getFullYear() - 1, 0, 1); // 1º dia do ano anterior
        endDate.setFullYear(endDate.getFullYear() - 1, 11, 31); // último dia do ano anterior
      } else {
        startDate.setMonth(startDate.getMonth() - parseInt(selectedPeriod));
      }

      const response = await api.get('/avaliacao/avaliacoes/notas-por-tecnico/', {
        params: {
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0]
        }
      });

      // Processa os dados para calcular o total do período
      const apiData = response.data;
      
      if (apiData.resultado_agrupado && apiData.ranking_tecnicos) {
        const somaTotalPorTecnico = new Map();
        
        // Primeiro, vamos calcular as tendências
        const mesesOrdenados = apiData.resultado_agrupado
          .sort((a, b) => {
            const [mesA, anoA] = a.mes.split('/');
            const [mesB, anoB] = b.mes.split('/');
            return new Date(anoB, mesB - 1) - new Date(anoA, mesA - 1);
          });

        // Pega os dois últimos meses para comparar
        const ultimoMes = mesesOrdenados[0];
        const penultimoMes = mesesOrdenados[1];

        // Mapa para armazenar as tendências
        const tendencias = new Map();

        if (ultimoMes && penultimoMes) {
          ultimoMes.tecnicos.forEach(tecnico => {
            const tecnicoPenultimoMes = penultimoMes.tecnicos
              .find(t => t.tecnico_id === tecnico.tecnico_id);
            
            if (tecnicoPenultimoMes) {
              const tendencia = tecnico.percentual > tecnicoPenultimoMes.percentual ? 'up' :
                              tecnico.percentual < tecnicoPenultimoMes.percentual ? 'down' : 'same';
              tendencias.set(tecnico.tecnico_id, tendencia);
            }
          });
        }

        // Agora calcula os totais
        apiData.resultado_agrupado.forEach(mes => {
          mes.tecnicos.forEach(tecnico => {
            const key = tecnico.tecnico_id;
            if (!somaTotalPorTecnico.has(key)) {
              somaTotalPorTecnico.set(key, {
                total_pontos: 0,
                total_possivel: 0,
                tecnico_nome: tecnico.tecnico_nome,
                tecnico_id: tecnico.tecnico_id,
                percentual: 0,
                tendencia: tendencias.get(key) || 'same'
              });
            }
            const atual = somaTotalPorTecnico.get(key);
            atual.total_pontos += tecnico.total_pontos;
            atual.total_possivel += tecnico.total_possivel;
          });
        });

        // Calcula o percentual final e atualiza o ranking
        apiData.ranking_tecnicos = Array.from(somaTotalPorTecnico.values())
          .map(tecnico => ({
            ...tecnico,
            percentual: (tecnico.total_pontos / tecnico.total_possivel) * 100
          }))
          .sort((a, b) => b.percentual - a.percentual);
      }

      setDashboardData(apiData);
      setGroups(apiData.resultado_agrupado.map(group => ({
        id: group.assignment_group_id,
        nome: group.assignment_group_nome
      })));
      setSelectedGroup(apiData.resultado_agrupado[0]?.assignment_group_id);
      setData(apiData.resultado_agrupado);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar os dados');
    } finally {
      setLoading(false);
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
    
    const groupData = rawData.find(item => item.assignment_group_id === selectedGroup);
    if (!groupData) return [];

    // Criar um Map para armazenar apenas um registro por técnico por mês
    const mesesData = new Map();
    const mesesToProcess = [...new Set(rawData.map(item => item.mes))].sort();

    mesesToProcess.forEach(mes => {
      const monthData = {
        mes,
        group_id: groupData.assignment_group_id,
        group_nome: groupData.assignment_group_nome
      };

      // Pegar apenas os dados mais recentes de cada técnico para o mês
      const tecnicosDoMes = new Map();
      rawData.forEach(item => {
        if (item.mes === mes && item.assignment_group_id === selectedGroup) {
          item.tecnicos.forEach(tecnico => {
            tecnicosDoMes.set(tecnico.tecnico_id, tecnico);
          });
        }
      });

      // Adicionar dados dos técnicos ao mês
      tecnicosDoMes.forEach(tecnico => {
        monthData[tecnico.tecnico_nome] = tecnico.percentual;
        monthData[`${tecnico.tecnico_nome}_detalhes`] = {
          total_pontos: tecnico.total_pontos,
          total_possivel: tecnico.total_possivel
        };
        monthData[`${tecnico.tecnico_nome}_tendencia`] = tecnico.tendencia;
      });

      mesesData.set(mes, monthData);
    });

    return Array.from(mesesData.values());
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
    if (!dashboardData?.ranking_tecnicos?.length) return 'same';
    
    const tecnicos = dashboardData.ranking_tecnicos;
    const tendenciasUp = tecnicos.filter(t => t.tendencia === 'up').length;
    const tendenciasDown = tecnicos.filter(t => t.tendencia === 'down').length;
    
    if (tendenciasUp > tendenciasDown) return 'up';
    if (tendenciasDown > tendenciasUp) return 'down';
    return 'same';
  };

  const calcularMediaUltimoMes = () => {
    if (!dashboardData?.resultado_agrupado?.length) return 0;
    
    const ultimoMes = dashboardData.resultado_agrupado[dashboardData.resultado_agrupado.length - 1];
    const percentuais = ultimoMes.tecnicos.map(t => t.percentual);
    return percentuais.reduce((a, b) => a + b, 0) / percentuais.length;
  };

  const calcularMediaPontuacao = () => {
    if (!dashboardData?.ranking_tecnicos?.length) return 0;
    const totalPontos = dashboardData.ranking_tecnicos.reduce((sum, tecnico) => 
      sum + (tecnico.total_pontos || 0), 0);
    const totalPossivel = dashboardData.ranking_tecnicos.reduce((sum, tecnico) => 
      sum + (tecnico.total_possivel || 0), 0);
    return totalPossivel > 0 ? (totalPontos / totalPossivel) * 100 : 0;
  };

  const calcularMediaPontuacaoUltimoMes = () => {
    if (!dashboardData?.resultado_agrupado?.length) return 0;
    const ultimoMes = dashboardData.resultado_agrupado[dashboardData.resultado_agrupado.length - 1];
    let totalPontos = 0;
    let totalPossivel = 0;
    
    ultimoMes.tecnicos.forEach(tecnico => {
      totalPontos += tecnico.total_pontos || 0;
      totalPossivel += tecnico.total_possivel || 0;
    });

    return totalPossivel > 0 ? (totalPontos / totalPossivel) * 100 : 0;
  };

  const calcularPontosUltimoMes = () => {
    if (!dashboardData?.resultado_agrupado?.length) return { obtidos: 0, possiveis: 0 };
    const ultimoMes = dashboardData.resultado_agrupado[dashboardData.resultado_agrupado.length - 1];
    let obtidos = 0, possiveis = 0;
    
    ultimoMes.tecnicos.forEach(tecnico => {
      obtidos += tecnico.total_pontos || 0;
      possiveis += tecnico.total_possivel || 0;
    });

    return { obtidos, possiveis };
  };

  const calcularMediaPontos = () => {
    if (!dashboardData?.ranking_tecnicos?.length) return 0;
    const pontos = dashboardData.ranking_tecnicos.map(t => t.total_pontos);
    return pontos.reduce((a, b) => a + b, 0) / pontos.length;
  };

  const calcularMenorPontuacao = () => {
    if (!dashboardData?.ranking_tecnicos?.length) return 0;
    return Math.min(...dashboardData.ranking_tecnicos.map(t => t.total_pontos));
  };

  const calcularMediaPercentualPeriodo = () => {
    if (!dashboardData?.resultado_agrupado?.length) return 0;
    const percentuais = dashboardData.resultado_agrupado.flatMap(group => 
      group.tecnicos.map(t => t.percentual)
    );
    return percentuais.length ? (percentuais.reduce((a, b) => a + b, 0) / percentuais.length) : 0;
  };

  const calcularMediaPercentualUltimoMes = () => {
    if (!dashboardData?.resultado_agrupado?.length) return 0;
    const ultimoMes = dashboardData.resultado_agrupado[dashboardData.resultado_agrupado.length - 1];
    const percentuais = ultimoMes.tecnicos.map(t => t.percentual);
    return percentuais.length ? (percentuais.reduce((a, b) => a + b, 0) / percentuais.length) : 0;
  };

  const calcularMediaPontuacaoPeriodo = () => {
    if (!dashboardData?.ranking_tecnicos?.length) return 0;
    const totalPontos = dashboardData.ranking_tecnicos.reduce((sum, tecnico) => 
      sum + (tecnico.total_pontos || 0), 0);
    const totalPossivel = dashboardData.ranking_tecnicos.reduce((sum, tecnico) => 
      sum + (tecnico.total_possivel || 0), 0);
    return totalPossivel > 0 ? (totalPontos / totalPossivel) * 100 : 0;
  };

  const calcularPontoCritico = () => {
    if (!dashboardData?.item_mais_critico) return '-';
    
    try {
      const { campo, dados } = dashboardData.item_mais_critico;
      if (!dados || typeof dados.percentual !== 'number') return '-';
      
      return `${dados.nome || 'N/A'} (${dados.percentual.toFixed(2)}%)`;
    } catch (error) {
      console.error('Erro ao calcular ponto crítico:', error);
      return '-';
    }
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

  if (loading) return <div className="loading-container">Carregando...</div>;
  if (error) return <div className="error-container">{error}</div>;

  return (
    <>
      <Header />
      <div className="dashboard-report-container">
        <div className="dashboard-content-container">
          <div className="dashboard-report-header">
            <h1 className="dashboard-report-title">
              <FaChartBar className="title-icon" />
              Relatório de Técnicos
            </h1>
          </div>
          
          <div className="dashboard-filters-container">
            <div className="dashboard-filter-group">
              <label>Fila de Atendimento</label>
              <select 
                className="dashboard-filter-select"
                value={selectedGroup || ''} 
                onChange={(e) => setSelectedGroup(Number(e.target.value))}
              >
                {groups.map(group => (
                  <option key={group.id} value={group.id}>
                    {group.nome}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="dashboard-filter-group">
              <label>Técnico</label>
              <select
                className="dashboard-filter-select"
                value={selectedTecnico}
                onChange={(e) => setSelectedTecnico(e.target.value)}
              >
                <option value="todos">Todos os Técnicos</option>
                {tecnicos.map(tecnico => (
                  <option key={tecnico.id} value={tecnico.nome}>
                    {tecnico.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="dashboard-filter-group">
              <label>Período</label>
              <select
                className="dashboard-filter-select"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
              >
                {periodos.map(periodo => (
                  <option key={periodo.value} value={periodo.value}>
                    {periodo.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="dashboard-grid">
            <IndicadorCard
              icon={FaChartBar}
              title="Média % Período"
              value={calcularMediaPercentualPeriodo().toFixed(2)}
              subtitle="%"
              tendencia={calcularTendenciaGeral()}
            />

            <IndicadorCard
              icon={FaChartBar}
              title="Média % Último Mês"
              value={calcularMediaPercentualUltimoMes().toFixed(2)}
              subtitle="%"
              tendencia={calcularTendenciaGeral()}
            />

            <IndicadorCard
              icon={FaChartBar}
              title="Média Período"
              value={Math.round(calcularMediaPontuacaoPeriodo())}
              tendencia={calcularTendenciaGeral()}
            />

            <IndicadorCard
              icon={FaChartBar}
              title="Média Último Mês"
              value={Math.round(calcularMediaPontuacaoUltimoMes())}
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
                Evolução dos Percentuais
              </h3>
              <div className="chart-wrapper">
                <div className="chart-outer-container">
                  <ResponsiveContainer width="95%" height={400}>
                    <AreaChart 
                      data={getFilteredData()
                        .sort((a, b) => {
                          const [mesA, anoA] = a.mes.split('/');
                          const [mesB, anoB] = b.mes.split('/');
                          return new Date(anoA, mesA - 1) - new Date(anoB, mesB - 1);
                        })} 
                      margin={{ top: 20, right: 40, left: 20, bottom: 20 }}
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
                        formatter={(value, name) => [`${value.toFixed(2)}%`, name.split('_')[0]]}
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
                                      {`${Math.round(value)}%`}
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
                  <span>Percentual</span>
                  <span>Pontos Total</span>
                </div>
                <ul className="ranking-list">
                  {dashboardData?.ranking_tecnicos?.map((tecnico, index) => (
                    <li key={tecnico.tecnico_id} 
                        className={`dashboard-ranking-item ${index === 0 ? 'top-1' : ''} ${index < 3 ? `dashboard-top-${index + 1}` : ''}`}>
                      <div className="dashboard-ranking-info">
                        {getMedalIcon(index + 1)}
                        <span className="ranking-name">{tecnico.tecnico_nome}</span>
                      </div>
                      <div className="ranking-percentage">
                        {tecnico.percentual.toFixed(2)}%
                        {getTendenciaIcon(tecnico.tendencia)}
                      </div>
                      <div className="ranking-pontos">
                        {tecnico.total_pontos} / {tecnico.total_possivel}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default TecnicosReportPage;
