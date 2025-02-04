-- Definição da view vw_tickets_sorteados
-- Esta view combina informações de tickets sorteados com detalhes dos incidentes correspondentes.

CREATE OR ALTER VIEW vw_tickets_sorteados AS
SELECT 
    st.id as sorteio_id,
    st.mes_ano,
    i.number as numero_ticket,
    i.resolved_by,
    i.assignment_group,
    i.opened_at as data_abertura,
    i.closed_at as data_fechamento,
    i.contract,
    i.sla_atendimento,
    i.sla_resolucao,
    i.company,
    i.u_origem,
    i.dv_u_categoria_da_falha,
    i.dv_u_sub_categoria_da_falha,
    i.dv_u_detalhe_sub_categoria_da_falha
FROM dw_analytics.d_sorted_ticket st
INNER JOIN dw_analytics.f_incident i 
    ON st.incident_id = i.id
GO