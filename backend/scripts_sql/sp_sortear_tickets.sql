CREATE OR ALTER PROCEDURE dw_analytics.sp_sortear_tickets
    @data_sorteio VARCHAR(7)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @ano INT = CAST(LEFT(@data_sorteio, 4) AS INT)
    DECLARE @mes INT = CAST(RIGHT(@data_sorteio, 2) AS INT)

    -- Tabela temporária para armazenar os tickets sorteados
    CREATE TABLE #tickets_sorteados (
        incident_id NVARCHAR(50),
        mes_ano VARCHAR(7)
    )

    -- Cursor para processar cada premissa
    DECLARE @assignment_id INT
    DECLARE @qtd_incidents INT
    
    DECLARE cursor_premissas CURSOR FOR
    SELECT 
        assignment_id,
        qtd_incidents
    FROM dw_analytics.d_premissas

    OPEN cursor_premissas
    FETCH NEXT FROM cursor_premissas INTO @assignment_id, @qtd_incidents

    WHILE @@FETCH_STATUS = 0
    BEGIN
        -- Para cada técnico do assignment group
        DECLARE @resolved_by_id INT
        
        DECLARE cursor_tecnicos CURSOR FOR
        SELECT DISTINCT rb.id
        FROM dw_analytics.d_resolved_by rb
        JOIN dw_analytics.d_resolved_by_assignment_group rbag 
            ON rbag.resolved_by_id = rb.id
        WHERE rbag.assignment_group_id = @assignment_id

        OPEN cursor_tecnicos
        FETCH NEXT FROM cursor_tecnicos INTO @resolved_by_id

        WHILE @@FETCH_STATUS = 0
        BEGIN
            -- Insere na tabela temporária os tickets sorteados
            -- usando TABLESAMPLE para fazer o sorteio aleatório
            INSERT INTO #tickets_sorteados (incident_id, mes_ano)
            SELECT TOP (@qtd_incidents)
                i.id,
                @data_sorteio
            FROM dw_analytics.f_incident i
            WHERE i.resolved_by_id = @resolved_by_id
                AND YEAR(i.closed_at) = @ano
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
                AND EXISTS (
                    SELECT 1
                    FROM dw_analytics.d_resolved_by_assignment_group rbag
                    WHERE rbag.resolved_by_id = i.resolved_by_id
                    AND rbag.assignment_group_id = @assignment_id
                )
            ORDER BY NEWID()

            FETCH NEXT FROM cursor_tecnicos INTO @resolved_by_id
        END

        CLOSE cursor_tecnicos
        DEALLOCATE cursor_tecnicos

        FETCH NEXT FROM cursor_premissas INTO @assignment_id, @qtd_incidents
    END

    CLOSE cursor_premissas
    DEALLOCATE cursor_premissas

    -- Insere os tickets sorteados na tabela final
    INSERT INTO dw_analytics.d_sorted_ticket (incident_id, mes_ano)
    SELECT incident_id, mes_ano
    FROM #tickets_sorteados

    -- Gera o resumo do sorteio
    SELECT 
        ag.dv_assignment_group AS fila,
        rb.dv_resolved_by AS tecnico,
        COUNT(*) AS qtd_sorteados
    FROM #tickets_sorteados ts
    JOIN dw_analytics.f_incident i ON i.id = ts.incident_id
    JOIN dw_analytics.d_resolved_by rb ON rb.id = i.resolved_by_id
    JOIN dw_analytics.d_resolved_by_assignment_group rbag ON rbag.resolved_by_id = rb.id
    JOIN dw_analytics.d_assignment_group ag ON ag.id = rbag.assignment_group_id
    GROUP BY 
        ag.dv_assignment_group,
        rb.dv_resolved_by
    ORDER BY 
        ag.dv_assignment_group,
        rb.dv_resolved_by

    -- Limpa a tabela temporária
    DROP TABLE #tickets_sorteados
END
GO
