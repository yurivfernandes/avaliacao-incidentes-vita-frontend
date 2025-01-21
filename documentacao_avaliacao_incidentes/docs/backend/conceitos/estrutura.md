# Estrutura do Projeto

## Organização de Diretórios

```
backend/
├── app/                    # Configurações principais
│   ├── settings.py        # Similar ao appsettings.json
│   ├── urls.py            # Rotas principais
│   └── wsgi.py            # Configuração de deploy
├── access/                # Módulo de autenticação
│   ├── models/           # Models do módulo
│   ├── api/              # Endpoints da API
│   │   ├── views/       # Similar aos Controllers
│   │   └── serializers/ # Similar aos DTOs
│   └── migrations/      # Similar às Migrations do EF
├── inventario/           # Módulo de inventário
├── incidentes/          # Módulo de incidentes
├── manage.py            # CLI do Django
└── requirements.txt     # Dependências do projeto
```

## Paralelo com Estrutura C#/ASP.NET

| Django | ASP.NET Core |
|--------|--------------|
| app/ | Startup.cs + Program.cs |
| settings.py | appsettings.json |
| urls.py | Startup.Configure() |
| models/ | Models/ |
| api/views/ | Controllers/ |
| api/serializers/ | DTOs/ |
| migrations/ | Migrations/ |

## Módulos Principais

### 1. App (Configuração)
- Configurações globais
- Rotas principais
- Middleware
- Similar ao projeto principal do ASP.NET Core

### 2. Access (Autenticação)
- Gestão de usuários
- Autenticação
- Permissões
- Similar ao Identity no ASP.NET Core

### 3. Inventário
- Gestão de itens
- Categorias
- Movimentações
- Similar a um módulo de domínio no DDD

### 4. Incidentes
- Registro de ocorrências
- Acompanhamento
- Relatórios
- Similar a um módulo de serviço no DDD

## Organização de Código

### Models
```python
# Django
models/
├── __init__.py
├── cliente.py
└── pedido.py
```

```csharp
// C# Equivalente
Models/
├── Cliente.cs
└── Pedido.cs
```

### Views (Controllers)
```python
# Django
api/views/
├── __init__.py
├── cliente_views.py
└── pedido_views.py
```

```csharp
// C# Equivalente
Controllers/
├── ClienteController.cs
└── PedidoController.cs
```

## Boas Práticas

1. **Separação de Responsabilidades**
   - Models apenas com lógica de dados
   - Views apenas com lógica de controle
   - Serializers para transformação de dados

2. **Organização de Imports**
   - Imports da stdlib primeiro
   - Imports de terceiros depois
   - Imports locais por último

3. **Nomenclatura**
   - Models: singular, PascalCase
   - Views: plural, snake_case
   - URLs: plural, kebab-case

4. **Módulos**
   - Autocontidos
   - Baixo acoplamento
   - Alta coesão

## Detalhamento dos Módulos

### Módulo Inventário
```
inventario/
├── api/
│   ├── serializers/      # DTOs para API
│   │   ├── __init__.py
│   │   ├── cliente.py    # Serialização de clientes
│   │   ├── site.py       # Serialização de sites
│   │   └── equipamento.py # Serialização de equipamentos
│   ├── views/           # Controllers da API
│   │   ├── __init__.py
│   │   ├── cliente_views.py
│   │   ├── site_views.py
│   │   └── equipamento_views.py
│   └── urls.py          # Rotas da API
├── models/              # Models do módulo
│   ├── __init__.py
│   ├── cliente.py      # Model de Cliente
│   ├── site.py         # Model de Site
│   └── equipamento.py  # Model de Equipamento
└── migrations/         # Migrações do banco
    ├── __init__.py
    └── 0001_initial.py
```

#### Equivalente em C#/ASP.NET
```
Inventario/
├── Controllers/        # Similar às views do Django
│   ├── ClienteController.cs
│   ├── SiteController.cs
│   └── EquipamentoController.cs
├── Models/
│   ├── Cliente.cs
│   ├── Site.cs
│   └── Equipamento.cs
├── DTOs/              # Similar aos serializers
│   ├── ClienteDTO.cs
│   └── SiteDTO.cs
└── Migrations/        # Migrations do EF
```

### Módulo Incidentes
```
incidentes/
├── api/
│   ├── serializers/
│   │   ├── __init__.py
│   │   └── incidente_serializer.py
│   ├── views/
│   │   ├── __init__.py
│   │   └── incidente_view.py
│   └── urls.py
├── models/
│   ├── __init__.py
│   └── incidente.py
└── migrations/
    ├── __init__.py
    └── 0001_initial.py
```

#### Equivalente em C#/ASP.NET
```
Incidentes/
├── Controllers/
│   └── IncidentesController.cs
├── Models/
│   └── Incidente.cs
├── DTOs/
│   └── IncidenteDTO.cs
└── Migrations/
```

## Responsabilidades dos Diretórios

### api/serializers/
- Conversão de models para JSON e vice-versa
- Validação de dados da API
- Similar aos DTOs em C#

### api/views/
- Lógica de negócios da API
- Manipulação de requisições HTTP
- Similar aos Controllers em C#

### models/
- Definição das entidades
- Lógica de domínio
- Similar aos Models em C#

### migrations/
- Versionamento do banco de dados
- Alterações no esquema
- Similar às Migrations do Entity Framework

## Arquivos Principais

### __init__.py
- Define um diretório como pacote Python
- Permite importação de módulos
- Sem equivalente direto em C#

### urls.py
```python
# Django
urlpatterns = [
    path('clientes/', views.cliente_list),
    path('clientes/<int:pk>/', views.cliente_detail),
]
```

```csharp
// C# Equivalente
app.MapControllerRoute(
    name: "clientes",
    pattern: "clientes/{id?}",
    defaults: new { controller = "Clientes", action = "Index" }
);
```
