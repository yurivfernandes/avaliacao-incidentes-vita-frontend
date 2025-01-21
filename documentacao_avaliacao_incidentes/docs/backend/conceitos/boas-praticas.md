# Boas Práticas

## Organização de Código

### Python vs C#

#### Nomenclatura
```python
# Python/Django - snake_case
class ClienteModel(models.Model):
    data_criacao = models.DateTimeField()
    
    def calcular_idade(self):
        return datetime.now() - self.data_criacao
```

```csharp
// C# - PascalCase/camelCase
public class ClienteModel
{
    public DateTime DataCriacao { get; set; }
    
    public TimeSpan CalcularIdade()
    {
        return DateTime.Now - DataCriacao;
    }
}
```

### Estrutura de Arquivos
```
# Python/Django
models/
    __init__.py
    cliente.py
    pedido.py

# C#
Models/
    Cliente.cs
    Pedido.cs
```

## Padrões Django

### Fat Models, Thin Views
```python
# Bom - Lógica no Model
class Pedido(models.Model):
    def calcular_total(self):
        return self.items.aggregate(total=Sum('valor'))['total']

# Ruim - Lógica na View
def view_pedido(request, pk):
    pedido = Pedido.objects.get(pk=pk)
    total = sum(item.valor for item in pedido.items.all())
```

### Managers Customizados
```python
# Django
class PublishedManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(status='published')

class Post(models.Model):
    objects = models.Manager()
    published = PublishedManager()
```

```csharp
// C# Equivalente
public class PublishedPostsRepository : IPostRepository
{
    private readonly DbContext _context;
    
    public IQueryable<Post> GetAll()
    {
        return _context.Posts.Where(p => p.Status == "published");
    }
}
```

## Convenções de Código

### Imports
```python
# Python - ordem dos imports
# 1. Stdlib
from datetime import datetime
from decimal import Decimal

# 2. Third-party
from django.db import models
from rest_framework import serializers

# 3. Local
from .models import Cliente
from .serializers import ClienteSerializer
```

```csharp
// C# - using statements
using System;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using MinhaApp.Models;
```

### Documentação
```python
# Python - Docstrings
def calcular_desconto(valor: Decimal, percentual: Decimal) -> Decimal:
    """
    Calcula o desconto baseado no valor e percentual.
    
    Args:
        valor: Valor base para cálculo
        percentual: Percentual de desconto (0-100)
    
    Returns:
        Decimal: Valor do desconto calculado
    """
    return valor * (percentual / 100)
```

```csharp
// C# - XML Comments
/// <summary>
/// Calcula o desconto baseado no valor e percentual.
/// </summary>
/// <param name="valor">Valor base para cálculo</param>
/// <param name="percentual">Percentual de desconto (0-100)</param>
/// <returns>Valor do desconto calculado</returns>
public decimal CalcularDesconto(decimal valor, decimal percentual)
{
    return valor * (percentual / 100);
}
```

## DRY (Don't Repeat Yourself)

### Mixins e Herança
```python
# Django
class TimestampMixin(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        abstract = True

class Cliente(TimestampMixin):
    nome = models.CharField(max_length=100)
```

```csharp
// C#
public abstract class TimestampEntity
{
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class Cliente : TimestampEntity
{
    public string Nome { get; set; }
}
```

## Segurança

### Validação de Dados
```python
# Django
from django.core.validators import MinValueValidator

class Produto(models.Model):
    preco = models.DecimalField(
        validators=[MinValueValidator(0)]
    )
```

```csharp
// C#
public class Produto
{
    [Range(0, double.MaxValue)]
    public decimal Preco { get; set; }
}
```

### SQL Injection Prevention
```python
# Django - Seguro por padrão
Cliente.objects.filter(nome__contains=nome_busca)

# SQL Raw - Use sempre parâmetros
with connection.cursor() as cursor:
    cursor.execute(
        "SELECT * FROM cliente WHERE nome LIKE %s",
        [f"%{nome_busca}%"]
    )
```

```csharp
// C# - Entity Framework
_context.Clientes.Where(c => c.Nome.Contains(nomeBusca));

// SQL Raw - Parametrizado
using (var cmd = connection.CreateCommand())
{
    cmd.CommandText = "SELECT * FROM cliente WHERE nome LIKE @nome";
    cmd.Parameters.AddWithValue("@nome", $"%{nomeBusca}%");
}
```
