# Sistema de Migrations

## Visão Geral
Migrations são como um sistema de controle de versão para seu banco de dados. Elas permitem modificar o esquema do banco de dados de forma consistente e compartilhável.

## Criação de Migrations

### Django vs Entity Framework vs SQL Puro

#### Django
```python
# Criar migration
python manage.py makemigrations

# Migration gerada:
class Migration(migrations.Migration):
    dependencies = [
        ('app', '0001_initial'),
    ]
    
    operations = [
        migrations.AddField(
            model_name='cliente',
            name='telefone',
            field=models.CharField(max_length=20, null=True),
        ),
    ]
```

#### Entity Framework
```csharp
// Criar migration
Add-Migration AddTelefoneToCliente

public partial class AddTelefoneToCliente : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<string>(
            name: "Telefone",
            table: "Clientes",
            type: "nvarchar(20)",
            nullable: true);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(
            name: "Telefone",
            table: "Clientes");
    }
}
```

#### SQL Puro
```sql
-- V1_2__add_telefone_to_cliente.sql
ALTER TABLE clientes ADD telefone VARCHAR(20) NULL;

-- V1_2__rollback.sql
ALTER TABLE clientes DROP COLUMN telefone;
```

## Tipos de Migrations

### 1. Schema Migrations
```python
# Django
migrations.CreateModel(
    name='Produto',
    fields=[
        ('id', models.AutoField(primary_key=True)),
        ('nome', models.CharField(max_length=100)),
        ('preco', models.DecimalField(max_digits=10, decimal_places=2)),
    ],
)
```

```csharp
// Entity Framework
migrationBuilder.CreateTable(
    name: "Produtos",
    columns: table => new
    {
        Id = table.Column<int>(nullable: false)
            .Annotation("SqlServer:Identity", "1, 1"),
        Nome = table.Column<string>(maxLength: 100),
        Preco = table.Column<decimal>(type: "decimal(10,2)")
    });
```

### 2. Data Migrations
```python
# Django
def criar_categorias_padrao(apps, schema_editor):
    Categoria = apps.get_model('app', 'Categoria')
    categorias = ['Eletrônicos', 'Móveis', 'Vestuário']
    for nome in categorias:
        Categoria.objects.create(nome=nome)

class Migration(migrations.Migration):
    dependencies = [('app', '0001_initial')]
    operations = [
        migrations.RunPython(criar_categorias_padrao),
    ]
```

```csharp
// Entity Framework
protected override void Up(MigrationBuilder migrationBuilder)
{
    migrationBuilder.InsertData(
        table: "Categorias",
        columns: new[] { "Nome" },
        values: new object[,]
        {
            { "Eletrônicos" },
            { "Móveis" },
            { "Vestuário" }
        });
}
```

## Gerenciamento de Dependências

### Django
```python
class Migration(migrations.Migration):
    dependencies = [
        ('app', '0001_initial'),
        ('outra_app', '0002_alguma_mudanca'),
    ]
```

### Entity Framework
```csharp
// Gerenciado automaticamente pelo EF
modelBuilder.HasAnnotation(
    "ProductVersion",
    "7.0.0");
```

## Estratégias de Migração

### 1. Desenvolvimento
```bash
# Django - Resetar migrations
python manage.py migrate app_name zero
python manage.py makemigrations app_name --empty
```

```powershell
# Entity Framework - Resetar migrations
Drop-Database
Remove-Migration
```

### 2. Produção
```python
# Django - Verificar SQL antes
python manage.py sqlmigrate app_name 0001
python manage.py migrate --plan
```

```powershell
# Entity Framework
Script-Migration -Idempotent
```

## Resolução de Problemas Comuns

### 1. Conflitos de Merge
```bash
# Django
python manage.py makemigrations --merge
```

```powershell
# Entity Framework
Add-Migration MergeFix
```

### 2. Migrations Faltando
```bash
# Django - Verificar estado
python manage.py showmigrations --list
```

```powershell
# Entity Framework
Get-Migration
```

### 3. Rollback Seguro
```python
# Django - Operations com reversão
operations = [
    migrations.RunPython(
        forwards_func,
        reverse_func
    )
]
```

```csharp
// Entity Framework
protected override void Down(MigrationBuilder migrationBuilder)
{
    // Operações de reversão
}
```

## Melhores Práticas

1. **Versionamento**
   - Nunca editar migrations aplicadas
   - Manter histórico completo
   - Usar migrations para todas as mudanças

2. **Nomenclatura**
   - Nomes descritivos (ex: add_field_to_model)
   - Prefixos numéricos consistentes
   - Documentar mudanças complexas

3. **Teste**
   - Testar migrations em desenvolvimento
   - Verificar SQL gerado
   - Manter scripts de rollback

4. **Backup**
   - Backup antes de migrar em produção
   - Testar procedimento de rollback
   - Documentar processo de recuperação

## Comandos Principais

### Aplicar Migrations
```bash
# Django
python manage.py migrate

# Entity Framework
Update-Database

# SQL Manual
psql -d database -f 001_create_tables.sql
```

### Reverter Migrations
```bash
# Django
python manage.py migrate app_name 0001_previous

# Entity Framework
Update-Database 0001_PreviousMigration

# SQL Manual
psql -d database -f 001_rollback.sql
```

### Listar Migrations
```bash
# Django
python manage.py showmigrations

# Entity Framework
Get-Migration

# SQL Manual
SELECT * FROM __MigrationHistory;
```

## Boas Práticas

1. **Nomeação**
   ```python
   # Django
   python manage.py makemigrations --name create_cliente_table
   ```

   ```csharp
   // Entity Framework
   Add-Migration CreateClienteTable
   ```

2. **Backup**
   - Sempre fazer backup antes de migrar em produção
   - Testar migrations em ambiente de desenvolvimento
   - Ter scripts de rollback prontos

3. **Versionamento**
   - Commitar migrations junto com código
   - Não modificar migrations já aplicadas
   - Usar migrations para mudanças no esquema

4. **Dados**
   ```python
   # Django - Data Migration
   from django.db import migrations

   def adicionar_dados(apps, schema_editor):
       Cliente = apps.get_model('app', 'Cliente')
       Cliente.objects.create(nome='Admin')

   class Migration(migrations.Migration):
       dependencies = [
           ('app', '0001_initial'),
       ]

       operations = [
           migrations.RunPython(adicionar_dados),
       ]
   ```

   ```csharp
   // Entity Framework - Seed Data
   modelBuilder.Entity<Cliente>()
       .HasData(new Cliente { Id = 1, Nome = "Admin" });
   ```

## Resolução de Problemas

1. **Conflitos**
   - Resolver conflitos de merge
   - Não pular números de migrations
   - Manter dependências corretas

2. **Performance**
   - Dividir migrations grandes
   - Executar em horários de baixo uso
   - Monitorar tempo de execução