# Componente de Tabela de Inventário

## Visão Geral
O componente `InventoryTable` é responsável pela exibição e manipulação dos dados em formato tabular.

## Comparação Angular vs React

### React
```jsx
function InventoryTable({ data, type, onPageChange }) {
  const [editingId, setEditingId] = useState(null);
  
  return (
    <table className="inventory-table">
      <thead>{/* ... */}</thead>
      <tbody>
        {data.map(item => (
          <tr key={item.id}>
            {/* Células da tabela */}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

### Angular
```typescript
@Component({
  selector: 'app-inventory-table',
  template: `
    <table class="inventory-table">
      <thead>...</thead>
      <tbody>
        <tr *ngFor="let item of data">
          <!-- Células da tabela -->
        </tr>
      </tbody>
    </table>
  `
})
export class InventoryTableComponent {
  @Input() data: any[];
  @Input() type: string;
  @Output() pageChange = new EventEmitter<number>();
}
```

## Recursos Principais

### 1. Edição Inline
```jsx
// React
const handleEdit = (id) => {
  setEditingId(id);
};

// Angular
editItem(id: number): void {
  this.editingId = id;
}
```

### 2. Paginação
```jsx
// React
const Pagination = ({ current, total, onChange }) => (
  <div className="pagination">
    <button onClick={() => onChange(current - 1)}>Anterior</button>
    <span>{current} de {total}</span>
    <button onClick={() => onChange(current + 1)}>Próximo</button>
  </div>
);

// Angular
<app-pagination
  [currentPage]="currentPage"
  [totalPages]="totalPages"
  (pageChange)="onPageChange($event)"
>
</app-pagination>
```

### 3. Ordenação
```jsx
// React
const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

// Angular
sortConfig = { key: null, direction: 'asc' };
```

## Props/Inputs

### React Props
```typescript
interface InventoryTableProps {
  data: any[];
  type: string;
  loading?: boolean;
  onPageChange: (page: number) => void;
  totalPages: number;
  currentPage: number;
}
```

### Angular Inputs/Outputs
```typescript
@Input() data: any[];
@Input() type: string;
@Input() loading: boolean;
@Input() totalPages: number;
@Input() currentPage: number;
@Output() pageChange = new EventEmitter<number>();
```

## Dicas de Migração

1. **Renderização Condicional**
   - Angular: `*ngIf`
   - React: Operador && ou ternário

2. **Loops**
   - Angular: `*ngFor`
   - React: `.map()`

3. **Eventos**
   - Angular: `(click)="handleClick()"`
   - React: `onClick={handleClick}`

4. **Classes Condicionais**
   - Angular: `[ngClass]="{ 'active': isActive }"`
   - React: `className={isActive ? 'active' : ''}`
