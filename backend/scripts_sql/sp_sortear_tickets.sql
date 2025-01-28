CREATE OR ALTER PROC PROC_SORTEAR_TICKETS
    @data_sorteio VARCHAR(7) = NULL  -- Formato: YYYY-MM
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Se não informada a data, usa mês anterior
    IF @data_sorteio IS NULL
    BEGIN
        SET @data_sorteio = FORMAT(DATEADD(MONTH, -1, GETDATE()), 'yyyy-MM')
    END

    -- Validar formato da data
    IF @data_sorteio NOT LIKE '[0-9][0-9][0-9][0-9]-[0-9][0-9]'
    BEGIN
        RAISERROR('Formato de data inválido. Use YYYY-MM', 16, 1)
        RETURN
    END

    -- Inserir tickets sorteados
    INSERT INTO dw_analytics.d_sorted_ticket (incident_id, mes_ano)
    SELECT 
        id,
        mes_ano
    FROM (
        SELECT 
            i.id,
            i.resolved_by,
            i.assignment_group,
            @data_sorteio as mes_ano,
            p.qtd_incidents,
            ROW_NUMBER() OVER (
                PARTITION BY i.resolved_by, i.assignment_group
                ORDER BY NEWID()
            ) as ordem_sorteio
        FROM dw_analytics.f_incident i
        INNER JOIN dw_analytics.d_premissas p 
            ON i.assignment_group = p.assignment_id
        LEFT JOIN dw_analytics.d_sorted_ticket st 
            ON st.incident_id = i.id 
            AND st.mes_ano = @data_sorteio
        INNER JOIN SERVICE_NOW.dbo.incident inc 
            ON i.number = inc.number
        WHERE 
            i.closed_at IS NOT NULL 
            AND i.resolved_by IS NOT NULL
            AND inc.dv_state IN ('Encerrado', 'Closed')
            AND FORMAT(i.closed_at, 'yyyy-MM') = @data_sorteio
            AND st.id IS NULL
            AND i.company <> 'VITA IT - SP'
            AND i.u_origem <> 'vita_it'
    ) AS IncidentesParaSorteio
    WHERE ordem_sorteio <= qtd_incidents;

    -- Retornar resumo do sorteio
    SELECT 
        ag.dv_assignment_group as fila,
        rb.dv_resolved_by as tecnico,
        COUNT(st.id) as qtd_sorteada,
        p.qtd_incidents as qtd_esperada
    FROM dw_analytics.d_assignment_group ag
    INNER JOIN dw_analytics.d_premissas p 
        ON p.assignment_id = ag.id
    INNER JOIN dw_analytics.f_incident i 
        ON i.assignment_group = ag.id
    INNER JOIN dw_analytics.d_resolved_by rb 
        ON rb.id = i.resolved_by
    LEFT JOIN dw_analytics.d_sorted_ticket st 
        ON st.incident_id = i.id 
        AND st.mes_ano = @data_sorteio
    WHERE FORMAT(i.closed_at, 'yyyy-MM') = @data_sorteio
    GROUP BY 
        ag.dv_assignment_group,
        rb.dv_resolved_by,
        p.qtd_incidents
    ORDER BY 
        ag.dv_assignment_group,
        rb.dv_resolved_by;
END;
GO
