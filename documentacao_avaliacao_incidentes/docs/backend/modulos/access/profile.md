# Perfil de Usuário

## Visão Geral
O sistema de perfil permite gerenciar informações do usuário e suas preferências.

## Endpoints

### Visualizar Perfil
```python
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def profile_view(request):
    # Retorna dados do usuário logado
```

### Atualizar Perfil
```python
@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def profile_update(request):
    # Atualiza dados do usuário
```

## Equivalente em C#
```csharp
[ApiController]
[Route("api/[controller]")]
public class ProfileController : ControllerBase
{
    [HttpGet]
    [Authorize]
    public IActionResult GetProfile()
    {
        // Implementação do perfil
    }

    [HttpPut]
    [Authorize]
    public IActionResult UpdateProfile([FromBody] ProfileUpdateModel model)
    {
        // Implementação da atualização
    }
}
```

## Campos do Perfil
- Username (único)
- Nome Completo
- Nome da Empresa
- Status Staff
- Grupos
- Permissões
