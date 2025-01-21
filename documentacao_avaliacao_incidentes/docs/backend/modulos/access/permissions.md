# Sistema de Permissões

## Visão Geral
O sistema de permissões controla o acesso dos usuários às funcionalidades.

## Grupos e Permissões

### Django
```python
# Gerenciado automaticamente pelo Django Admin
groups = models.ManyToManyField("auth.Group")
user_permissions = models.ManyToManyField("auth.Permission")
```

### Equivalente SQL
```sql
CREATE TABLE UserGroups (
    UserId INT,
    GroupId INT,
    PRIMARY KEY (UserId, GroupId)
)

CREATE TABLE UserPermissions (
    UserId INT,
    PermissionId INT,
    PRIMARY KEY (UserId, PermissionId)
)
```

## Níveis de Acesso
1. Administrador (staff)
2. Usuário Padrão
3. Usuário Limitado

## Decoradores de Permissão
```python
@permission_classes([IsAuthenticated])
@permission_classes([IsAdminUser])
@permission_classes([IsStaffUser])
```

## Verificações de Permissão
```python
if request.user.is_staff:
    # Acesso administrativo
if request.user.has_perm('app.view_model'):
    # Permissão específica
```
