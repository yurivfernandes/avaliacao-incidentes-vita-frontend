# Componente de Filtro de Incidentes

## Visão Geral
O componente `IncidentFilterDropdown` permite filtrar incidentes por múltiplos critérios.

## Comparação Angular vs React

### React
```jsx
function IncidentFilterDropdown({ filters, setFilters, onApply }) {
  const [localFilters, setLocalFilters] = useState(filters);
  const [dateRange, setDateRange] = useState([null, null]);

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
  selector: 'app-incident-filter',
  template: `
    <div class="filter-dropdown">
      <!-- Campos de filtro -->
    </div>
  `
})
export class IncidentFilterComponent {
  @Input() filters: any;
  @Output() filtersChange = new EventEmitter<any>();
  dateRange: [Date, Date] = [null, null];
}
```

## Campos de Filtro

### Informações Básicas
1. **Incidente**
   - Tipo: `string`
   - Descrição: Número ou identificador do incidente
   - Exemplo: `INC123456`

2. **Status**
   - Tipo: `enum`
   - Valores:
     - `PENDING`: Pendente
     - `IN_PROGRESS`: Em Andamento
     - `RESOLVED`: Resolvido
     - `CLOSED`: Fechado

3. **Origem**
   - Tipo: `string`
   - Descrição: Sistema de origem do incidente
   - Exemplo: `Vantive`, `ServiceNow`

### Categorização
1. **Categoria**
   - Tipo: `string`
   - Descrição: Categoria principal do incidente
   - Exemplo: `Rede`, `Acesso`

2. **Subcategoria**
   - Tipo: `string`
   - Descrição: Subdivisão da categoria
   - Exemplo: `Conectividade`, `Bloqueio`

3. **Detalhe Subcategoria**
   - Tipo: `string`
   - Descrição: Especificação detalhada da subcategoria
   - Exemplo: `Link Down`, `Senha Expirada`

### Períodos
1. **Período de Abertura**
   - Tipo: `DateRange`
   - Campos:
     - `data_abertura_inicio`: Data inicial
     - `data_abertura_fim`: Data final
   - Formato: `DD/MM/YYYY`

2. **Período de Fechamento**
   - Tipo: `DateRange`
   - Campos:
     - `data_fechamento_inicio`: Data inicial
     - `data_fechamento_fim`: Data final
   - Formato: `DD/MM/YYYY`

3. **Período de Resolução**
   - Tipo: `DateRange`
   - Campos:
     - `data_resolucao_inicio`: Data inicial
     - `data_resolucao_fim`: Data final
   - Formato: `DD/MM/YYYY`

## Gerenciamento de Estado Local

### React
```jsx
const [localFilters, setLocalFilters] = useState(filters);
const handleChange = (field, value) => {
  setLocalFilters(prev => ({...prev, [field]: value}));
};
```

### Angular
```typescript
localFilters = {...this.filters};
handleChange(field: string, value: any): void {
  this.localFilters[field] = value;
}
```

## Seleção de Datas

### React (com react-datepicker)
```jsx
import DatePicker from 'react-datepicker';

<DatePicker
  selected={startDate}
  onChange={handleDateChange}
  selectsRange
  startDate={startDate}
  endDate={endDate}
/>
```

### Angular (com ngx-datepicker)
```typescript
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';

<ngx-daterangepicker-material
  [(ngModel)]="dateRange"
  (ngModelChange)="handleDateChange($event)"
>
</ngx-daterangepicker-material>
```

## Implementação dos Campos

### React
```jsx
// DatePicker com Range
const DateRangeField = ({ label, startDate, endDate, onChange }) => (
  <div className="incident-filter-field">
    <label className="incident-filter-label">{label}</label>
    <DatePicker
      selectsRange
      startDate={startDate}
      endDate={endDate}
      onChange={onChange}
      dateFormat="dd/MM/yyyy"
      className="incident-filter-input"
      placeholderText="Selecione o período"
    />
  </div>
);

// Campo de Texto
const TextField = ({ label, value, onChange, placeholder }) => (
  <div className="incident-filter-field">
    <label className="incident-filter-label">{label}</label>
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="incident-filter-input"
    />
  </div>
);

// Campo Select
const SelectField = ({ label, value, onChange, options }) => (
  <div className="incident-filter-field">
    <label className="incident-filter-label">{label}</label>
    <select
      value={value}
      onChange={onChange}
      className="incident-filter-input"
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);
```

### Angular
```typescript
// Campo de Data
<mat-form-field>
  <mat-label>{{label}}</mat-label>
  <mat-date-range-input [formGroup]="range" [rangePicker]="picker">
    <input matStartDate formControlName="start" placeholder="Data inicial">
    <input matEndDate formControlName="end" placeholder="Data final">
  </mat-date-range-input>
  <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
  <mat-date-range-picker #picker></mat-date-range-picker>
</mat-form-field>

// Campo de Texto
<mat-form-field>
  <mat-label>{{label}}</mat-label>
  <input matInput [formControl]="control" [placeholder]="placeholder">
</mat-form-field>

// Campo Select
<mat-form-field>
  <mat-label>{{label}}</mat-label>
  <mat-select [formControl]="control">
    <mat-option *ngFor="let opt of options" [value]="opt.value">
      {{opt.label}}
    </mat-option>
  </mat-select>
</mat-form-field>
```

## Interface de Filtros

```typescript
interface IncidentFilters {
  incidente?: string;
  status?: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  origem?: string;
  categoria?: string;
  subcategoria?: string;
  detalhe_subcategoria?: string;
  data_abertura_inicio?: Date;
  data_abertura_fim?: Date;
  data_fechamento_inicio?: Date;
  data_fechamento_fim?: Date;
  data_resolucao_inicio?: Date;
  data_resolucao_fim?: Date;
}
```

## Props/Inputs

### React Props
```typescript
interface IncidentFilterProps {
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  onApply: () => void;
  onClose: () => void;
}
```

### Angular Inputs/Outputs
```typescript
@Input() filters: FilterState;
@Output() filtersChange = new EventEmitter<FilterState>();
@Output() apply = new EventEmitter<void>();
@Output() close = new EventEmitter<void>();
```

## Dicas de Migração

1. **Forms e Validação**
   ```jsx
   // React
   const handleSubmit = (e) => {
     e.preventDefault();
     if (isValid) onApply();
   };

   // Angular
   <form #filterForm="ngForm" (ngSubmit)="onApply()">
   ```

2. **Two-way Binding**
   ```jsx
   // React
   value={value} onChange={e => setValue(e.target.value)}

   // Angular
   [(ngModel)]="value"
   ```

3. **Referências a Elementos**
   ```jsx
   // React
   const inputRef = useRef();

   // Angular
   @ViewChild('input') inputRef: ElementRef;
   ```
