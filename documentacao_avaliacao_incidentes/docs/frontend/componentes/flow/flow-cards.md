# Componente de Cards de Fluxo

## Visão Geral
Os `FlowCards` são componentes visuais que representam itens no fluxo de inventário.

## Comparação Angular vs React

### React
```jsx
function FlowCard({ item, type, selected, onSelect }) {
  const Icon = getIcon(type);
  
  return (
    <div 
      className={`flow-card ${selected ? 'selected' : ''}`}
      onClick={() => onSelect(item)}
    >
      <Icon />
      <div className="content">{/* ... */}</div>
    </div>
  );
}
```

### Angular
```typescript
@Component({
  selector: 'app-flow-card',
  template: `
    <div 
      class="flow-card"
      [class.selected]="selected"
      (click)="select.emit(item)"
    >
      <i [class]="icon"></i>
      <div class="content">...</div>
    </div>
  `
})
export class FlowCardComponent {
  @Input() item: any;
  @Input() type: string;
  @Input() selected: boolean;
  @Output() select = new EventEmitter<any>();
}
```

## Funcionalidades

### 1. Ícones Dinâmicos
```jsx
// React
const getIcon = (type) => {
  switch(type) {
    case 'client': return FaBuilding;
    case 'site': return FaServer;
    default: return FaCog;
  }
};

// Angular
getIcon(type: string): string {
  switch(type) {
    case 'client': return 'building';
    case 'site': return 'server';
    default: return 'cog';
  }
}
```

### 2. Estados Visuais
```jsx
// React
<div className={`flow-card ${status}`}>

// Angular
<div [ngClass]="['flow-card', status]">
```

## Props/Inputs

### React Props
```typescript
interface FlowCardProps {
  item: any;
  type: string;
  selected: boolean;
  onSelect: (item: any) => void;
}
```

### Angular Inputs/Outputs
```typescript
@Input() item: any;
@Input() type: string;
@Input() selected: boolean;
@Output() select = new EventEmitter<any>();
```

## Dicas de Migração

1. **Manipulação de Classes**
   - Angular: `[ngClass]`
   - React: Template literals ou classnames

2. **Eventos**
   - Angular: `(click)="onSelect()"`
   - React: `onClick={() => onSelect()}`

3. **Renderização Condicional**
   - Angular: `*ngIf`
   - React: `&&` ou operador ternário
