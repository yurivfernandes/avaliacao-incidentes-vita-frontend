# Página Welcome (Página Inicial)

## Visão Geral
A página inicial (Welcome) serve como dashboard principal do sistema, apresentando cards interativos para navegação entre os módulos. Esta documentação compara as implementações React e Angular.

## Principais Diferenças

### Estrutura de Componentes

#### React (Componente Funcional)
```jsx
function WelcomePage() {
  const { user } = useAuth();
  
  useEffect(() => {
    document.title = 'Gestão de Inventário | Home';
  }, []);

  return (
    // JSX estrutura
  );
}
```

#### Angular (Component Class)
```typescript
@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html'
})
export class WelcomeComponent implements OnInit {
  user: User;
  
  constructor(private authService: AuthService) {
    this.user = this.authService.currentUser;
  }

  ngOnInit(): void {
    document.title = 'Gestão de Inventário | Home';
  }
}
```

### Renderização de Listas

#### React (map)
```jsx
{cards.map((card, index) => (
  <div key={index} className="welcome-card">
    {/* conteúdo do card */}
  </div>
))}
```

#### Angular (*ngFor)
```html
<div *ngFor="let card of cards" class="welcome-card">
  <!-- conteúdo do card -->
</div>
```

### Context vs Service

#### React (Context)
```jsx
const { user } = useAuth();  // Usando Context Hook
```

#### Angular (Service)
```typescript
constructor(private authService: AuthService) {
  this.user = this.authService.currentUser;
}
```

## Estrutura de Dados

### Definição de Cards

#### React
```jsx
const cards = [
  {
    title: 'Inventário',
    description: 'Gerencie clientes, sites, equipamentos e serviços',
    active: true,
    icon: <FaWarehouse size={32} />,
    subItems: [/*...*/]
  }
];
```

#### Angular
```typescript
interface Card {
  title: string;
  description: string;
  active: boolean;
  icon: string;
  subItems: SubItem[];
}

cards: Card[] = [
  {
    title: 'Inventário',
    description: 'Gerencie clientes, sites, equipamentos e serviços',
    active: true,
    icon: 'warehouse',
    subItems: [/*...*/]
  }
];
```

## Boas Práticas

1. **Componentização**
   - React: Divida em componentes funcionais menores
   - Angular: Use componentes apresentacionais e smart components

2. **Gerenciamento de Estado**
   - React: Context para estado global, useState para local
   - Angular: Services para estado global, variáveis de classe para local

3. **Tipagem**
   - Use TypeScript em ambos para melhor manutenibilidade
   - Defina interfaces para estruturas de dados

4. **Performance**
   - React: Use memo() para componentes que não precisam re-renderizar
   - Angular: Use OnPush strategy para otimizar change detection

## Migração Angular → React

1. Substitua `*ngFor` por `.map()`
2. Troque `*ngIf` por condicionais com `&&` ou operador ternário
3. Substitua Services por Context ou hooks personalizados
4. Adapte event bindings de `(click)` para `onClick`

## Conclusão

A migração de Angular para React requer principalmente adaptação na:
- Sintaxe de template
- Gerenciamento de estado
- Sistema de dependências
- Ciclo de vida dos componentes
