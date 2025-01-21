# Backend do Sistema

## Visão Geral
O backend do sistema foi desenvolvido utilizando Python com Django, uma combinação poderosa para desenvolvimento web. Se você vem do mundo C#, pode considerar o Django como algo similar ao ASP.NET Core.

## Por Onde Começar

1. **Novo no Python e Django?**
   - Comece pela seção "Preparação do Ambiente"
   - Siga o passo a passo de instalação do Python
   - Configure seu ambiente de desenvolvimento

2. **Familiarizado com C#/ASP.NET?**
   - Veja nossos paralelos entre Django e ASP.NET
   - Entenda as diferenças principais
   - Aproveite seu conhecimento existente

3. **Quer Entender a Estrutura?**
   - Explore a seção "Conceitos"
   - Veja como o projeto está organizado
   - Entenda o fluxo de dados

## Estrutura da Documentação

1. **Preparação do Ambiente**
   - Como instalar o Python
   - Como configurar o projeto
   - Configuração do VS Code

2. **Tecnologias**
   - Django Framework
   - Django REST Framework
   - Outros pacotes importantes

3. **Conceitos Fundamentais**
   - Models e Banco de Dados
   - Sistema de Migrations
   - Estrutura do Projeto

4. **Módulos do Sistema**
   - Access (Autenticação)
   - App (Configurações)

## Tecnologias Utilizadas

### Django Framework
[Django](https://www.djangoproject.com/) é um framework web Python de alto nível que incentiva o desenvolvimento rápido e limpo. Construído por desenvolvedores experientes, ele cuida de grande parte do trabalho de desenvolvimento web, permitindo que você se concentre em escrever seu aplicativo sem precisar reinventar a roda.

#### Principais Características
- ORM poderoso para abstração do banco de dados
- Interface administrativa automática
- Sistema de templates sofisticado
- Framework de formulários
- Sistema de autenticação
- Sistema de cache
- Internacionalização

### Django REST Framework
[DRF](https://www.django-rest-framework.org/) é um kit de ferramentas poderoso e flexível para construir APIs Web em Django.

#### Recursos Principais
- Interface web navegável da API
- Políticas de autenticação incluindo OAuth1a e OAuth2
- Serialização que suporta ORM e fontes de dados não-ORM
- Documentação automática da API

## Instalação do Ambiente

### 1. Instalando o Python

#### Windows
1. Acesse [python.org](https://www.python.org/downloads/)
2. Baixe a versão mais recente do Python (3.8 ou superior)
3. Execute o instalador
4. **IMPORTANTE:** Marque a opção "Add Python to PATH"
5. Clique em "Install Now"

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install python3 python3-pip python3-venv
```

#### macOS
1. Instale o [Homebrew](https://brew.sh/):
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```
2. Instale o Python:
```bash
brew install python
```

### 2. Verificando a Instalação
```bash
python --version
pip --version
```

## Conceitos Fundamentais do Django

### Models vs Tabelas do Banco

#### Models (Python)
```python
class Cliente(models.Model):
    nome = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
```

#### Tabela Gerada (SQL)
```sql
CREATE TABLE cliente (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(254) UNIQUE NOT NULL
);
```

### Sistema MTV (Model-Template-View)
- **Model**: Camada de dados
- **Template**: Camada de apresentação
- **View**: Camada de lógica de negócios

Similar ao MVC no C#, mas com nomenclatura diferente:
- Model (Django) = Model (C#)
- Template (Django) = View (C#)
- View (Django) = Controller (C#)

## Links de Documentação

### Core
- [Django](https://docs.djangoproject.com/en/4.2/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [Python](https://docs.python.org/3/)

### Pacotes Utilizados
- [django-cors-headers](https://github.com/adamchainz/django-cors-headers)
- [django-filter](https://django-filter.readthedocs.io/)
- [django-rest-knox](https://james1345.github.io/django-rest-knox/)
- [djangorestframework-simplejwt](https://django-rest-framework-simplejwt.readthedocs.io/)
- [drf-yasg](https://drf-yasg.readthedocs.io/)
- [polars](https://pola-rs.github.io/polars-book/)
- [python-dotenv](https://github.com/theskumar/python-dotenv)

## Configuração do Ambiente

### Pré-requisitos
- Python 3.8 ou superior (similar ao .NET SDK no C#)
- pip (gerenciador de pacotes do Python, similar ao NuGet)
- Git

### Passo a Passo de Instalação

1. **Clone o Repositório**
```bash
git clone https://github.com/seu-usuario/gestao-inventario.git
cd gestao-inventario
```

2. **Criar Ambiente Virtual** (similar ao conceito de Solution no Visual Studio)
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/Mac
python3 -m venv venv
source venv/bin/activate
```

> **Paralelo com C#**: O ambiente virtual no Python é similar a ter diferentes Solutions no Visual Studio, isolando dependências de projetos.

3. **Instalar Dependências**
```bash
pip install -r requirements.txt
```

> **Paralelo com C#**: Similar ao `dotnet restore` ou restaurar pacotes NuGet no Visual Studio.

4. **Configurar Banco de Dados**
```bash
python manage.py migrate
```

> **Paralelo com C#**: Similar ao `Update-Database` no Entity Framework.

5. **Criar Superusuário**
```bash
python manage.py createsuperuser
```

6. **Rodar o Projeto**
```bash
python manage.py runserver
```

> **Paralelo com C#**: Similar ao `dotnet run` ou F5 no Visual Studio.

## Sistema de Migrations

O Django usa migrations para controlar as alterações no banco de dados, similar ao Entity Framework no C#.

### Comandos Básicos

#### Django (Python)
```bash
# Criar migrations
python manage.py makemigrations

# Aplicar migrations
python manage.py migrate

# Ver SQL gerado
python manage.py sqlmigrate app_name 0001

# Listar migrations
python manage.py showmigrations
```

#### C# (Entity Framework)
```powershell
# Criar migration
Add-Migration InitialCreate

# Aplicar migration
Update-Database

# Ver SQL gerado
Script-Migration
```

#### SQL Puro
```sql
-- Criar tabela de controle manual
CREATE TABLE __MigrationHistory (
    MigrationId nvarchar(150) PRIMARY KEY,
    AppliedOn datetime NOT NULL
);

-- Executar migrations manualmente
INSERT INTO __MigrationHistory (MigrationId, AppliedOn)
VALUES ('20240117_InitialCreate', GETDATE());
```

### Como as Migrations Funcionam

1. **Detecção de Mudanças**
   - Django: Compara models com estado do banco
   - C#/EF: Compara models com snapshot
   - SQL: Manual

2. **Geração de Migrations**
   - Django: Arquivos Python na pasta migrations/
   - C#/EF: Arquivos C# na pasta Migrations/
   - SQL: Scripts SQL numerados

3. **Aplicação**
   - Django: Executa migrations em ordem
   - C#/EF: Executa migrations em ordem
   - SQL: Execução manual dos scripts

### Exemplos Práticos

#### Django (Python)
```python
# 0001_initial.py
class Migration(migrations.Migration):
    operations = [
        migrations.CreateModel(
            name='Incidente',
            fields=[
                ('id', models.AutoField(primary_key=True)),
                ('descricao', models.TextField()),
            ],
        ),
    ]
```
## Módulos Instalados

### Frameworks Base
1. **Django (4.2.10)**
   - Framework web principal
   - Similar ao ASP.NET Core no C#
   - Responsável por:
     - Roteamento
     - ORM
     - Admin interface
     - Sistema de templates

2. **Django Rest Framework (3.14.0)**
   - Framework para APIs REST
   - Similar ao ASP.NET Core Web API
   - Features:
     - Serialização
     - Autenticação via token
     - ViewSets e Routers
     - Documentação automática

### Segurança e Autenticação
1. **Django CORS Headers**
   - Gerencia CORS (Cross-Origin Resource Sharing)
   - Similar ao `services.AddCors()` no ASP.NET Core

2. **Django Rest Knox**
   - Autenticação via tokens
   - Similar ao JWT Bearer no ASP.NET Core

### Banco de Dados e ORM
1. **psycopg2-binary**
   - Driver PostgreSQL
   - Similar ao SQL Server Provider no Entity Framework

### Processamento de Dados
1. **polars**
   - Biblioteca para análise de dados
   - Similar ao LINQ no C#

### Documentação
1. **MkDocs**
   - Geração de documentação
   - Similar ao DocFX no .NET

## Estrutura do Projeto

```
backend/
├── app/                    # Configurações principais (similar ao Startup.cs)
│   ├── settings.py        # Configurações do Django (similar ao appsettings.json)
│   └── urls.py            # Rotas principais (similar ao Program.cs)
├── access/                # Módulo de autenticação
└── manage.py            # CLI do Django (similar ao dotnet CLI)
```

## Comandos Úteis

### Django
```bash
# Criar migrações (similar ao Add-Migration no EF)
python manage.py makemigrations

# Aplicar migrações (similar ao Update-Database no EF)
python manage.py migrate

# Criar superusuário
python manage.py createsuperuser

# Rodar servidor de desenvolvimento
python manage.py runserver
```

### Pip
```bash
# Instalar pacote (similar ao Install-Package no NuGet)
pip install nome_pacote

# Atualizar requirements.txt (similar ao dotnet add package)
pip freeze > requirements.txt
```

## Debug e Desenvolvimento

### VS Code
1. Instalar extensões:
   - Python
   - Django
   - Pylance

2. Configurar launch.json:
```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Django",
            "type": "python",
            "request": "launch",
            "program": "${workspaceFolder}/manage.py",
            "args": ["runserver"],
            "django": true
        }
    ]
}
```

> **Paralelo com C#**: Similar à configuração de debug no Visual Studio.

## Boas Práticas

### Organização de Código
- Views em arquivos separados (similar aos Controllers em C#)
- Models em módulo próprio (similar às Classes de Modelo em C#)
- URLs em arquivo dedicado (similar às rotas em C#)

### Padrões de Projeto
- ViewSets (similar aos Controllers)
- Serializers (similar aos DTOs)
- Managers (similar aos Services)
