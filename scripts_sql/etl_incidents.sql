SELECT
    incident.number,
    incident.opened_at,
    incident.closed_at,
    incident.sla_atendimento,
    incident.sla_resolucao,
    incident.u_origem,
    incident.dv_u_categoria_da_falha,
    incident.dv_u_sub_categoria_da_falha,
    incident.dv_u_detalhe_sub_categoria_da_falha,
    incident.u_id_vgr,
    company.dv_company,
    COALESCE(op.operacao, 'Multiclientes') as operacao,  -- Usando COALESCE para definir valor padrão
    assignment_group.dv_assignment_group
FROM dw_analytics.f_incident incident
LEFT JOIN dw_analytics.d_company company
    ON incident.company = company.id
LEFT JOIN dw_analytics.d_operacao op  -- Novo JOIN com a tabela d_operacao
    ON company.dv_company LIKE CONCAT('%', op.dv_company, '%')  -- Usando LIKE para fazer o de-para
LEFT JOIN dw_analytics.d_assignment_group assignment_group
    ON incident.assignment_group = assignment_group.id
WHERE opened_at >= '2024-01-01'
AND dv_state IN ('Encerrado','Closed')