# Rotas do Módulo Access (urls.py)

## Visão Geral
O arquivo `urls.py` no módulo Access define todas as rotas relacionadas à autenticação e gerenciamento de usuários.

## Implementação Django

```python
urlpatterns = [
    path("login/", views.api_login, name="api_login"),
    path("logout/", views.api_logout, name="api_logout"),
    path("signup/", views.signup, name="signup"),
    path("check-username/<str:username>/", views.check_username, name="check-username"),
    path("change-password/", views.change_password, name="change-password"),
    path("profile/", views.profile_view, name="profile"),
    path("profile/update/", views.profile_update, name="profile-update"),
    path("api-token-auth/", obtain_auth_token, name="api_token_auth"),
    re_path(r"^docs/(?P<path>.*)$", views.docs_proxy, name="docs-proxy"),
]
```

## Equivalente em C# (ASP.NET Core)

```csharp
public class Startup
{
    public void Configure(IApplicationBuilder app)
    {
        app.UseEndpoints(endpoints =>
        {
            endpoints.MapControllerRoute(
                name: "login",
                pattern: "api/auth/login",
                defaults: new { controller = "Auth", action = "Login" }
            );

            endpoints.MapControllerRoute(
                name: "logout",
                pattern: "api/auth/logout",
                defaults: new { controller = "Auth", action = "Logout" }
            );

            // Demais rotas...
        });
    }
}

// Alternativamente, usando atributos nos controllers:
[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    [HttpPost("login")]
    public IActionResult Login() { /*...*/ }

    [HttpPost("logout")]
    public IActionResult Logout() { /*...*/ }

    [HttpGet("check-username/{username}")]
    public IActionResult CheckUsername(string username) { /*...*/ }
}
```

## Comparação de Abordagens

### Django (Python)
- Roteamento centralizado em urls.py
- Padrões de URL definidos via expressões regulares ou path strings
- Nomeação de rotas para referência em templates
- Mapeamento direto para funções de view

### ASP.NET Core (C#)
- Roteamento via atributos nos controllers
- Convenções de rota configuráveis
- Suporte a rotas com parâmetros tipados
- Integração com injeção de dependências

## Endpoints Disponíveis

| Endpoint | Método | Descrição | Equivalente SQL (quando aplicável) |
|----------|---------|-----------|-----------------------------------|
| `/login/` | POST | Autenticação do usuário | `SELECT * FROM Users WHERE username = @username` |
| `/logout/` | POST | Encerra a sessão | `UPDATE UserSessions SET active = 0 WHERE token = @token` |
| `/signup/` | POST | Cadastro de usuário | `INSERT INTO Users (username, password) VALUES (@username, @password)` |
| `/check-username/<username>/` | GET | Verifica disponibilidade | `SELECT COUNT(*) FROM Users WHERE username = @username` |
| `/change-password/` | POST | Altera senha | `UPDATE Users SET password = @newPassword WHERE id = @userId` |
| `/profile/` | GET | Visualiza perfil | `SELECT * FROM Users WHERE id = @userId` |
| `/profile/update/` | PUT | Atualiza perfil | `UPDATE Users SET field = @value WHERE id = @userId` |

## Segurança
- Todas as rotas (exceto login/signup) requerem autenticação
- Tokens são validados em cada requisição
- CSRF protection ativado para rotas não-GET
- Rate limiting para tentativas de login

## Diferenças Principais

1. **Organização do Código**
   - Django: Rotas centralizadas em urls.py
   - C#: Rotas definidas nos controllers

2. **Tipo de Roteamento**
   - Django: Pattern matching com strings/regex
   - C#: Attribute routing ou convenções

3. **Autenticação**
   - Django: Middleware e decorators
   - C#: Filters e attributes

4. **Manutenção**
   - Django: Alterações em um arquivo central
   - C#: Alterações distribuídas nos controllers
