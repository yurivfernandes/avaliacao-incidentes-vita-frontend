# Tecnologias Utilizadas

## Visão Geral
Este projeto utiliza um conjunto moderno de tecnologias Python para desenvolvimento web, com foco em APIs REST. Para desenvolvedores vindos do mundo C#, fornecemos paralelos com tecnologias equivalentes do ecossistema .NET.

## Stack Principal

### Framework Web
- **Django**: Framework web full-stack
  - Similar ao ASP.NET Core
  - Inclui ORM, autenticação, admin
  - Focado em produtividade

### API REST
- **Django REST Framework (DRF)**
  - Similar ao ASP.NET Core Web API
  - Serialização automática
  - Documentação interativa

## Comparativo de Tecnologias

| Python/Django | C#/.NET | Função |
|--------------|---------|---------|
| Django | ASP.NET Core | Framework Web |
| Django REST Framework | ASP.NET Core Web API | API REST |
| Django ORM | Entity Framework | ORM |
| django-cors-headers | CORS Middleware | CORS |
| django-filter | LINQ | Filtros |
| djangorestframework-simplejwt | JWT Bearer | Autenticação |
| python-dotenv | User Secrets | Configurações |

## Pacotes Essenciais

### Core
- Django 4.2.10
- Django REST Framework 3.14.0
- django-cors-headers
- django-filter

### Banco de Dados
- psycopg2-binary (PostgreSQL)
- mssql-django (SQL Server)

### Processamento
- polars (análise de dados)
- validate-docbr (validação BR)

### Desenvolvimento
- python-dotenv
- black (formatação)
- pylint (linting)

## Como a Documentação está Organizada

1. **Django Framework**
   - Conceitos básicos
   - Comparação com ASP.NET Core
   - Exemplos práticos

2. **Django REST Framework**
   - APIs REST
   - Serialização
   - Autenticação

3. **Pacotes Utilizados**
   - Descrição detalhada
   - Como utilizar
   - Equivalentes em C#
