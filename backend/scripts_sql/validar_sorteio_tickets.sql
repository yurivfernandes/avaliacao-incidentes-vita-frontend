-- Resumo geral dos sorteios por mês
SELECT 
    st.mes_ano,
    ag.dv_assignment_group as fila,
    rb.dv_resolved_by as tecnico,
    COUNT(st.id) as qtd_sorteada,
    p.qtd_incidents as qtd_esperada,
    CASE 
        WHEN COUNT(st.id) = p.qtd_incidents THEN 'OK'
        WHEN COUNT(st.id) < p.qtd_incidents THEN 'MENOR que esperado'
        ELSE 'MAIOR que esperado'
    END as status_sorteio
FROM dw_analytics.d_assignment_group ag
INNER JOIN dw_analytics.d_premissas p 
    ON p.assignment_id = ag.id
INNER JOIN dw_analytics.f_incident i 
    ON i.assignment_group = ag.id
INNER JOIN dw_analytics.d_resolved_by rb 
    ON rb.id = i.resolved_by
LEFT JOIN dw_analytics.d_sorted_ticket st 
    ON st.incident_id = i.id
WHERE FORMAT(i.closed_at, 'yyyy-MM') = st.mes_ano
GROUP BY 
    st.mes_ano,
    ag.dv_assignment_group,
    rb.dv_resolved_by,
    p.qtd_incidents
ORDER BY 
    st.mes_ano DESC,
    ag.dv_assignment_group,
    rb.dv_resolved_by;

-- Detalhes dos tickets sorteados
SELECT 
    st.mes_ano,
    ag.dv_assignment_group as fila,
    rb.dv_resolved_by as tecnico,
    i.number as numero_ticket,
    i.closed_at as data_fechamento,
    inc.dv_state as estado,
    i.dv_u_categoria_da_falha as categoria,
    i.dv_u_sub_categoria_da_falha as subcategoria
FROM dw_analytics.d_sorted_ticket st
INNER JOIN dw_analytics.f_incident i 
    ON st.incident_id = i.id
INNER JOIN dw_analytics.d_assignment_group ag 
    ON i.assignment_group = ag.id
INNER JOIN dw_analytics.d_resolved_by rb 
    ON rb.id = i.resolved_by
INNER JOIN SERVICE_NOW.dbo.incident inc 
    ON i.number = inc.number
ORDER BY 
    st.mes_ano DESC,
    ag.dv_assignment_group,
    rb.dv_resolved_by,
    i.closed_at;

-- Validação de regras de negócio
SELECT 
    st.mes_ano,
    ag.dv_assignment_group as fila,
    rb.dv_resolved_by as tecnico,
    i.number as numero_ticket,
    i.closed_at,
    inc.dv_state,
    'Ticket sem data de fechamento' as problema
FROM dw_analytics.d_sorted_ticket st
INNER JOIN dw_analytics.f_incident i 
    ON st.incident_id = i.id
INNER JOIN dw_analytics.d_assignment_group ag 
    ON i.assignment_group = ag.id
INNER JOIN dw_analytics.d_resolved_by rb 
    ON rb.id = i.resolved_by
INNER JOIN SERVICE_NOW.dbo.incident inc 
    ON i.number = inc.number
WHERE i.closed_at IS NULL

UNION ALL

SELECT 
    st.mes_ano,
    ag.dv_assignment_group,
    rb.dv_resolved_by,
    i.number,
    i.closed_at,
    inc.dv_state,
    'Ticket não está encerrado/closed' as problema
FROM dw_analytics.d_sorted_ticket st
INNER JOIN dw_analytics.f_incident i 
    ON st.incident_id = i.id
INNER JOIN dw_analytics.d_assignment_group ag 
    ON i.assignment_group = ag.id
INNER JOIN dw_analytics.d_resolved_by rb 
    ON rb.id = i.resolved_by
INNER JOIN SERVICE_NOW.dbo.incident inc 
    ON i.number = inc.number
WHERE inc.dv_state NOT IN ('Encerrado', 'Closed')

UNION ALL

SELECT 
    st.mes_ano,
    ag.dv_assignment_group,
    rb.dv_resolved_by,
    i.number,
    i.closed_at,
    inc.dv_state,
    'Fila não está nas premissas' as problema
FROM dw_analytics.d_sorted_ticket st
INNER JOIN dw_analytics.f_incident i 
    ON st.incident_id = i.id
INNER JOIN dw_analytics.d_assignment_group ag 
    ON i.assignment_group = ag.id
INNER JOIN dw_analytics.d_resolved_by rb 
    ON rb.id = i.resolved_by
INNER JOIN SERVICE_NOW.dbo.incident inc 
    ON i.number = inc.number
LEFT JOIN dw_analytics.d_premissas p 
    ON i.assignment_group = p.assignment_id
WHERE p.assignment_id IS NULL
ORDER BY mes_ano DESC, fila, tecnico; 