-- Script para criar tabelas e índices no schema dw_analytics
-- Este script cria as tabelas necessárias para armazenar dados de incidentes, grupos de atribuição, contratos, empresas, etc.

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
    dv_contract NVARCHAR(255) NOT NULL
)
GO

CREATE TABLE dw_analytics.d_resolved_by (
    id NVARCHAR(50) PRIMARY KEY,
    dv_resolved_by NVARCHAR(80) NOT NULL
)
GO

-- Tabela de relacionamento N:N entre resolved_by e assignment_group
CREATE TABLE dw_analytics.d_resolved_by_assignment_group (
    id INT IDENTITY(1,1) PRIMARY KEY,
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
    assignment_id NVARCHAR(50) NOT NULL,
    qtd_incidents INT NOT NULL,
    is_contrato_lancado BIT NOT NULL DEFAULT 1,
    is_horas_lancadas BIT NOT NULL DEFAULT 1,
    is_has_met_first_response_target BIT NOT NULL DEFAULT 1,
    is_resolution_target BIT NOT NULL DEFAULT 1,
    is_atualizaca_logs_correto BIT NOT NULL DEFAULT 1,
    is_ticket_encerrado_corretamente BIT NOT NULL DEFAULT 1,
    is_descricao_troubleshooting BIT NOT NULL DEFAULT 1,
    is_cliente_notificado BIT NOT NULL DEFAULT 1,
    is_category_correto BIT NOT NULL DEFAULT 1,
    CONSTRAINT FK_premissas_assignment FOREIGN KEY (assignment_id) 
        REFERENCES dw_analytics.d_assignment_group(id)
)
GO

-- Criar tabela fato
CREATE TABLE dw_analytics.f_incident (
    id INT IDENTITY(1,1) PRIMARY KEY,
    number NVARCHAR(255) UNIQUE NOT NULL,
    resolved_by NVARCHAR(255) NULL,
    assignment_group NVARCHAR(255) NULL,
    opened_at DATETIME NOT NULL,
    closed_at DATETIME NULL,
    contract NVARCHAR(255) NULL,
    sla_atendimento BIT NULL,
    sla_resolucao BIT NULL,
    company NVARCHAR(255) NULL,
    u_origem NVARCHAR(255) NULL,
    dv_u_categoria_da_falha NVARCHAR(255) NULL,
    dv_u_sub_categoria_da_falha NVARCHAR(255) NULL,
    dv_u_detalhe_sub_categoria_da_falha NVARCHAR(255) NULL
)
GO

-- Criar tabela de tickets sorteados
CREATE TABLE dw_analytics.d_sorted_ticket (
    id INT IDENTITY(1,1) PRIMARY KEY,
    incident_id NVARCHAR(255) NOT NULL,
    mes_ano NVARCHAR(7) NOT NULL,
    CONSTRAINT CK_mes_ano_format CHECK (mes_ano LIKE '[0-9][0-9][0-9][0-9]-[0-9][0-9]'),
    CONSTRAINT FK_sorted_incident FOREIGN KEY (incident_id) 
        REFERENCES dw_analytics.f_incident(number)
)
GO

-- Criar índices
CREATE INDEX IX_incident_opened_at ON dw_analytics.f_incident(opened_at)
CREATE INDEX IX_incident_closed_at ON dw_analytics.f_incident(closed_at)
CREATE INDEX IX_sorted_ticket_mes_ano ON dw_analytics.d_sorted_ticket(mes_ano)
CREATE INDEX IX_premissas_assignment ON dw_analytics.d_premissas(assignment_id)
CREATE INDEX IX_resolved_by_assignment ON dw_analytics.d_resolved_by_assignment_group(resolved_by_id, assignment_group_id)
GO
