# Componente de Tabela de Incidentes

## Visão Geral
O componente `IncidentTable` exibe os incidentes em formato tabular com recursos de paginação e formatação.

## Comparação Angular vs React

### React
```jsx
function IncidentTable({ data, loading, onPageChange }) {
  return (
    <div className="table-container">
      <table>
        <thead>{/* ... */}</thead>
        <tbody>
          {data.map(incident => (
            <tr key={incident.id}>{/* ... */}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### Angular
```typescript
@Component({
  selector: 'app-incident-table',
  template: `
    <div class="table-container">
      <table>
        <thead>...</thead>
        <tbody>
          <tr *ngFor="let incident of data">
            ...
          </tr>
        </tbody>
      </table>
    </div>
  `
})
export class IncidentTableComponent {
  @Input() data: any[];
  @Output() pageChange = new EventEmitter<number>();
}
```

## Formatação de Dados

### React
```jsx
const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('pt-BR');
};
```

### Angular
```typescript
formatDate(dateString: string): string {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('pt-BR');
}
```

## Props/Inputs

### React Props
```typescript
interface IncidentTableProps {
  data: Incident[];
  loading: boolean;
  onPageChange: (page: number) => void;
  totalPages: number;
  currentPage: number;
}
```

### Angular Inputs/Outputs
```typescript
@Input() data: Incident[];
@Input() loading: boolean;
@Input() totalPages: number;
@Input() currentPage: number;
@Output() pageChange = new EventEmitter<number>();
```

## Dicas de Migração

1. **Renderização de Listas**
   ```jsx
   // React
   {data.map(item => <Row key={item.id} {...item} />)}

   // Angular
   <tr *ngFor="let item of data">
   ```

2. **Formatação de Dados**
   ```jsx
   // React
   const formattedDate = useMemo(() => formatDate(date), [date]);

   // Angular
   get formattedDate() { return this.formatDate(this.date); }
   ```

3. **Loading States**
   ```jsx
   // React
   if (loading) return <LoadingSpinner />;

   // Angular
   <loading-spinner *ngIf="loading"></loading-spinner>
   ```
