# Componente de Filtros

## Visão Geral
O componente `FilterDropdown` permite filtrar os dados do inventário por diferentes critérios.

## Comparação Angular vs React

### React
```jsx
function FilterDropdown({ filters, setFilters, onApply }) {
  const [localFilters, setLocalFilters] = useState(filters);

  return (
    <div className="filter-dropdown">
      {/* Campos de filtro */}
    </div>
  );
}
```

### Angular
```typescript
@Component({
  selector: 'app-filter-dropdown',
  template: `
    <div class="filter-dropdown">
      <!-- Campos de filtro -->
    </div>
  `
})
export class FilterDropdownComponent {
  @Input() filters: any;
  @Output() filtersChange = new EventEmitter<any>();
  @Output() apply = new EventEmitter<void>();
}
```

## Funcionalidades

### 1. Gerenciamento de Estado Local
```jsx
// React - useState
const [localFilters, setLocalFilters] = useState(filters);

// Angular - Two-way binding
[(ngModel)]="localFilters"
```

### 2. Aplicação de Filtros
```jsx
// React
const handleApply = () => {
  setFilters(localFilters);
  onApply();
};

// Angular
applyFilters(): void {
  this.filtersChange.emit(this.localFilters);
  this.apply.emit();
}
```

### 3. Limpeza de Filtros
```jsx
// React
const clearFilters = () => {
  setLocalFilters({});
};

// Angular
clearFilters(): void {
  this.localFilters = {};
}
```

## Props/Inputs

### React Props
```typescript
interface FilterDropdownProps {
  filters: Record<string, any>;
  setFilters: (filters: Record<string, any>) => void;
  onApply: () => void;
  onClose: () => void;
}
```

### Angular Inputs/Outputs
```typescript
@Input() filters: Record<string, any>;
@Output() filtersChange = new EventEmitter<Record<string, any>>();
@Output() apply = new EventEmitter<void>();
@Output() close = new EventEmitter<void>();
```

## Dicas de Migração

1. **Estado do Formulário**
   - Angular: `ngModel`
   - React: `useState` + `onChange`

2. **Comunicação com Componente Pai**
   - Angular: `@Output()` + `EventEmitter`
   - React: Props de callback

3. **Validação**
   - Angular: Template-driven forms
   - React: Validação manual ou bibliotecas como Formik
