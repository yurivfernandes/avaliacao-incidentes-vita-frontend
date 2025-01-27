-- Script de Rollback (caso necessário)
USE master
GO

IF EXISTS (SELECT * FROM sys.tables WHERE name = 'd_sorted_ticket' AND schema_id = SCHEMA_ID('dw_analytics'))
    DROP TABLE dw_analytics.d_sorted_ticket
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'd_premissas' AND schema_id = SCHEMA_ID('dw_analytics'))
    DROP TABLE dw_analytics.d_premissas
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'f_incident' AND schema_id = SCHEMA_ID('dw_analytics'))
    DROP TABLE dw_analytics.f_incident
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'd_resolved_by_assignment_group' AND schema_id = SCHEMA_ID('dw_analytics'))
    DROP TABLE dw_analytics.d_resolved_by_assignment_group
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'd_resolved_by' AND schema_id = SCHEMA_ID('dw_analytics'))
    DROP TABLE dw_analytics.d_resolved_by
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'd_assignment_group' AND schema_id = SCHEMA_ID('dw_analytics'))
    DROP TABLE dw_analytics.d_assignment_group
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'd_contract' AND schema_id = SCHEMA_ID('dw_analytics'))
    DROP TABLE dw_analytics.d_contract
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'd_company' AND schema_id = SCHEMA_ID('dw_analytics'))
    DROP TABLE dw_analytics.d_company

IF EXISTS (SELECT * FROM sys.schemas WHERE name = 'dw_analytics')
    DROP SCHEMA dw_analytics
GO

-- Criar schema
CREATE SCHEMA dw_analytics
GO

-- Criar tabelas dimensões
CREATE TABLE dw_analytics.d_assignment_group (
    id NVARCHAR(50) PRIMARY KEY,
    dv_assignment_group NVARCHAR(50) NOT NULL,
    status BIT NOT NULL DEFAULT 1
)
GO

CREATE TABLE dw_analytics.d_company (
    id NVARCHAR(50) PRIMARY KEY,
    dv_company NVARCHAR(50) NOT NULL,
    u_cnpj NVARCHAR(14)
)
GO

CREATE TABLE dw_analytics.d_contract (
    id NVARCHAR(50) PRIMARY KEY,
    dv_contract NVARCHAR(150) NOT NULL
)
GO

CREATE TABLE dw_analytics.d_resolved_by (
    id NVARCHAR(50) PRIMARY KEY,
    dv_resolved_by NVARCHAR(80) NOT NULL
)
GO

-- Tabela de relacionamento N:N entre resolved_by e assignment_group
CREATE TABLE dw_analytics.d_resolved_by_assignment_group (
    id UNIQUEIDENTIFIER PRIMARY KEY,
    resolved_by_id NVARCHAR(50) NOT NULL,
    assignment_group_id NVARCHAR(50) NOT NULL,
    CONSTRAINT FK_resolved_by FOREIGN KEY (resolved_by_id) 
        REFERENCES dw_analytics.d_resolved_by(id),
    CONSTRAINT FK_assignment_group FOREIGN KEY (assignment_group_id) 
        REFERENCES dw_analytics.d_assignment_group(id)
)
GO

-- Criar tabela de premissas
CREATE TABLE dw_analytics.d_premissas (
    id INT IDENTITY(1,1) PRIMARY KEY,
    assignment_id INT NOT NULL,
    qtd_incidents INT NOT NULL,
    CONSTRAINT FK_premissas_assignment FOREIGN KEY (assignment_id) 
        REFERENCES dw_analytics.d_assignment_group(id)
)
GO

-- Criar tabela fato
CREATE TABLE dw_analytics.f_incident (
    id NVARCHAR(50) PRIMARY KEY,
    resolved_by_id NVARCHAR(50) NOT NULL,
    assignment_group_id NVARCHAR(50) NOT NULL,
    opened_at DATETIME NOT NULL,
    closed_at DATETIME,
    contract_id NVARCHAR(50) NOT NULL,
    sla_atendimento BIT NOT NULL,
    sla_resolucao BIT NOT NULL,
    company NVARCHAR(150) NOT NULL,
    u_origem NVARCHAR(150) NOT NULL,
    dv_u_categoria_falha NVARCHAR(150) NOT NULL,
    dv_u_sub_categoria_da_falha NVARCHAR(150) NOT NULL,
    dv_u_detalhe_sub_categoria_da_falha NVARCHAR(150) NOT NULL,
    CONSTRAINT FK_incident_resolved_by FOREIGN KEY (resolved_by_id) 
        REFERENCES dw_analytics.d_resolved_by(id),
    CONSTRAINT FK_incident_contract FOREIGN KEY (contract_id) 
        REFERENCES dw_analytics.d_contract(id),
    CONSTRAINT FK_incident_assignment_group FOREIGN KEY (assignment_group_id)
        REFERENCES dw_analytics.d_assignment_group(id)
)
GO

-- Criar tabela de tickets sorteados
CREATE TABLE dw_analytics.d_sorted_ticket (
    id INT IDENTITY(1,1) PRIMARY KEY,
    incident_id NVARCHAR(50) NOT NULL,
    mes_ano NVARCHAR(7) NOT NULL,
    CONSTRAINT CK_mes_ano_format CHECK (mes_ano LIKE '[0-9][0-9][0-9][0-9]-[0-9][0-9]'),
    CONSTRAINT FK_sorted_incident FOREIGN KEY (incident_id) 
        REFERENCES dw_analytics.f_incident(id)
)
GO

-- Criar índices
CREATE INDEX IX_incident_opened_at ON dw_analytics.f_incident(opened_at)
CREATE INDEX IX_incident_closed_at ON dw_analytics.f_incident(closed_at)
CREATE INDEX IX_sorted_ticket_mes_ano ON dw_analytics.d_sorted_ticket(mes_ano)
CREATE INDEX IX_premissas_assignment ON dw_analytics.d_premissas(assignment_id)
CREATE INDEX IX_resolved_by_assignment ON dw_analytics.d_resolved_by_assignment_group(resolved_by_id, assignment_group_id)
GO
