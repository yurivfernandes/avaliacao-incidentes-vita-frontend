# Página de Gestão de Incidentes

## Visão Geral
A página de gestão de incidentes permite visualizar e gerenciar ocorrências do sistema. Esta documentação compara as implementações React e Angular.

## Principais Diferenças

### Estrutura do Componente

#### React (Hooks)
```jsx
function IncidentManagementPage() {
  const [activeTab, setActiveTab] = useState('incidents');
  const [filters, setFilters] = useState({});
  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    fetchData();
  }, [filters, activeTab]);

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
  selector: 'app-incident-management',
  templateUrl: './incident-management.component.html'
})
export class IncidentManagementComponent implements OnInit {
  activeTab = 'incidents';
  filters = {};
  tableData = [];

  ngOnInit() {
    this.fetchData();
  }
}
```

## Gerenciamento de Estado

### React
```jsx
const [tableData, setTableData] = useState([]);
const [loading, setLoading] = useState(false);
const [totalPages, setTotalPages] = useState(1);
```

### Angular
```typescript
tableData: Incident[] = [];
loading = false;
totalPages = 1;
```

## Integração com API

### React (Fetch API)
```jsx
const fetchData = async (page = 1) => {
  try {
    setLoading(true);
    const response = await api.get(`/incidentes/list/?${queryString}`);
    setTableData(response.data.results);
  } catch (error) {
    console.error('Erro:', error);
  }
};
```

### Angular (HttpClient)
```typescript
fetchData(page = 1) {
  this.loading = true;
  this.http.get(`/api/incidentes/list/?${queryString}`)
    .subscribe(
      (data: any) => {
        this.tableData = data.results;
      },
      error => console.error('Erro:', error)
    );
}
```

## Componentes Principais

1. [Tabela de Incidentes](../componentes/incident-table.md)
   - Exibição dos incidentes
   - Paginação
   - Ordenação

2. [Filtros de Incidentes](../componentes/incident-filter.md)
   - Filtragem por múltiplos critérios
   - Busca por período
   - Filtros combinados

## Considerações de Performance

1. **Paginação**: Implementada para grandes conjuntos de dados
2. **Filtragem**: Executada no servidor
3. **Carregamento**: Estados de loading para feedback
4. **Cache**: Armazenamento temporário de dados filtrados

## Migração Angular → React

1. **Serviços → Hooks**
   ```jsx
   // React
   const [data, setData] = useState([]);
   useEffect(() => { fetchData(); }, []);

   // Angular
   export class IncidentService {
     getData() { /* ... */ }
   }
   ```

2. **Templates → JSX**
   ```jsx
   // React
   return <div>{data.map(item => <Row key={item.id} {...item} />)}</div>

   // Angular
   <div *ngFor="let item of data">
     <app-row [data]="item"></app-row>
   </div>
   ```

3. **Injeção de Dependência → Context**
   ```jsx
   // React
   const { api } = useContext(ApiContext);

   // Angular
   constructor(private api: ApiService) {}
   ```

## Boas Práticas

1. Separar lógica de negócio de componentes de apresentação
2. Implementar tratamento de erros consistente
3. Utilizar TypeScript para tipagem
4. Manter estados locais quando possível
