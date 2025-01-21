# Queries e Views

## Visão Geral
O Django oferece diferentes maneiras de consultar e retornar dados através do ORM. Vamos comparar com SQL puro e C# para entender melhor cada abordagem.

## Consultas Básicas

### Django ORM
```python
# models.py
class Cliente(models.Model):
    nome = models.CharField(max_length=100)
    email = models.EmailField()
    data_cadastro = models.DateTimeField(auto_now_add=True)
    ativo = models.BooleanField(default=True)

# views.py
from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated

class ClienteListView(ListAPIView):
    serializer_class = ClienteSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Cliente.objects.filter(
            ativo=True
        ).order_by('-data_cadastro')
```

### SQL Equivalente
```sql
SELECT 
    id,
    nome,
    email,
    data_cadastro
FROM clientes
WHERE ativo = 1
ORDER BY data_cadastro DESC;
```

### C# Equivalente
```csharp
// Controller
[ApiController]
[Route("api/[controller]")]
public class ClientesController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    
    [HttpGet]
    [Authorize]
    public async Task<ActionResult<IEnumerable<ClienteDto>>> GetClientes()
    {
        var clientes = await _context.Clientes
            .Where(c => c.Ativo)
            .OrderByDescending(c => c.DataCadastro)
            .ToListAsync();
            
        return Ok(_mapper.Map<List<ClienteDto>>(clientes));
    }
}
```

## Consultas com Relacionamentos

### Django ORM
```python
# models.py
class Pedido(models.Model):
    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE)
    data_pedido = models.DateTimeField(auto_now_add=True)
    valor_total = models.DecimalField(max_digits=10, decimal_places=2)

class PedidoListView(ListAPIView):
    serializer_class = PedidoSerializer
    
    def get_queryset(self):
        return Pedido.objects.select_related('cliente').filter(
            valor_total__gt=1000
        ).prefetch_related('itens')
```

### SQL Equivalente
```sql
SELECT 
    p.*,
    c.nome as cliente_nome,
    c.email as cliente_email
FROM pedidos p
INNER JOIN clientes c ON p.cliente_id = c.id
WHERE p.valor_total > 1000;
```

### C# Equivalente
```csharp
var pedidos = await _context.Pedidos
    .Include(p => p.Cliente)
    .Include(p => p.Itens)
    .Where(p => p.ValorTotal > 1000)
    .ToListAsync();
```

## Configuração de URLs

### Django
```python
# urls.py
from django.urls import path
from .views import ClienteListView

urlpatterns = [
    path('clientes/', ClienteListView.as_view(), name='cliente-list'),
]
```

### C# (Startup.cs ou Program.cs)
```csharp
app.MapControllerRoute(
    name: "clientes",
    pattern: "api/clientes",
    defaults: new { controller = "Clientes", action = "GetClientes" }
);
```

## Vantagens do ORM

1. **Segurança**
   ```python
   # Django - Proteção automática contra SQL Injection
   Cliente.objects.filter(nome__icontains=nome_busca)
   
   # SQL - Vulnerável se não parametrizado
   f"SELECT * FROM clientes WHERE nome LIKE '%{nome_busca}%'"  # NÃO FAÇA ISSO!
   ```

2. **Produtividade**
   ```python
   # Django - Uma linha
   clientes = Cliente.objects.all()
   
   # SQL - Mais verboso
   """
   SELECT id, nome, email, data_cadastro, ativo 
   FROM clientes
   """
   ```

3. **Portabilidade**
   - Mesmo código funciona com diferentes bancos
   - Migrations automáticas
   - Abstração do banco de dados

## Queries Avançadas

### Agregações
```python
# Django
from django.db.models import Count, Avg, Sum

class ClienteStatsView(APIView):
    def get(self, request):
        stats = Cliente.objects.aggregate(
            total_clientes=Count('id'),
            media_pedidos=Avg('pedido__valor_total'),
            soma_pedidos=Sum('pedido__valor_total')
        )
        return Response(stats)
```

### SQL Equivalente
```sql
SELECT 
    COUNT(id) as total_clientes,
    AVG(p.valor_total) as media_pedidos,
    SUM(p.valor_total) as soma_pedidos
FROM clientes c
LEFT JOIN pedidos p ON p.cliente_id = c.id;
```

### C# Equivalente
```csharp
var stats = await _context.Clientes
    .GroupBy(c => 1)
    .Select(g => new
    {
        TotalClientes = g.Count(),
        MediaPedidos = g.Average(c => c.Pedidos.Average(p => p.ValorTotal)),
        SomaPedidos = g.Sum(c => c.Pedidos.Sum(p => p.ValorTotal))
    })
    .FirstOrDefaultAsync();
```

## Boas Práticas

1. **Otimização de Queries**
   ```python
   # Ruim - N+1 queries
   pedidos = Pedido.objects.all()
   for pedido in pedidos:
       print(pedido.cliente.nome)  # Query adicional para cada pedido
   
   # Bom - Uma única query
   pedidos = Pedido.objects.select_related('cliente').all()
   for pedido in pedidos:
       print(pedido.cliente.nome)  # Não faz query adicional
   ```

2. **Consultas Específicas**
   ```python
   # Ruim - Traz todos os campos
   Cliente.objects.all()
   
   # Bom - Traz apenas campos necessários
   Cliente.objects.values('id', 'nome', 'email')
   ```

3. **Queries Complexas**
   ```python
   # Usando Q objects para queries complexas
   from django.db.models import Q
   
   Cliente.objects.filter(
       Q(nome__icontains='silva') | 
       Q(email__icontains='silva')
   )
   ```

## ViewSets e Routers

### Django REST Framework
```python
# views.py
from rest_framework import viewsets

class ClienteViewSet(viewsets.ModelViewSet):
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer
    
# urls.py
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register('clientes', ClienteViewSet)
urlpatterns = router.urls
```

### C# Equivalente
```csharp
[ApiController]
[Route("api/[controller]")]
public class ClientesController : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Cliente>>> Get()
    {
        return await _context.Clientes.ToListAsync();
    }
    
    [HttpGet("{id}")]
    public async Task<ActionResult<Cliente>> GetById(int id)
    {
        return await _context.Clientes.FindAsync(id);
    }
    
    // Outros métodos CRUD
}
```
