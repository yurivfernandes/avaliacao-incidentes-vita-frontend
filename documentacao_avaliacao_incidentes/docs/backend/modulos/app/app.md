# Módulo App

## Visão Geral
O módulo `app` é o módulo principal do projeto Django, responsável pelas configurações globais do sistema.

## Estrutura do Módulo
```
app/
├── __init__.py
├── settings.py
├── urls.py
└── wsgi.py
```

## Arquivos Principais

### settings.py
Arquivo de configurações do Django contendo:
- Configurações de banco de dados
- Middleware
- Apps instalados
- Configurações de segurança
- Configurações de CORS
- Configurações do REST Framework

### urls.py
Arquivo de roteamento principal que inclui:
- Rotas administrativas
- Rotas da API
- Rotas de documentação

### wsgi.py
Arquivo de configuração para deploy em servidores WSGI.

## Configurações Importantes

### Banco de Dados
Suporte para:
- SQLite (desenvolvimento)
- SQL Server (produção)

### Segurança
- Token Authentication
- CSRF Protection
- CORS Configuration

### REST Framework
- Paginação
- Filtros
- Autenticação via Token
- Permissões
