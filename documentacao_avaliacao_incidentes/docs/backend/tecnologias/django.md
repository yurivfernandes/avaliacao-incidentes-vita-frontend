# Django Framework

## O que é Django?
Django é um framework web Python de alto nível, similar ao ASP.NET Core no mundo C#. Foi criado para ajudar desenvolvedores a construir aplicações web complexas de forma rápida e eficiente.

## Por que Django?

### Para desenvolvedores C#
- **ORM integrado**: Similar ao Entity Framework
- **Admin automático**: Não existe equivalente direto no C#
- **Sistema de templates**: Similar ao Razor
- **Gerenciamento de URLs**: Similar ao sistema de rotas do ASP.NET
- **Autenticação built-in**: Similar ao Identity

### Principais Características

1. **Models (ORM)**
```python
# Django
class Cliente(models.Model):
    nome = models.CharField(max_length=100)
    email = models.EmailField(unique=True)

# Uso
Cliente.objects.filter(email__contains='@empresa.com')
```

```csharp
// C# Equivalente
public class Cliente
{
    public int Id { get; set; }
    public string Nome { get; set; }
    public string Email { get; set; }
}

// Uso
_context.Clientes.Where(c => c.Email.Contains("@empresa.com"))
```

2. **Views**
```python
# Django
@api_view(['GET'])
def listar_clientes(request):
    clientes = Cliente.objects.all()
    return Response(ClienteSerializer(clientes, many=True).data)
```

```csharp
// C# Equivalente
[HttpGet]
public IActionResult ListarClientes()
{
    var clientes = _context.Clientes.ToList();
    return Ok(_mapper.Map<List<ClienteDto>>(clientes));
}
```

3. **URLs (Rotas)**
```python
# Django
urlpatterns = [
    path('clientes/', views.listar_clientes),
    path('clientes/<int:pk>/', views.detalhe_cliente),
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

## Arquitetura MTV
Django usa o padrão MTV (Model-Template-View), similar ao MVC:

| Django (MTV) | C# (MVC) | Função |
|-------------|-----------|---------|
| Model | Model | Dados e lógica de negócios |
| Template | View | Apresentação |
| View | Controller | Lógica de controle |

## Django Admin

Um dos diferenciais do Django é seu admin automático:

```python
from django.contrib import admin

@admin.register(Cliente)
class ClienteAdmin(admin.ModelAdmin):
    list_display = ['nome', 'email']
    search_fields = ['nome', 'email']
```

Não existe equivalente direto no C#, seria necessário criar uma interface administrativa manualmente.

## Links Úteis
- [Documentação Oficial](https://docs.djangoproject.com/)
- [Django para Desenvolvedores .NET](https://docs.djangoproject.com/en/4.2/intro/whatsnext/)
- [Tutorial Django](https://docs.djangoproject.com/en/4.2/intro/tutorial01/)
