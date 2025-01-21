# Página de Fluxo de Inventário

## Visão Geral
A visualização em fluxo permite navegar pela hierarquia do inventário de forma visual e interativa.

## Comparação Angular vs React

### Estrutura do Componente

#### React (Hooks)
```jsx
function InventoryFlowPage() {
  const [data, setData] = useState({
    economic_groups: [],
    clients: [],
    sites: [],
    equipments: [],
    services: []
  });

  return (
    <div className="inventory-flow">
      <InventoryFlow data={data} onFetchData={fetchData} />
    </div>
  );
}
```

#### Angular (Component)
```typescript
@Component({
  selector: 'app-inventory-flow',
  templateUrl: './inventory-flow.component.html'
})
export class InventoryFlowComponent {
  data = {
    economic_groups: [],
    clients: [],
    sites: [],
    equipments: [],
    services: []
  };
}
```

## Componentes do Fluxo

1. [Cards de Item](componentes/flow-cards.md)
   - Exibição de informações
   - Estados ativos/inativos
   - Ícones dinâmicos

2. [Seções de Fluxo](componentes/flow-sections.md)
   - Organização hierárquica
   - Filtragem por seção
   - Pesquisa contextual

3. [Controles de Navegação](componentes/flow-controls.md)
   - Paginação
   - Filtros de status
   - Pesquisa

## Gerenciamento de Estado

### React
```jsx
const [selected, setSelected] = useState({
  economic_group: null,
  client: null,
  site: null,
  equipment: null,
  service: null
});
```

### Angular
```typescript
selected = {
  economic_group: null,
  client: null,
  site: null,
  equipment: null,
  service: null
};
```

## Eventos e Interações

### React
```jsx
const handleSelect = async (type, item) => {
  setSelected(prev => ({ ...prev, [type]: item }));
  await fetchRelatedData(type, item.id);
};
```

### Angular
```typescript
async handleSelect(type: string, item: any) {
  this.selected[type] = item;
  await this.fetchRelatedData(type, item.id);
}
```

## Considerações de Performance

1. **Carregamento Sob Demanda**: Dados carregados conforme necessário
2. **Memorização**: Cache de dados já carregados
3. **Renderização Condicional**: Componentes renderizados apenas quando necessário
4. **Otimização de Consultas**: Filtros aplicados no servidor

## Migração Angular → React

1. Adaptar observables para promises/async-await
2. Implementar gerenciamento de estado com hooks
3. Converter templates aninhados para componentes JSX
4. Adaptar injeção de dependência para Context API
