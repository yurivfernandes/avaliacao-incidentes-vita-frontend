

-- Procedure para sorteio de tickets por fila
CREATE PROC PROC_SORTEAR_TICKETS_POR_FILA
    @assignment_group NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;

    -- Atualizar Sorted Tickets para todos os meses
    WITH IncidentesParaSorteio AS (
        SELECT 
            i.id,
            i.resolved_by,
            FORMAT(i.closed_at, 'yyyy-MM') as mes_ano,
            ROW_NUMBER() OVER (
                PARTITION BY i.resolved_by, FORMAT(i.closed_at, 'yyyy-MM')
                ORDER BY NEWID()
            ) as ordem_sorteio
        FROM dw_analytics.f_incident i
        LEFT JOIN dw_analytics.d_sorted_ticket st 
            ON st.incident_id = i.id 
            AND st.mes_ano = FORMAT(i.closed_at, 'yyyy-MM')
        INNER JOIN SERVICE_NOW.dbo.incident inc 
            ON i.number = inc.number
        WHERE 
            i.closed_at IS NOT NULL AND
            i.resolved_by IS NOT NULL AND
            inc.dv_state IN ('Encerrado', 'Closed') AND
            i.assignment_group = @assignment_group AND
            st.id IS NULL
    )
    INSERT INTO dw_analytics.d_sorted_ticket (incident_id, mes_ano)
    SELECT 
        id,
        mes_ano
    FROM IncidentesParaSorteio
    WHERE ordem_sorteio <= 5;  -- Número de tickets sorteados por analista por mês
END;