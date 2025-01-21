# Módulo Docs

## Visão Geral
O módulo `docs` gerencia a documentação do sistema, utilizando MkDocs para gerar documentação estática.

## Estrutura do Módulo
```
docs/
├── backend/
├── frontend/
├── manual/
└── mkdocs.yml
```

## Funcionalidades

### Documentação Estática
- Geração automática via MkDocs
- Integração com Django para servir documentação

### Controle de Acesso
- Acesso restrito a usuários staff
- Proxy de documentação via API

### Tipos de Documentação
1. **Manual do Usuário**
   - Guias de uso
   - Tutoriais
   
2. **Documentação Técnica**
   - Backend
   - Frontend
   - APIs

## Configuração
- Build automático
- Servido através do Django
- Proteção de rotas
