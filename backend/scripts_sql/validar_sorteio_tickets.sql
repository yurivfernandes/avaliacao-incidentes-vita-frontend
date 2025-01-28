SELECT 
    st.mes_ano,
    ag.dv_assignment_group as fila,
    rb.dv_resolved_by as tecnico,
    COUNT(st.id) as qtd_sorteada
FROM dw_analytics.d_sorted_ticket st
INNER JOIN dw_analytics.f_incident i 
    ON st.incident_id = i.id
INNER JOIN dw_analytics.d_assignment_group ag 
    ON i.assignment_group = ag.id
INNER JOIN dw_analytics.d_resolved_by rb 
    ON rb.id = i.resolved_by
GROUP BY 
    st.mes_ano,
    ag.dv_assignment_group,
    rb.dv_resolved_by
ORDER BY 
    st.mes_ano DESC,
    ag.dv_assignment_group,
    rb.dv_resolved_by;