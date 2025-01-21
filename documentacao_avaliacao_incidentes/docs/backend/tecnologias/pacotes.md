# Pacotes e Dependências

## Core: Web Framework

### Django
```python
Django==4.2.10  # Framework web principal
```
```csharp
// Equivalente C#
Install-Package Microsoft.AspNetCore
```

### Django REST Framework
```python
djangorestframework==3.14.0  # Framework API REST
django-filter==23.5         # Sistema de filtros
```
```csharp
// Equivalente C#
Install-Package Microsoft.AspNetCore.WebApi
Install-Package System.Linq.Dynamic.Core
```

## Autenticação e Segurança

### JWT e Token
```python
django-rest-knox==4.2.0           # Token authentication
djangorestframework-simplejwt==5.3.1  # JWT authentication
```
```csharp
// Equivalente C#
Install-Package Microsoft.AspNetCore.Authentication.JwtBearer
```

### CORS
```python
django-cors-headers==4.3.1  # CORS middleware
```
```csharp
// Equivalente C#
services.AddCors();  // Built-in no ASP.NET Core
```

## Banco de Dados

### PostgreSQL
```python
psycopg2-binary==2.9.9  # Driver PostgreSQL
```
```csharp
// Equivalente C#
Install-Package Npgsql.EntityFrameworkCore.PostgreSQL
```

### SQL Server
```python
mssql-django  # Driver SQL Server
```
```csharp
// Equivalente C#
Install-Package Microsoft.EntityFrameworkCore.SqlServer
```

## Processamento de Dados

### Análise de Dados
```python
polars==0.19.3  # Biblioteca de análise de dados
```
```csharp
// Equivalente C#
using System.Linq;  // LINQ built-in
Install-Package System.Linq.Dynamic.Core
```

## Validação e Utilidades

### Validação de Documentos
```python
validate-docbr==1.10.0  # Validação de documentos BR
```
```csharp
// Equivalente C#
// Normalmente implementado manualmente ou via Nuget específico
public class DocumentValidator
{
    public bool ValidateCPF(string cpf) { ... }
}
```

## Desenvolvimento

### Ambiente
```python
python-dotenv==1.0.1  # Variáveis de ambiente
```
```csharp
// Equivalente C#
Install-Package Microsoft.Extensions.Configuration.UserSecrets
```

### Documentação
```python
mkdocs==1.4.3           # Geração de documentação
mkdocs-material==9.0.5  # Tema Material para MkDocs
```
```csharp
// Equivalente C#
Install-Package docfx.console
```

## Gerenciamento de Dependências

### Instalação

#### Python/Django
```bash
# Instalar tudo
pip install -r requirements.txt

# Instalar pacote específico
pip install Django==4.2.10
```

#### C#/ASP.NET Core
```bash
# Instalar tudo
dotnet restore

# Instalar pacote específico
dotnet add package Microsoft.AspNetCore
```

### Atualização

#### Python/Django
```bash
# Atualizar requirements.txt
pip freeze > requirements.txt

# Verificar atualizações disponíveis
pip list --outdated
```

#### C#/ASP.NET Core
```bash
# Verificar atualizações
dotnet list package --outdated

# Atualizar pacote
dotnet add package PackageName --version X.Y.Z
```

## Melhores Práticas

1. **Versionamento**
   - Especificar versões exatas em requirements.txt
   - Usar ambientes virtuais por projeto
   - Documentar dependências essenciais

2. **Segurança**
   - Manter pacotes atualizados
   - Verificar vulnerabilidades conhecidas
   - Usar fontes confiáveis (PyPI, NuGet)

3. **Performance**
   - Minimizar número de dependências
   - Usar versões otimizadas (ex: psycopg2-binary)
   - Avaliar impacto de cada pacote

4. **Compatibilidade**
   - Testar combinações de versões
   - Manter registro de problemas conhecidos
   - Documentar requisitos específicos
