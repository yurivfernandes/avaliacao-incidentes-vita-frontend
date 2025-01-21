# Configuração do Projeto

## Ambiente Virtual

### Por que usar?
O ambiente virtual no Python é similar ao conceito de Solution no Visual Studio, isolando as dependências de cada projeto. Isso evita conflitos entre versões de pacotes de diferentes projetos.

### Criando o Ambiente Virtual
```bash
# Windows
python -m venv venv

# Linux/macOS
python3 -m venv venv
```

### Ativando o Ambiente
```bash
# Windows (CMD)
venv\Scripts\activate

# Windows (PowerShell)
.\venv\Scripts\Activate.ps1

# Linux/macOS
source venv/bin/activate
```

## Instalando Dependências

### Requirements.txt
Este arquivo é similar ao packages.config ou .csproj no C#, listando todas as dependências do projeto.

```bash
# Instalar todas as dependências
pip install -r requirements.txt

# Atualizar requirements.txt com novas dependências
pip freeze > requirements.txt
```

## Configuração do Banco de Dados

### Arquivo settings.py
Similar ao appsettings.json no ASP.NET Core, define as configurações do banco de dados:

```python
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",  # Para desenvolvimento
        "NAME": BASE_DIR / "db.sqlite3",
    },
    "sql_server": {
        "ENGINE": "mssql",
        "NAME": "nome_do_banco",
        "USER": "usuario",
        "PASSWORD": "senha",
        "HOST": "servidor",
    },
}
```

### Aplicando Migrations
```bash
# Criar migrations (similar ao Add-Migration)
python manage.py makemigrations

# Aplicar migrations (similar ao Update-Database)
python manage.py migrate
```

## Configuração do Django Admin

### Criando Superusuário
```bash
python manage.py createsuperuser
```

### Acessando o Admin
- URL: http://localhost:8000/admin/
- Use as credenciais do superusuário criado

## Executando o Projeto

### Servidor de Desenvolvimento
```bash
# Similar ao IIS Express no Visual Studio
python manage.py runserver

# Especificar porta
python manage.py runserver 8080
```

## Estrutura de Arquivos
```
projeto/
├── venv/                  # Ambiente virtual (similar a bin/obj no C#)
├── manage.py             # CLI do Django (similar ao Program.cs)
├── requirements.txt      # Dependências (similar ao packages.config)
└── app/                  # Código fonte
    ├── settings.py      # Configurações (similar ao appsettings.json)
    └── urls.py          # Rotas (similar ao Startup.cs)
```
