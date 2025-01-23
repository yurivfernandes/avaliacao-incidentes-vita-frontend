-- Criar schema
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'dw_analytics')
BEGIN
    EXEC('CREATE SCHEMA dw_analytics')
END
GO

-- Tabela d_assignment_group
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'd_assignment_group' AND schema_id = SCHEMA_ID('dw_analytics'))
BEGIN
    CREATE TABLE dw_analytics.d_assignment_group (
        id INT IDENTITY(1,1) PRIMARY KEY,
        dv_assignment_group NVARCHAR(50)
    )
END
GO

-- Tabela d_company
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'd_company' AND schema_id = SCHEMA_ID('dw_analytics'))
BEGIN
    CREATE TABLE dw_analytics.d_company (
        id INT IDENTITY(1,1) PRIMARY KEY,
        dv_company NVARCHAR(50),
        u_cnpj NVARCHAR(14)
    )
END
GO

-- Tabela d_contract
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'd_contract' AND schema_id = SCHEMA_ID('dw_analytics'))
BEGIN
    CREATE TABLE dw_analytics.d_contract (
        id INT IDENTITY(1,1) PRIMARY KEY,
        dv_contract NVARCHAR(150)
    )
END
GO

-- Tabela d_resolved_by
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'd_resolved_by' AND schema_id = SCHEMA_ID('dw_analytics'))
BEGIN
    CREATE TABLE dw_analytics.d_resolved_by (
        id INT IDENTITY(1,1) PRIMARY KEY,
        dv_resolved_by NVARCHAR(80)
    )
END
GO

-- Tabela de relacionamento resolved_by_assignment_group
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'd_resolved_by_assignment_group' AND schema_id = SCHEMA_ID('dw_analytics'))
BEGIN
    CREATE TABLE dw_analytics.d_resolved_by_assignment_group (
        id INT IDENTITY(1,1) PRIMARY KEY,
        resolved_by_id INT,
        assignment_group_id INT,
        FOREIGN KEY (resolved_by_id) REFERENCES dw_analytics.d_resolved_by(id),
        FOREIGN KEY (assignment_group_id) REFERENCES dw_analytics.d_assignment_group(id)
    )
END
GO

-- Tabela d_premissas
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'd_premissas' AND schema_id = SCHEMA_ID('dw_analytics'))
BEGIN
    CREATE TABLE dw_analytics.d_premissas (
        id INT IDENTITY(1,1) PRIMARY KEY,
        assignment_id INT NOT NULL,
        qtd_incidents INT NOT NULL,
        FOREIGN KEY (assignment_id) REFERENCES dw_analytics.d_assignment_group(id)
    )
END
GO

-- Tabela f_incident
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'f_incident' AND schema_id = SCHEMA_ID('dw_analytics'))
BEGIN
    CREATE TABLE dw_analytics.f_incident (
        id NVARCHAR(50) PRIMARY KEY,
        resolved_by_id INT,
        opened_at DATETIME,
        closed_at DATETIME,
        contract_id INT,
        sla_atendimento BIT,
        sla_resolucao BIT,
        company NVARCHAR(150),
        u_origem NVARCHAR(150),
        dv_u_categoria_falha NVARCHAR(150),
        dv_u_sub_categoria_da_falha NVARCHAR(150),
        dv_u_detalhe_sub_categoria_da_falha NVARCHAR(150),
        FOREIGN KEY (resolved_by_id) REFERENCES dw_analytics.d_resolved_by(id),
        FOREIGN KEY (contract_id) REFERENCES dw_analytics.d_contract(id)
    )
END
GO

-- Tabela d_sorted_ticket
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'd_sorted_ticket' AND schema_id = SCHEMA_ID('dw_analytics'))
BEGIN
    CREATE TABLE dw_analytics.d_sorted_ticket (
        id INT IDENTITY(1,1) PRIMARY KEY,
        incident_id INT,
        mes_ano NVARCHAR(7),
        FOREIGN KEY (incident_id) REFERENCES dw_analytics.f_incident(id)
    )
END
GO

-- Adicionar índices para melhor performance
CREATE INDEX IX_incident_opened_at ON dw_analytics.f_incident(opened_at)
CREATE INDEX IX_incident_closed_at ON dw_analytics.f_incident(closed_at)
CREATE INDEX IX_sorted_ticket_mes_ano ON dw_analytics.d_sorted_ticket(mes_ano)
CREATE INDEX IX_premissas_assignment ON dw_analytics.d_premissas(assignment_id)
GO
