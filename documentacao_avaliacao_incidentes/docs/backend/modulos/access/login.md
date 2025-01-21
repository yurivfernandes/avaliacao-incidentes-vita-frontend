# Sistema de Login - Backend

## Visão Geral
O sistema de autenticação foi implementado utilizando Django Rest Framework com autenticação via Token. Este documento explica a implementação em Python/Django e faz um paralelo com C#/SQL para facilitar o entendimento.

## Modelo de Usuário (User Model)

### Implementação Django
```python
# Em Python/Django, herdamos de AbstractUser para estender o modelo base de usuário
class User(AbstractUser):
    username = models.CharField(
        max_length=150,
        unique=True,
    )
    full_name = models.CharField(max_length=255)
    company_name = models.CharField(max_length=255, blank=True)

    # O Django gerencia automaticamente as tabelas de permissões
    groups = models.ManyToManyField("auth.Group")
    user_permissions = models.ManyToManyField("auth.Permission")
```

### Equivalente em C#
```csharp
// Em C#, precisaríamos criar as tabelas manualmente
public class User
{
    public int Id { get; set; }
    public string Username { get; set; }
    public string PasswordHash { get; set; }
    public string FullName { get; set; }
    public string CompanyName { get; set; }
}

// SQL para criar a tabela
/*
CREATE TABLE Users (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Username NVARCHAR(150) UNIQUE NOT NULL,
    PasswordHash NVARCHAR(MAX) NOT NULL,
    FullName NVARCHAR(255) NOT NULL,
    CompanyName NVARCHAR(255) NULL
)
*/
```

## Endpoint de Login

### Implementação Django
```python
@csrf_exempt
@require_http_methods(["POST"])
def api_login(request):
    data = json.loads(request.body)
    username = data.get("username")
    password = data.get("password")
    
    # Django gerencia automaticamente a verificação de senha
    user = authenticate(request, username=username, password=password)
    if user is not None:
        # Token é gerado/recuperado automaticamente
        token, created = Token.objects.get_or_create(user=user)
        return JsonResponse({"token": token.key})
```

### Equivalente em C#
```csharp
[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IConfiguration _configuration;
    private readonly SqlConnection _connection;

    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginModel model)
    {
        using (var conn = new SqlConnection(_configuration.GetConnectionString("Default")))
        {
            conn.Open();
            // Precisamos escrever o SQL manualmente
            var cmd = new SqlCommand(@"
                SELECT Id, PasswordHash 
                FROM Users 
                WHERE Username = @Username", conn);
            
            cmd.Parameters.AddWithValue("@Username", model.Username);
            
            using (var reader = cmd.ExecuteReader())
            {
                if (reader.Read())
                {
                    var storedHash = reader.GetString(1);
                    // Precisamos implementar a verificação de senha
                    if (VerifyPassword(model.Password, storedHash))
                    {
                        // Precisamos implementar a geração de token
                        var token = GenerateJwtToken(reader.GetInt32(0));
                        return Ok(new { token });
                    }
                }
            }
        }
        return Unauthorized();
    }
}
```

## Principais Diferenças

1. **ORM vs SQL Puro**
   - Django: Usa ORM que abstrai o SQL
   - C#: Tradicionalmente usa SQL puro ou Entity Framework

2. **Autenticação**
   - Django: Sistema built-in de auth
   - C#: Precisa implementar manualmente ou usar Identity

3. **Gerenciamento de Senha**
   - Django: Hash e verificação automáticos
   - C#: Precisa implementar manualmente (ou usar Identity)

4. **Tokens**
   - Django: DRF fornece sistema de token
   - C#: Precisa implementar JWT ou outro sistema

## Fluxo de Autenticação

1. Cliente envia credenciais (username/password)
2. Backend valida credenciais
3. Se válido, gera/recupera token
4. Token é retornado ao cliente
5. Cliente usa token nas requisições subsequentes

## Segurança

- Senhas são sempre hasheadas antes de armazenadas
- Tokens têm tempo de expiração
- HTTPS é obrigatório em produção
- Proteção contra CSRF implementada
