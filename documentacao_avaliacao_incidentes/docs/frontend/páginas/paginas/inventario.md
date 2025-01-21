# Página de Inventário (Tabela)

## Visão Geral
A página de inventário em formato tabular permite visualizar e gerenciar todos os elementos do inventário de forma estruturada.

## Comparação Angular vs React

### Estrutura do Componente

#### React (Hooks)
```jsx
function InventoryPage() {
  const [activeTab, setActiveTab] = useState('economic_groups');
  const [filters, setFilters] = useState({});
  const [tableData, setTableData] = useState({});

  useEffect(() => {
    fetchData(activeTab);
  }, [activeTab]);

  return (
    <div className="inventory-page">
      {/* Estrutura da página */}
    </div>
  );
}
```

#### Angular (Component)
```typescript
@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html'
})
export class InventoryComponent implements OnInit {
  activeTab = 'economic_groups';
  filters = {};
  tableData = {};

  ngOnInit() {
    this.fetchData(this.activeTab);
  }
}
```

## Componentes Principais

1. [Tabela de Inventário](../componentes/tables/inventory-table.md)
   - Exibição tabular dos dados
   - Paginação
   - Edição inline

2. [Filtros](../componentes/dropdown/filter-dropdown.md)
   - Filtragem por diferentes critérios
   - Pesquisa dinâmica

3. [Formulários de Adição](componentes/add-dropdowns.md)
   - Adição de novos itens
   - Validação de dados

## Gerenciamento de Estado

### React
```jsx
// Context e Hooks
const { token } = useAuth();
const [tableData, setTableData] = useState({});
```

### Angular
```typescript
// Services e Injeção de Dependência
constructor(
  private authService: AuthService,
  private inventoryService: InventoryService
) {}
```

## Ciclo de Vida e Atualizações

### React
```jsx
useEffect(() => {
  fetchData(activeTab);
}, [activeTab, filters]);
```

### Angular
```typescript
ngOnChanges(changes: SimpleChanges) {
  if (changes.activeTab || changes.filters) {
    this.fetchData(this.activeTab);
  }
}
```

## Integração com API

### React (Fetch API)
```jsx
const fetchData = async (type) => {
  const response = await api.get(`/inventario/${type}/`);
  setTableData(response.data);
};
```

### Angular (HttpClient)
```typescript
fetchData(type: string) {
  this.http.get(`/api/inventario/${type}/`)
    .subscribe(data => this.tableData = data);
}
```

## Considerações de Performance

1. **Paginação**: Implementada para grandes conjuntos de dados
2. **Filtragem**: Executada no servidor para melhor performance
3. **Edição**: Atualização otimista da UI
4. **Memorização**: Uso de `useMemo` e `useCallback` em React

## Migração Angular → React

1. Substituir serviços por hooks personalizados
2. Adaptar templates para JSX
3. Implementar gerenciamento de estado com Context API
4. Utilizar componentes funcionais com hooks
````
