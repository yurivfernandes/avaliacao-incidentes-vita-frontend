import React, { useState, useEffect } from 'react';
import { FaSpinner } from 'react-icons/fa';
import api from '../../services/api';
import '../../styles/Modal.css';

function AddAvaliacaoModal({ ticket, onClose, onSuccess }) {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingCriterios, setLoadingCriterios] = useState(true);
  const [error, setError] = useState('');
  const [premissa, setPremissa] = useState(null);
  const [criterios, setCriterios] = useState([]);
  const [criteriosConversao, setCriteriosConversao] = useState({});

  useEffect(() => {
    const fetchPremissaAndCriterios = async () => {
      try {
        setLoadingCriterios(true);

        const initialData = {
          is_contrato_lancado: !!ticket.contract && ticket.contract !== '-',
          is_has_met_first_response_target: ticket.sla_atendimento || false,
          is_resolution_target: ticket.sla_resolucao || false,
        };
        setFormData(initialData);

        // Buscar a premissa associada à fila do ticket
        const premissaResponse = await api.get(`/premissas/list/?search=${encodeURIComponent(ticket.assignment_group)}`);
        if (premissaResponse.data.results && premissaResponse.data.results.length > 0) {
          const premissaEncontrada = premissaResponse.data.results[0];
          setPremissa(premissaEncontrada);

          // Buscar os critérios dessa premissa
          const criteriosResponse = await api.get(`/premissas/criterios/?premissa_id=${premissaEncontrada.id}`);
          const criteriosAtivos = criteriosResponse.data.results.filter(c => c.ativo);

          // Filtrar quais critérios devem ser exibidos para avaliação manual
          const criteriosParaExibir = criteriosAtivos.filter(criterio => {
            if (criterio.field_service_now) {
              // Este critério tem campo no ServiceNow, será avaliado automaticamente
              const fieldValue = getNestedValue(ticket, criterio.field_service_now);

              // Determinar o valor baseado no tipo de campo
              let valorCalculado;
              if (typeof fieldValue === 'boolean') {
                valorCalculado = fieldValue; // Usar diretamente se for boolean
              } else {
                valorCalculado = fieldValue !== undefined && fieldValue !== null && fieldValue !== '';
              }

              // Salvar o valor calculado no formData
              setFormData(prev => ({
                ...prev,
                [`criterio_${criterio.nome}`]: valorCalculado
              }));

              // Não exibir este critério para avaliação manual
              return false;
            }

            return true; // Exibir para avaliação manual se não tiver campo ServiceNow
          });

          setCriterios(criteriosParaExibir);

          // Preparar campos para critérios que serão exibidos
          criteriosParaExibir.forEach(criterio => {
            if (criterio.tipo === 'conversao') {
              // Para critérios do tipo conversão, buscar opções
              fetchConversoesByCriterio(criterio.id);
              setFormData(prev => ({
                ...prev,
                [`criterio_${criterio.nome}`]: ''
              }));
            } else if (criterio.tipo === 'boolean') {
              setFormData(prev => ({
                ...prev,
                [`criterio_${criterio.nome}`]: false
              }));
            } else if (criterio.tipo === 'integer') {
              setFormData(prev => ({
                ...prev,
                [`criterio_${criterio.nome}`]: 0
              }));
            }
          });
        }
      } catch (error) {
        console.error('Erro ao carregar dados para a avaliação:', error);
        setError('Não foi possível carregar os critérios de avaliação.');
      } finally {
        setLoadingCriterios(false);
      }
    };

    fetchPremissaAndCriterios();
  }, [ticket]);

  const getNestedValue = (obj, path) => {
    if (!path) return undefined;
    const parts = path.split('.');
    let value = obj;

    for (const part of parts) {
      if (value === undefined || value === null) return undefined;
      value = value[part];
    }

    return value;
  };

  const fetchConversoesByCriterio = async (criterioId) => {
    try {
      const response = await api.get(`/premissas/conversoes/?criterio_id=${criterioId}`);
      console.log(`Conversões para critério ${criterioId}:`, response.data);

      const conversoes = Array.isArray(response.data) ? response.data : response.data.results || [];
      setCriteriosConversao(prev => ({ ...prev, [criterioId]: conversoes }));
    } catch (error) {
      console.error(`Erro ao buscar conversões para critério ${criterioId}:`, error);
      setCriteriosConversao(prev => ({ ...prev, [criterioId]: [] }));
    }
  };

  const handleToggle = (field) => {
    setFormData({
      ...formData,
      [field]: !formData[field],
    });
  };

  const handleConversaoChange = (criterioId, conversaoId) => {
    console.log('Alterando conversão:', criterioId, conversaoId);
    setFormData(prev => ({
      ...prev,
      [`criterio_${criterioId}`]: conversaoId
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const criteriosPayload = criterios.map(criterio => {
        const criterioId = criterio.id;
        const formValue = formData[`criterio_${criterioId}`];

        if (criterio.tipo === 'boolean') {
          return {
            tipo: 'booleano',
            criterio_id: criterioId,
            valor: !!formValue
          };
        } else if (criterio.tipo === 'conversao') {
          // Garantir que o conversao_id seja enviado
          const conversaoId = formValue;
          if (!conversaoId) {
            throw new Error(`Selecione uma opção para ${criterio.nome}`);
          }
          return {
            tipo: 'conversao',
            criterio_id: criterioId,
            conversao_id: parseInt(conversaoId)
          };
        } else if (criterio.tipo === 'integer') {
          return {
            tipo: 'inteiro',
            criterio_id: criterioId,
            valor: parseInt(formValue)
          };
        }
        return null;
      }).filter(Boolean);

      const payload = {
        incident: ticket.incident_number,
        criterios: criteriosPayload
      };

      await api.post('/avaliacao/save/', payload);
      onSuccess();
    } catch (err) {
      console.error('Erro ao adicionar avaliação:', err);
      setError(err.message || 'Erro ao adicionar avaliação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const renderCriterioField = (criterio) => {
    switch (criterio.tipo) {
      case 'boolean':
        return (
          <div className="toggle-item" key={criterio.id}>
            <label htmlFor={`criterio_${criterio.id}`}>{criterio.nome}</label>
            <label className="switch">
              <input
                type="checkbox"
                id={`criterio_${criterio.id}`}
                checked={formData[`criterio_${criterio.id}`] || false}
                onChange={() => handleToggle(`criterio_${criterio.id}`)}
              />
              <span className="slider round"></span>
            </label>
          </div>
        );

      case 'conversao':
        const conversoes = criteriosConversao[criterio.id] || [];
        return (
          <div className="select-field enhanced" key={criterio.id}>
            <label htmlFor={`criterio_${criterio.id}`}>{criterio.nome}</label>
            <select
              id={`criterio_${criterio.id}`}
              value={formData[`criterio_${criterio.id}`] || ''}
              onChange={(e) => handleConversaoChange(criterio.id, e.target.value)}
              className="form-select custom-select"
              required
            >
              <option value="">Selecione uma opção</option>
              {conversoes.map(conversao => (
                <option key={conversao.id} value={conversao.id}>
                  {conversao.nome}
                </option>
              ))}
            </select>
          </div>
        );

      case 'integer':
        return (
          <div className="range-field" key={criterio.id}>
            <label htmlFor={`criterio_${criterio.id}`}>
              {criterio.nome} <span className="range-value">{formData[`criterio_${criterio.id}`] || 0}</span>
            </label>
            <input
              type="range"
              id={`criterio_${criterio.id}`}
              min="0"
              max="10"
              value={formData[`criterio_${criterio.id}`] || 0}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                [`criterio_${criterio.id}`]: parseInt(e.target.value)
              }))}
              className="form-range"
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="modal-overlay">
      <div className="evaluation-modal">
        <div className="ticket-info-compact">
          <div className="info-item">
            <span className="info-label">Número:</span>
            <span className="info-value">{ticket.incident_number}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Aberto em:</span>
            <span className="info-value">
              {new Date(ticket.opened_at).toLocaleString('pt-BR')}
            </span>
          </div>
          <div className="info-item">
            <span className="info-label">Fechado em:</span>
            <span className="info-value">
              {new Date(ticket.closed_at).toLocaleString('pt-BR')}
            </span>
          </div>
          <div className="info-item">
            <span className="info-label">Técnico:</span>
            <span className="info-value">{ticket.resolved_by}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Fila:</span>
            <span className="info-value">{ticket.assignment_group}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Categoria:</span>
            <span className="info-value">{ticket.categoria_falha}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Subcategoria:</span>
            <span className="info-value">{ticket.sub_categoria_falha}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Detalhe da Subcategoria:</span>
            <span className="info-value">{ticket.dv_u_detalhe_sub_categoria_da_falha}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {loadingCriterios ? (
            <div className="loading-criterios">
              <FaSpinner className="spin-icon" /> Carregando critérios de avaliação...
            </div>
          ) : (
            <div className="criterios-container">
              {criterios.length > 0 ? (
                <div className="criterios-grid">
                  {criterios.map(criterio => renderCriterioField(criterio))}
                </div>
              ) : (
                <div className="no-criterios">
                  Não há critérios disponíveis para avaliação manual.
                </div>
              )}
            </div>
          )}

          {error && <div className="error-message">{error}</div>}

          <div className="modal-actions">
            <button type="button" className="button-secondary" onClick={onClose} disabled={loading || loadingCriterios}>
              Cancelar
            </button>
            <button type="submit" className="button-primary" disabled={loading || loadingCriterios}>
              {loading ? (
                <>
                  <FaSpinner className="spin-icon" /> Salvando...
                </>
              ) : (
                'Salvar Avaliação'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddAvaliacaoModal;
