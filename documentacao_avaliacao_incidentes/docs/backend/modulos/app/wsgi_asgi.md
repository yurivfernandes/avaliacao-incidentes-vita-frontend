# Configuração de Servidor (WSGI/ASGI)

## Visão Geral
Os arquivos `wsgi.py` e `asgi.py` são pontos de entrada para servidores web, similar ao `Program.cs` no ASP.NET Core.

## WSGI vs ASGI

### WSGI (wsgi.py)

#### Django (Python)
```python
import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'app.settings')
application = get_wsgi_application()
```

#### Equivalente em C# (Program.cs)
```csharp
public class Program
{
    public static void Main(string[] args)
    {
        CreateHostBuilder(args).Build().Run();
    }

    public static IHostBuilder CreateHostBuilder(string[] args) =>
        Host.CreateDefaultBuilder(args)
            .ConfigureWebHostDefaults(webBuilder =>
            {
                webBuilder.UseStartup<Startup>();
            });
}
```

### ASGI (asgi.py)

#### Django (Python)
```python
import os
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'app.settings')
application = get_asgi_application()
```

#### Equivalente Moderno em C# (.NET 6+)
```csharp
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

await app.RunAsync();
```

## Diferenças Principais

1. **Modelo de Execução**
   - Django: WSGI (síncrono) ou ASGI (assíncrono)
   - ASP.NET Core: Sempre assíncrono

2. **Configuração**
   - Django: Separada em wsgi.py/asgi.py
   - ASP.NET Core: Unificada em Program.cs

3. **Deployment**
   - Django: Gunicorn, uWSGI, Daphne
   - ASP.NET Core: IIS, Kestrel

## Deployment

### Django
```bash
# Usando Gunicorn (WSGI)
gunicorn app.wsgi:application

# Usando Daphne (ASGI)
daphne app.asgi:application
```

### ASP.NET Core
```bash
# Publicação
dotnet publish -c Release

# Execução
dotnet MyApp.dll
```
