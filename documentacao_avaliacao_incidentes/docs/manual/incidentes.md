# Gestão de Incidentes

## Visão Geral

O módulo de Gestão de Incidentes integra-se com o ServiceNow para gerenciar:

- Incidentes relacionados a equipamentos
- Manutenções preventivas
- Manutenções corretivas

## Interface Visual

### Tela Principal
![Tela Principal de Incidentes](../assets/incidentes/gestao-incidentes.png)

A interface principal mostra a tabela de incidentes com as seguintes áreas:
1. Menu de navegação superior
2. Abas (Incidentes/Gestão)
3. Botão de Filtros
4. Tabela de dados paginada
5. Controles de paginação

### Painel de Filtros
![Painel de Filtros](../assets/incidentes/gestao-incidentes-filtro.png)

O painel de filtros oferece as seguintes opções de busca:

#### Filtros Básicos
- Número do Incidente
- Status (Pendente, Em Andamento, Resolvido, Fechado)
- Origem
- Categoria
- Subcategoria
- Detalhe da Subcategoria
- Descrição

#### Filtros de Data
- Período de Abertura (Data inicial e final)
- Período de Fechamento (Data inicial e final)
- Período de Resolução (Data inicial e final)

## Funcionalidades

### Tabela de Incidentes
A tabela apresenta as seguintes informações:
- Número do Incidente
- Responsável pela abertura
- Origem do chamado
- Categorização completa
- Tipo de contato
- Fila de atendimento
- Datas de abertura, fechamento e resolução
- Duração total
- Status atual

### Paginação e Navegação
- 50 registros por página
- Navegação entre páginas
- Indicador de total de registros
- Controles de anterior/próximo

### Status dos Incidentes
- **Pendente**: Aguardando atendimento inicial
- **Em Andamento**: Em processo de resolução pela equipe técnica
- **Resolvido**: Solução implementada, aguardando confirmação
- **Fechado**: Incidente encerrado e validado

### Gestão de Filtros
- Aplicação de múltiplos filtros simultaneamente
- Limpeza rápida de todos os filtros
- Indicador visual de filtros ativos
- Persistência dos filtros durante a navegação

## Integração ServiceNow

### Sincronização
- Atualização automática a cada 5 minutos
- Sincronização manual disponível
- Registro de histórico de sincronização

### Fluxo de Dados
1. Recebimento do incidente do ServiceNow
2. Processamento e categorização
3. Atualização do status
4. Envio de atualizações

## Dicas de Uso

### Boas Práticas
1. Utilize filtros específicos para buscas precisas
2. Combine filtros de data para análises periódicas
3. Monitore incidentes pendentes regularmente
4. Verifique a sincronização em caso de divergências