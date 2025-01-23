CREATE OR ALTER PROCEDURE dw_analytics.sp_etl_incidents
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Variável para controle de atualização incremental
    -- DECLARE @data_corte DATETIME = DATEADD(DAY, -10, GETDATE())
    
    -- Inserir ou atualizar Assignment Groups
    MERGE dw_analytics.d_assignment_group AS target
    USING (
        SELECT DISTINCT assignment_group
        FROM [SERVICE NOW].incident inc
        WHERE assignment_group IS NOT NULL
        AND assignment_group NOT IN ('')
        AND EXISTS (SELECT 1 FROM d_fila df WHERE df.id = inc.assignment_group)
    ) AS source (dv_assignment_group)
    ON target.dv_assignment_group = source.dv_assignment_group
    WHEN NOT MATCHED THEN
        INSERT (dv_assignment_group)
        VALUES (source.dv_assignment_group);

    -- Inserir ou atualizar Resolved By
    MERGE dw_analytics.d_resolved_by AS target
    USING (
        SELECT DISTINCT resolved_by
        FROM [SERVICE NOW].incident inc
        WHERE resolved_by IS NOT NULL
        AND resolved_by NOT IN ('')
        AND EXISTS (SELECT 1 FROM d_analista da WHERE da.id = inc.resolved_by)
    ) AS source (dv_resolved_by)
    ON target.dv_resolved_by = source.dv_resolved_by
    WHEN NOT MATCHED THEN
        INSERT (dv_resolved_by)
        VALUES (source.dv_resolved_by);

    -- Inserir ou atualizar Contract
    MERGE dw_analytics.d_contract AS target
    USING (
        SELECT DISTINCT contract
        FROM [SERVICE NOW].incident inc
        WHERE contract IS NOT NULL
        AND contract NOT IN ('')
        AND EXISTS (SELECT 1 FROM d_contrato dc WHERE dc.id = inc.contract)
    ) AS source (dv_contract)
    ON target.dv_contract = source.dv_contract
    WHEN NOT MATCHED THEN
        INSERT (dv_contract)
        VALUES (source.dv_contract);

    -- Inserir ou atualizar Company
    MERGE dw_analytics.d_company AS target
    USING (
        SELECT DISTINCT company, company_cnpj
        FROM [SERVICE NOW].incident inc
        WHERE company IS NOT NULL
        AND company NOT IN ('')
        AND EXISTS (SELECT 1 FROM d_cliente dc WHERE dc.id = inc.company)
    ) AS source (dv_company, u_cnpj)
    ON target.dv_company = source.dv_company
    WHEN NOT MATCHED THEN
        INSERT (dv_company, u_cnpj)
        VALUES (source.dv_company, source.u_cnpj);

    -- Relacionamento Resolved By - Assignment Group
    MERGE dw_analytics.d_resolved_by_assignment_group AS target
    USING (
        SELECT DISTINCT 
            rb.id AS resolved_by_id,
            ag.id AS assignment_group_id
        FROM [SERVICE NOW].incident inc
        JOIN dw_analytics.d_resolved_by rb ON rb.dv_resolved_by = inc.resolved_by
        JOIN dw_analytics.d_assignment_group ag ON ag.dv_assignment_group = inc.assignment_group
        WHERE inc.resolved_by IS NOT NULL
        AND inc.assignment_group IS NOT NULL
        AND inc.resolved_by NOT IN ('')
        AND inc.assignment_group NOT IN ('')
        AND EXISTS (SELECT 1 FROM d_analista da WHERE da.id = inc.resolved_by)
        AND EXISTS (SELECT 1 FROM d_fila df WHERE df.id = inc.assignment_group)
    ) AS source
    ON (target.resolved_by_id = source.resolved_by_id 
        AND target.assignment_group_id = source.assignment_group_id)
    WHEN NOT MATCHED THEN
        INSERT (resolved_by_id, assignment_group_id)
        VALUES (source.resolved_by_id, source.assignment_group_id);

    -- Inserir ou atualizar Incidents
    MERGE dw_analytics.f_incident AS target
    USING (
        SELECT 
            i.number AS id,
            rb.id AS resolved_by_id,
            i.opened_at,
            i.closed_at,
            c.id AS contract_id,
            CASE 
                WHEN sla_atend.has_breached = 0 THEN 1 
                ELSE 0 
            END AS sla_atendimento,
            CASE 
                WHEN sla_resol.has_breached = 0 THEN 1 
                ELSE 0 
            END AS sla_resolucao,
            i.company,
            i.u_origem,
            i.category AS dv_u_categoria_falha,
            i.subcategory AS dv_u_sub_categoria_da_falha,
            i.u_detail AS dv_u_detalhe_sub_categoria_da_falha
        FROM [SERVICE NOW].incident i
        LEFT JOIN dw_analytics.d_resolved_by rb ON rb.dv_resolved_by = i.resolved_by
        LEFT JOIN dw_analytics.d_contract c ON c.dv_contract = i.contract
        LEFT JOIN [SERVICE NOW].incident_sla sla_atend 
            ON i.number = sla_atend.incident_number 
            AND sla_atend.dv_sla = 'First Response Time'
        LEFT JOIN [SERVICE NOW].incident_sla sla_resol 
            ON i.number = sla_resol.incident_number 
            AND sla_resol.dv_sla = 'Resolution Time'
        /* Filtro para atualização incremental - descomentar após carga inicial
        WHERE 
            i.opened_at >= @data_corte
            OR i.closed_at >= @data_corte
            OR i.sys_updated_on >= @data_corte  -- Opcional: considerar também atualizações gerais
        */
    ) AS source
    ON target.id = source.id
    WHEN MATCHED THEN
        UPDATE SET
            resolved_by_id = source.resolved_by_id,
            opened_at = source.opened_at,
            closed_at = source.closed_at,
            contract_id = source.contract_id,
            sla_atendimento = source.sla_atendimento,
            sla_resolucao = source.sla_resolucao,
            company = source.company,
            u_origem = source.u_origem,
            dv_u_categoria_falha = source.dv_u_categoria_falha,
            dv_u_sub_categoria_da_falha = source.dv_u_sub_categoria_da_falha,
            dv_u_detalhe_sub_categoria_da_falha = source.dv_u_detalhe_sub_categoria_da_falha
    WHEN NOT MATCHED THEN
        INSERT (
            id, resolved_by_id, opened_at, closed_at, contract_id, 
            sla_atendimento, sla_resolucao, company, u_origem,
            dv_u_categoria_falha, dv_u_sub_categoria_da_falha, dv_u_detalhe_sub_categoria_da_falha
        )
        VALUES (
            source.id, source.resolved_by_id, source.opened_at, source.closed_at, 
            source.contract_id, source.sla_atendimento, source.sla_resolucao, 
            source.company, source.u_origem, source.dv_u_categoria_falha,
            source.dv_u_sub_categoria_da_falha, source.dv_u_detalhe_sub_categoria_da_falha
        );

    -- Atualizar Sorted Tickets para chamados fechados
    INSERT INTO dw_analytics.d_sorted_ticket (incident_id, mes_ano)
    SELECT 
        i.id,
        FORMAT(i.closed_at, 'yyyy-MM') as mes_ano
    FROM dw_analytics.f_incident i
    LEFT JOIN dw_analytics.d_sorted_ticket st ON 
        st.incident_id = i.id AND 
        st.mes_ano = FORMAT(i.closed_at, 'yyyy-MM')
    WHERE 
        i.closed_at IS NOT NULL AND
        st.id IS NULL;

END;
GO

-- Comentário explicativo sobre a atualização incremental
/*
NOTAS SOBRE ATUALIZAÇÃO INCREMENTAL:

1. Na primeira execução, rodar sem os filtros para carregar todo o histórico
2. Nas execuções subsequentes, descomentar os filtros para processamento incremental
3. O período de 10 dias pode ser ajustado conforme necessidade
4. Considerar adicionar índices em opened_at, closed_at e sys_updated_on na tabela fonte
5. Monitorar performance e ajustar conforme necessário
*/
