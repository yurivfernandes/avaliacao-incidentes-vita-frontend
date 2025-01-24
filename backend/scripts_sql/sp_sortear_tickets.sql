CREATE OR ALTER PROCEDURE dw_analytics.sp_sortear_tickets
    @data_sorteio VARCHAR(7)
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @ano INT = CAST(LEFT(@data_sorteio, 4) AS INT)
    DECLARE @mes INT = CAST(RIGHT(@data_sorteio, 2) AS INT)

    -- Validar formato da data
    IF @data_sorteio NOT LIKE '[0-9][0-9][0-9][0-9]-[0-9][0-9]'
    BEGIN
        RAISERROR('Formato de data inválido. Use YYYY-MM', 16, 1)
        RETURN
    END

    -- Tabela temporária com índice clustered para melhor performance
    CREATE TABLE #tickets_sorteados (
        incident_id NVARCHAR(50),
        mes_ano VARCHAR(7),
        resolved_by_id INT,
        assignment_group_id INT,
        CONSTRAINT PK_tickets_temp PRIMARY KEY CLUSTERED (incident_id)
    )

    -- Processar cada combinação única de técnico e fila
    INSERT INTO #tickets_sorteados (incident_id, mes_ano, resolved_by_id, assignment_group_id)
    SELECT DISTINCT
        i.id,
        @data_sorteio,
        i.resolved_by_id,
        rbag.assignment_group_id
    FROM dw_analytics.d_premissas p
    INNER JOIN dw_analytics.d_resolved_by_assignment_group rbag 
        ON rbag.assignment_group_id = p.assignment_id
    INNER JOIN dw_analytics.f_incident i 
        ON i.resolved_by_id = rbag.resolved_by_id
    WHERE 
        YEAR(i.closed_at) = @ano
        AND MONTH(i.closed_at) = @mes
        AND i.closed_at IS NOT NULL
        AND i.company <> 'VITA IT - SP'
        AND i.u_origem <> 'vita_it'
        AND NOT EXISTS (
            SELECT 1 
            FROM dw_analytics.d_sorted_ticket st 
            WHERE st.incident_id = i.id 
            AND st.mes_ano = @data_sorteio
        )
    ORDER BY NEWID()

    -- Aplicar as premissas de quantidade por fila
    ;WITH LimitedTickets AS (
        SELECT 
            ts.*,
            ROW_NUMBER() OVER (
                PARTITION BY ts.resolved_by_id, ts.assignment_group_id 
                ORDER BY NEWID()
            ) as RowNum,
            p.qtd_incidents as MaxTickets
        FROM #tickets_sorteados ts
        INNER JOIN dw_analytics.d_premissas p 
            ON p.assignment_id = ts.assignment_group_id
    )
    DELETE FROM LimitedTickets 
    WHERE RowNum > MaxTickets

    -- Inserir tickets sorteados na tabela final
    INSERT INTO dw_analytics.d_sorted_ticket (incident_id, mes_ano)
    SELECT incident_id, mes_ano
    FROM #tickets_sorteados

    -- Gerar resumo do sorteio
    SELECT 
        ag.dv_assignment_group AS Fila,
        rb.dv_resolved_by AS Tecnico,
        COUNT(ts.incident_id) AS Quantidade_Sorteada,
        p.qtd_incidents AS Quantidade_Esperada
    FROM dw_analytics.d_assignment_group ag
    INNER JOIN dw_analytics.d_premissas p 
        ON p.assignment_id = ag.id
    INNER JOIN dw_analytics.d_resolved_by_assignment_group rbag 
        ON rbag.assignment_group_id = ag.id
    INNER JOIN dw_analytics.d_resolved_by rb 
        ON rb.id = rbag.resolved_by_id
    LEFT JOIN #tickets_sorteados ts 
        ON ts.resolved_by_id = rb.id 
        AND ts.assignment_group_id = ag.id
    GROUP BY 
        ag.dv_assignment_group,
        rb.dv_resolved_by,
        p.qtd_incidents
    ORDER BY 
        ag.dv_assignment_group,
        rb.dv_resolved_by

    -- Limpar tabela temporária
    DROP TABLE #tickets_sorteados
END
GO
