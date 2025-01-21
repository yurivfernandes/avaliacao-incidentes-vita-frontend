# Configurações do Projeto (settings.py)

## Visão Geral
O arquivo `settings.py` é o coração das configurações do Django, similar ao `appsettings.json` no ASP.NET Core.

## Configurações Principais

### Banco de Dados

#### Django (Python)
```python
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    },
    "sql_server": {
        "ENGINE": "mssql",
        "NAME": "nome_do_banco",
        "USER": "usuario",
        "PASSWORD": "senha",
        "HOST": "xxxx",
        "PORT": "",
        "OPTIONS": {
            "driver": "ODBC Driver 17 for SQL Server",
        },
    },
}
```

#### Equivalente em C# (appsettings.json)
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=app.db",
    "SqlServerConnection": "Server=xxxx;Database=nome_do_banco;User Id=usuario;Password=senha;TrustServerCertificate=True"
  }
}
```

### Autenticação e Segurança

#### Django (Python)
```python
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.TokenAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
}

AUTH_USER_MODEL = "access.User"
```

#### Equivalente em C# (Startup.cs)
```csharp
public void ConfigureServices(IServiceCollection services)
{
    services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
        .AddJwtBearer(options => {
            // Configurações do JWT
        });
        
    services.AddIdentity<ApplicationUser, IdentityRole>()
        .AddEntityFrameworkStores<ApplicationDbContext>();
}
```

### CORS

#### Django (Python)
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
]

CORS_ALLOW_METHODS = [
    "DELETE",
    "GET",
    "OPTIONS",
    "PATCH",
    "POST",
    "PUT",
]
```

#### Equivalente em C# (Startup.cs)
```csharp
public void ConfigureServices(IServiceCollection services)
{
    services.AddCors(options =>
    {
        options.AddPolicy("DefaultPolicy",
            builder => builder
                .WithOrigins("http://localhost:5173")
                .AllowAnyMethod()
                .AllowAnyHeader());
    });
}
```

## Diferenças Principais

### 1. Configuração de Arquivos Estáticos

#### Django
```python
STATIC_URL = "/static/"
STATIC_ROOT = os.path.join(BASE_DIR, "staticfiles")
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "cadastro/arquivos"
```

#### ASP.NET Core
```csharp
app.UseStaticFiles();
// Configuração em wwwroot/
```

### 2. Middleware

#### Django
```python
MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    // ...
]
```

#### ASP.NET Core
```csharp
public void Configure(IApplicationBuilder app)
{
    app.UseMiddleware<SecurityMiddleware>();
    app.UseCors();
    // ...
}
```

## Principais Diferenças Conceituais

1. **Organização**
   - Django: Um único arquivo de configuração
   - ASP.NET Core: Distribuído entre appsettings.json e Startup.cs

2. **Banco de Dados**
   - Django: ORM integrado
   - ASP.NET Core: Entity Framework precisa ser configurado

3. **Autenticação**
   - Django: Sistema próprio com decoradores
   - ASP.NET Core: Identity Framework

4. **Servindo Arquivos**
   - Django: Configuração explícita de diretórios
   - ASP.NET Core: Convenção via wwwroot
