# Models e Banco de Dados

## Models do Django vs Classes C#

### Django (Python)
```python
from django.db import models

class Cliente(models.Model):
    nome = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    data_cadastro = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'clientes'
        ordering = ['-data_cadastro']
```

### C# (Entity Framework)
```csharp
public class Cliente
{
    public int Id { get; set; }
    public string Nome { get; set; }
    public string Email { get; set; }
    public DateTime DataCadastro { get; set; }
}

public class ClienteConfiguration : IEntityTypeConfiguration<Cliente>
{
    public void Configure(EntityTypeBuilder<Cliente> builder)
    {
        builder.ToTable("clientes");
        builder.HasIndex(c => c.Email).IsUnique();
        builder.Property(c => c.DataCadastro).HasDefaultValueSql("GETDATE()");
    }
}
```

## Tipos de Campos

| Django | C# | SQL Server |
|--------|-----|------------|
| CharField | string | NVARCHAR |
| TextField | string | NTEXT |
| IntegerField | int | INT |
| BooleanField | bool | BIT |
| DateTimeField | DateTime | DATETIME |
| DecimalField | decimal | DECIMAL |
| ForeignKey | virtual Class | INT + FK |
| ManyToManyField | ICollection<T> | Tabela Junção |

## Relacionamentos

### One-to-Many
```python
# Django
class Pedido(models.Model):
    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE)
```

```csharp
// C#
public class Pedido
{
    public int ClienteId { get; set; }
    public virtual Cliente Cliente { get; set; }
}
```

### Many-to-Many
```python
# Django
class Produto(models.Model):
    categorias = models.ManyToManyField('Categoria')
```

```csharp
// C#
public class Produto
{
    public ICollection<Categoria> Categorias { get; set; }
}
```

## Queries

### Django ORM
```python
# Busca simples
clientes = Cliente.objects.filter(nome__contains='João')

# Join
pedidos = Pedido.objects.select_related('cliente').all()

# Agregação
from django.db.models import Count, Avg
total = Pedido.objects.aggregate(
    total=Count('id'),
    media=Avg('valor')
)
```

### LINQ (C#)
```csharp
// Busca simples
var clientes = _context.Clientes.Where(c => c.Nome.Contains("João"));

// Join
var pedidos = _context.Pedidos.Include(p => p.Cliente).ToList();

// Agregação
var total = _context.Pedidos.GroupBy(p => 1).Select(g => new {
    Total = g.Count(),
    Media = g.Average(p => p.Valor)
}).First();
```

### SQL Puro
```sql
-- Busca simples
SELECT * FROM clientes WHERE nome LIKE '%João%'

-- Join
SELECT p.*, c.* 
FROM pedidos p
INNER JOIN clientes c ON p.cliente_id = c.id

-- Agregação
SELECT 
    COUNT(*) as total,
    AVG(valor) as media
FROM pedidos
```

## Boas Práticas

1. **Validação**
   ```python
   # Django
   def clean(self):
       if self.email and not self.email.endswith('@empresa.com'):
           raise ValidationError('Email inválido')
   ```

   ```csharp
   // C#
   public class ClienteValidator : AbstractValidator<Cliente>
   {
       public ClienteValidator()
       {
           RuleFor(x => x.Email).Must(e => e.EndsWith("@empresa.com"));
       }
   }
   ```

2. **Índices**
   ```python
   # Django
   class Meta:
       indexes = [
           models.Index(fields=['nome', 'email'])
       ]
   ```

   ```csharp
   // C#
   modelBuilder.Entity<Cliente>()
       .HasIndex(c => new { c.Nome, c.Email });
   ```
