CREATE OR ALTER PROCEDURE sp_etl_incidents
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Variável para controle de atualização incremental
    -- DECLARE @data_corte DATETIME = DATEADD(DAY, -10, GETDATE())
    
    -- Inserir ou atualizar Assignment Groups
    MERGE d_assignment_group AS target
    USING (
        SELECT DISTINCT assignment_group AS id, dv_assignment_group
        FROM (
            SELECT 
                assignment_group, 
                dv_assignment_group,
                ROW_NUMBER() OVER (PARTITION BY assignment_group ORDER BY (SELECT NULL)) AS rn
            FROM SERVICENOW.dbo.incident inc
            WHERE assignment_group IS NOT NULL
            AND assignment_group NOT IN ('')
        ) AS SubQuery
        WHERE rn = 1
    ) AS source
    ON target.id = source.id
    WHEN NOT MATCHED THEN
        INSERT (id, dv_assignment_group)
        VALUES (source.id, source.dv_assignment_group);

    -- Inserir ou atualizar Resolved By
    MERGE d_resolved_by AS target
    USING (
        SELECT DISTINCT resolved_by AS id, dv_resolved_by
        FROM (
            SELECT 
                resolved_by, 
                dv_resolved_by,
                ROW_NUMBER() OVER (PARTITION BY resolved_by ORDER BY (SELECT NULL)) AS rn
            FROM SERVICENOW.dbo.incident inc
            WHERE resolved_by IS NOT NULL
            AND resolved_by NOT IN ('')
        ) AS SubQuery
        WHERE rn = 1
    ) AS source
    ON target.id = source.id
    WHEN NOT MATCHED THEN
        INSERT (id, dv_resolved_by)
        VALUES (source.id, source.dv_resolved_by);

    -- Inserir ou atualizar Contract
    MERGE d_contract AS target
    USING (
        SELECT DISTINCT contract
        FROM SERVICENOW.dbo.incident inc
        WHERE contract IS NOT NULL
        AND contract NOT IN ('')
        AND EXISTS (SELECT 1 FROM d_contract dc WHERE dc.id = inc.contract)
    ) AS source (dv_contract)
    ON target.dv_contract = source.dv_contract
    WHEN NOT MATCHED THEN
        INSERT (dv_contract)
        VALUES (source.dv_contract);

    -- Inserir ou atualizar Company
    MERGE d_company AS target
    USING (
        SELECT DISTINCT company, company_cnpj
        FROM SERVICENOW.dbo.incident inc
        WHERE company IS NOT NULL
        AND company NOT IN ('')
        AND EXISTS (SELECT 1 FROM d_company dco WHERE dco.id = inc.company)
    ) AS source (dv_company, u_cnpj)
    ON target.dv_company = source.dv_company
    WHEN NOT MATCHED THEN
        INSERT (dv_company, u_cnpj)
        VALUES (source.dv_company, source.u_cnpj);

    -- Relacionamento Resolved By - Assignment Group
    INSERT INTO d_resolved_by_assignment_group (id, resolved_by_id, assignment_group_id)
    SELECT NEWID() AS ID, resolved_by_id, assignment_group_id
    FROM (
        SELECT 
            rb.id AS resolved_by_id,
            ag.id AS assignment_group_id,
            ROW_NUMBER() OVER (PARTITION BY rb.id, ag.id ORDER BY (SELECT NULL)) AS rn
        FROM SERVICENOW.dbo.incident inc
        JOIN d_resolved_by rb ON rb.dv_resolved_by = inc.resolved_by
        JOIN d_assignment_group ag ON ag.dv_assignment_group = inc.assignment_group
        WHERE inc.resolved_by IS NOT NULL
        AND inc.assignment_group IS NOT NULL
        AND inc.resolved_by NOT IN ('')
        AND inc.assignment_group NOT IN ('')
    ) AS SubQuery
    WHERE rn = 1;

    -- Inserir ou atualizar Incidents na tabela fato
    MERGE f_incident AS target
    USING (
        SELECT
            inc.sys_id AS id,
            inc.number,
            inc.sys_created_on,
            inc.sys_updated_on,
            inc.opened_at,
            inc.closed_at,
            inc.resolved_at,
            inc.state,
            inc.priority,
            inc.impact,
            inc.urgency,
            inc.incident_state,
            inc.short_description,
            inc.description,
            inc.close_notes,
            inc.assigned_to,
            inc.assignment_group,
            inc.resolved_by,
            inc.contract,
            inc.company,
            MAX(CASE WHEN sla.dv_sla LIKE '%VITA] FIRST' THEN sla.has_breached ELSE NULL END) AS sla_atendimento,
            MAX(CASE WHEN sla.dv_sla LIKE '%VITA] RESOLVED' THEN sla.has_breached ELSE NULL END) AS sla_resolucao
        FROM SERVICENOW.dbo.incident inc
        LEFT JOIN SERVICENOW.dbo.incident_sla sla ON sla.task = inc.sys_id
        WHERE inc.sys_id IS NOT NULL
        GROUP BY
            inc.sys_id,
            inc.number,
            inc.sys_created_on,
            inc.sys_updated_on,
            inc.opened_at,
            inc.closed_at,
            inc.resolved_at,
            inc.state,
            inc.priority,
            inc.impact,
            inc.urgency,
            inc.incident_state,
            inc.short_description,
            inc.description,
            inc.close_notes,
            inc.assigned_to,
            inc.assignment_group,
            inc.resolved_by,
            inc.contract,
            inc.company
    ) AS source
    ON target.id = source.id
    WHEN MATCHED THEN
        UPDATE SET
            number = source.number,
            sys_created_on = source.sys_created_on,
            sys_updated_on = source.sys_updated_on,
            opened_at = source.opened_at,
            closed_at = source.closed_at,
            resolved_at = source.resolved_at,
            state = source.state,
            priority = source.priority,
            impact = source.impact,
            urgency = source.urgency,
            incident_state = source.incident_state,
            short_description = source.short_description,
            description = source.description,
            close_notes = source.close_notes,
            assigned_to = source.assigned_to,
            assignment_group = source.assignment_group,
            resolved_by = source.resolved_by,
            contract = source.contract,
            company = source.company,
            sla_atendimento = source.sla_atendimento,
            sla_resolucao = source.sla_resolucao
    WHEN NOT MATCHED THEN
        INSERT (id, number, sys_created_on, sys_updated_on, opened_at, closed_at, resolved_at, state, priority, impact, urgency, incident_state, short_description, description, close_notes, assigned_to, assignment_group, resolved_by, contract, company, sla_atendimento, sla_resolucao)
        VALUES (source.id, source.number, source.sys_created_on, source.sys_updated_on, source.opened_at, source.closed_at, source.resolved_at, source.state, source.priority, source.impact, source.urgency, source.incident_state, source.short_description, source.description, source.close_notes, source.assigned_to, source.assignment_group, source.resolved_by, source.contract, source.company, source.sla_atendimento, source.sla_resolucao);

    -- Atualizar Sorted Tickets para chamados fechados
    INSERT INTO d_sorted_ticket (incident_id, mes_ano)
    SELECT 
        i.id,
        FORMAT(i.closed_at, 'yyyy-MM') as mes_ano
    FROM f_incident i
    LEFT JOIN d_sorted_ticket st ON 
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
