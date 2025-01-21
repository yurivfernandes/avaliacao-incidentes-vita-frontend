# Componente de Seções do Fluxo

## Visão Geral
O componente `FlowSection` organiza os cards em seções hierárquicas do inventário.

## Comparação Angular vs React

### React
```jsx
function FlowSection({ 
  title, 
  items, 
  onSearch, 
  onSelect 
}) {
  return (
    <div className="flow-section">
      <header>
        <h3>{title}</h3>
        <SearchInput onSearch={onSearch} />
      </header>
      <div className="cards-container">
        {items.map(item => (
          <FlowCard 
            key={item.id} 
            item={item} 
            onSelect={onSelect} 
          />
        ))}
      </div>
    </div>
  );
}
```

### Angular
```typescript
@Component({
  selector: 'app-flow-section',
  template: `
    <div class="flow-section">
      <header>
        <h3>{{title}}</h3>
        <app-search (search)="search.emit($event)"></app-search>
      </header>
      <div class="cards-container">
        <app-flow-card
          *ngFor="let item of items"
          [item]="item"
          (select)="select.emit($event)"
        >
        </app-flow-card>
      </div>
    </div>
  `
})
export class FlowSectionComponent {
  @Input() title: string;
  @Input() items: any[];
  @Output() search = new EventEmitter<string>();
  @Output() select = new EventEmitter<any>();
}
```

## Funcionalidades

### 1. Pesquisa Contextual
```jsx
// React
const [searchTerm, setSearchTerm] = useState('');
const handleSearch = (term) => {
  setSearchTerm(term);
  onSearch(term);
};

// Angular
searchTerm: string = '';
handleSearch(term: string): void {
  this.searchTerm = term;
  this.search.emit(term);
}
```

### 2. Filtragem
```jsx
// React
const filteredItems = items.filter(item => 
  item.name.toLowerCase().includes(searchTerm.toLowerCase())
);

// Angular
get filteredItems() {
  return this.items.filter(item => 
    item.name.toLowerCase().includes(this.searchTerm.toLowerCase())
  );
}
```

## Props/Inputs

### React Props
```typescript
interface FlowSectionProps {
  title: string;
  items: any[];
  onSearch: (term: string) => void;
  onSelect: (item: any) => void;
}
```

### Angular Inputs/Outputs
```typescript
@Input() title: string;
@Input() items: any[];
@Output() search = new EventEmitter<string>();
@Output() select = new EventEmitter<any>();
```

## Dicas de Migração

1. **Composição de Componentes**
   - Angular: Tags de componente
   - React: Componentes como elementos JSX

2. **Ciclo de Vida**
   - Angular: `ngOnInit`, `ngOnChanges`
   - React: `useEffect`

3. **Comunicação entre Componentes**
   - Angular: `@Input()`, `@Output()`
   - React: Props e Callbacks
