# Roteamento Principal (urls.py)

## Visão Geral
O arquivo `urls.py` no módulo app é o ponto central de roteamento, similar ao conceito de roteamento no ASP.NET Core.

## Implementação

### Django (Python)
```python
urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/access/", include("access.urls")),
    path("api/inventario/", include("inventario.api.urls")),
    path("api/incidentes/", include("incidentes.api.urls")),
]
```

### Equivalente em C# (ASP.NET Core)
```csharp
public void Configure(IApplicationBuilder app)
{
    app.UseEndpoints(endpoints =>
    {
        endpoints.MapControllerRoute(
            name: "admin",
            pattern: "admin/{*catchall}",
            defaults: new { controller = "Admin", action = "Index" }
        );

        endpoints.MapControllerRoute(
            name: "api",
            pattern: "api/{controller}/{action}/{id?}"
        );
    });
}
```

## Diferenças Principais

1. **Estrutura de Roteamento**
   - Django: Declarativa via URLs
   - ASP.NET Core: Convenção ou atributos

2. **Agrupamento**
   - Django: `include()` para modularização
   - ASP.NET Core: Areas ou Controllers

3. **Parâmetros**
   - Django: Expressos na URL pattern
   - ASP.NET Core: Route constraints

## Exemplos de Uso

### Django
```python
# Rota com parâmetro
path("item/<int:id>/", views.item_detail)

# Rota com regex
re_path(r"^docs/(?P<path>.*)$", views.docs_proxy)
```

### ASP.NET Core
```csharp
// Rota com parâmetro
[Route("item/{id:int}")]
public IActionResult ItemDetail(int id)

// Rota com regex
[Route("docs/{*path}")]
public IActionResult DocsProxy(string path)
```

## Vantagens e Desvantagens

### Django
✅ Centralizado e explícito
✅ Fácil modularização
❌ Menos flexível em runtime

### ASP.NET Core
✅ Flexível e extensível
✅ Fortemente tipado
❌ Pode ficar disperso entre controllers
