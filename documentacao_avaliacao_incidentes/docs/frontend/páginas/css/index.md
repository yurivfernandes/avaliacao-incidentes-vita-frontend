# Páginas do Sistema

Esta seção contém a documentação detalhada de todas as páginas do sistema.

## Estrutura de Páginas

- **Login**: Página de autenticação do sistema
- **Dashboard**: Página inicial após o login
- **Inventário**: Páginas relacionadas à gestão de inventário
- **Incidentes**: Páginas de gestão de incidentes

# Documentação de Estilos CSS

Este documento contém a documentação detalhada de todos os estilos CSS utilizados no sistema.

## Índice de Estilos

### 1. Header (Header.css)
- Barra de navegação principal
- Menu responsivo
- Submenu do usuário
- Estilos do logotipo
- Adaptações mobile

### 2. Páginas de Autenticação

#### Login (LoginPage.css)
- Container principal
- Card de login
- Formulário de autenticação
- Estilos de inputs
- Botões de ação
- Mensagens de erro
- Adaptação responsiva

### 3. Páginas do Sistema

#### Boas-vindas (WelcomePage.css)
- Container principal com background gradiente
- Cards de funcionalidades
- Efeitos de hover
- Formas geométricas animadas
- Grid responsivo de cards
- Ícones e subtítulos
- Estados desabilitados

#### Perfil (ProfilePage.css)
- Layout do perfil
- Formulário de edição
- Campos de entrada
- Mensagens de feedback
- Botões de ação
- Estilos responsivos

#### Senha (PasswordPage.css)
- Container principal
- Card de alteração de senha
- Formulário de senha
- Validações visuais
- Mensagens de erro/sucesso
- Adaptações mobile

### 4. Sistema de Inventário

#### Página Principal (InventoryPage.css)
- Layout da página
- Header com ações
- Sistema de tabs
- Container de tabelas
- Dropdown de ações
- Adaptação responsiva

#### Tabelas de Inventário (InventoryTables.css)
- Estrutura da tabela
- Cabeçalhos fixos
- Células de dados
- Estados de linha
- Sistema de paginação
- Filtros avançados
- Controles de tabela
- Toggle de status
- Mensagens de estado vazio

#### Fluxo de Inventário (InventoryFlow.css)
- Grid de seções
- Cards de itens
- Indicadores de status
- Sistema de busca
- Paginação de itens
- Headers de seção
- Estilos responsivos

#### Filtros (FilterDropdown.css)
- Dropdown de filtros
- Campos de filtro
- Busca de clientes
- Botões de ação
- Validações de campo
- Estados de input
- Mensagens de erro
- Layout responsivo

## Convenções de Nomenclatura

- Prefixos específicos por página (ex: `inventory-`, `profile-`, `welcome-`)
- Classes BEM para componentes
- Utilitários com prefixo específico
- Estados com sufixos descritivos (`-active`, `-disabled`)

## Variáveis e Temas

### Cores Principais
- Roxo primário: `#670099`
- Rosa secundário: `#D8337D`
- Gradientes personalizados
- Cores de estado (sucesso, erro, alerta)

### Breakpoints Responsivos
- Mobile: max-width 768px
- Tablet: max-width 1024px
- Desktop: min-width 1025px

## Boas Práticas

1. Uso de prefixos para evitar conflitos
2. Estrutura modular por componente
3. Responsividade mobile-first
4. Reutilização de variáveis CSS
5. Organização por especificidade
6. Documentação inline de componentes complexos
