# Django REST Framework (DRF)

## O que é DRF?
Django REST Framework é uma biblioteca poderosa para construir APIs Web, similar ao ASP.NET Core Web API. É construído sobre o Django e adiciona funcionalidades específicas para APIs REST.

## Comparação com ASP.NET Core Web API

### Serializers vs DTOs
```python
# DRF Serializer
class ClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cliente
        fields = ['id', 'nome', 'email']
```

```csharp
// C# DTO
public class ClienteDto
{
    public int Id { get; set; }
    public string Nome { get; set; }
    public string Email { get; set; }
}
```

### ViewSets vs Controllers
```python
# DRF ViewSet
class ClienteViewSet(viewsets.ModelViewSet):
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer
```

```csharp
// C# Controller
[ApiController]
[Route("api/[controller]")]
public class ClientesController : ControllerBase
{
    private readonly IClienteService _service;
    
    // ... actions ...
}
```

## Principais Funcionalidades

### 1. Autenticação
```python
# DRF
from rest_framework.permissions import IsAuthenticated

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def protected_view(request):
    return Response({"message": "Protegido"})
```

```csharp
// C# Equivalente
[Authorize]
[HttpGet]
public IActionResult ProtectedEndpoint()
{
    return Ok(new { message = "Protegido" });
}
```

### 2. Paginação
```python
# settings.py
REST_FRAMEWORK = {
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 10
}
```

```csharp
// C# Equivalente
public class PaginationFilter
{
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
}
```

### 3. Filtros
```python
# DRF
from django_filters import rest_framework as filters

class ClienteFilter(filters.FilterSet):
    email = filters.CharFilter(lookup_expr='icontains')
    
    class Meta:
        model = Cliente
        fields = ['email']
```

```csharp
// C# Equivalente
public class ClienteFilter
{
    public string Email { get; set; }
    
    public IQueryable<Cliente> Apply(IQueryable<Cliente> query)
    {
        if (!string.IsNullOrEmpty(Email))
            query = query.Where(c => c.Email.Contains(Email));
        return query;
    }
}
```

## Recursos Exclusivos do DRF

### 1. Browsable API
- Interface web automática para sua API
- Documentação interativa
- Formulários para teste

### 2. Format Suffixes
```python
@api_view(['GET'])
@renderer_classes([JSONRenderer, XMLRenderer])
def mixed_content(request, format=None):
    # ...
```

### 3. Generic Views
```python
class ClienteList(generics.ListCreateAPIView):
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer
```

## Links Úteis
- [DRF Documentação](https://www.django-rest-framework.org/)
- [Tutorial DRF](https://www.django-rest-framework.org/tutorial/quickstart/)
- [Guia de Autenticação](https://www.django-rest-framework.org/api-guide/authentication/)
