# Componente Header

## Visão Geral
O componente Header é responsável pela navegação principal do sistema, exibindo o logo, menu de navegação e controles de usuário.

## Estrutura do Componente

### React
```jsx
function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="app-header">
      <div className="app-header-content">
        {/* Estrutura do header */}
      </div>
    </header>
  );
}
```

### Angular
```typescript
@Component({
  selector: 'app-header',
  template: `
    <header class="app-header">
      <div class="app-header-content">
        <!-- Estrutura do header -->
      </div>
    </header>
  `
})
export class HeaderComponent {
  menuOpen = false;
  user: User;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.user = this.authService.currentUser;
  }
}
```

## Menu de Navegação

### Estrutura do Menu (React)
```typescript
interface MenuItem {
  icon: ReactNode;
  text: string;
  submenu?: {
    to: string;
    icon: ReactNode;
    text: string;
  }[];
  to?: string;
}

const menuItems: MenuItem[] = [
  { 
    icon: <FaDatabase />, 
    text: "Inventário",
    submenu: [
      { to: "/inventario", icon: <FaDatabase />, text: "Acessar Inventário" },
      { to: "/inventario/flow", icon: <FaThLarge />, text: "Fluxo de Inventário" }
    ]
  },
  { to: "/incidentes", icon: <FaChartBar />, text: "Gestão de Incidentes" }
];
```

### Estrutura do Menu (Angular)
```typescript
interface MenuItem {
  icon: string;
  text: string;
  submenu?: {
    route: string;
    icon: string;
    text: string;
  }[];
  route?: string;
}

const menuItems: MenuItem[] = [
  {
    icon: 'database',
    text: 'Inventário',
    submenu: [
      { route: '/inventario', icon: 'database', text: 'Acessar Inventário' },
      { route: '/inventario/flow', icon: 'th-large', text: 'Fluxo de Inventário' }
    ]
  },
  { route: '/incidentes', icon: 'chart-bar', text: 'Gestão de Incidentes' }
];
```

## Menu Mobile

### React (Hooks)
```jsx
const [menuOpen, setMenuOpen] = useState(false);

const toggleMenu = () => {
  setMenuOpen(!menuOpen);
};
```

### Angular (Property Binding)
```typescript
menuOpen = false;

toggleMenu(): void {
  this.menuOpen = !this.menuOpen;
}
```

## Autenticação e Navegação

### React (Context e Hooks)
```jsx
const { user, logout } = useAuth();
const navigate = useNavigate();

const handleLogout = async () => {
  await logout();
  navigate('/login');
};
```

### Angular (Service e Router)
```typescript
constructor(
  private authService: AuthService,
  private router: Router
) {}

async handleLogout(): Promise<void> {
  await this.authService.logout();
  this.router.navigate(['/login']);
}
```

## Menu do Usuário

### React (JSX)
```jsx
<li className="user-menu">
  <span className="user-name">
    <FaUser />
    <span>{`${user?.first_name || ''} ${user?.last_name || ''}`}</span>
  </span>
  <ul className="user-submenu">
    <li>
      <Link to="/perfil/senha">
        <FaKey />
        <span>Alterar Senha</span>
      </Link>
    </li>
    <li>
      <button onClick={handleLogout}>
        <FaSignOutAlt />
        <span>Sair</span>
      </button>
    </li>
  </ul>
</li>
```

### Angular (Template)
```html
<li class="user-menu">
  <span class="user-name">
    <i class="fas fa-user"></i>
    <span>{{ user?.firstName }} {{ user?.lastName }}</span>
  </span>
  <ul class="user-submenu">
    <li>
      <a [routerLink]="['/perfil/senha']">
        <i class="fas fa-key"></i>
        <span>Alterar Senha</span>
      </a>
    </li>
    <li>
      <button (click)="handleLogout()">
        <i class="fas fa-sign-out-alt"></i>
        <span>Sair</span>
      </button>
    </li>
  </ul>
</li>
```

## Responsividade

### Hamburger Menu
```jsx
// React
<div className={`hamburger ${menuOpen ? 'active' : ''}`} onClick={toggleMenu}>
  <span className="bar"></span>
  <span className="bar"></span>
  <span className="bar"></span>
</div>

// Angular
<div 
  class="hamburger"
  [class.active]="menuOpen"
  (click)="toggleMenu()"
>
  <span class="bar"></span>
  <span class="bar"></span>
  <span class="bar"></span>
</div>
```

## Dicas de Migração

1. **Gerenciamento de Estado**
   - Angular: Services e BehaviorSubject
   - React: Context API e useState

2. **Navegação**
   - Angular: Router e routerLink
   - React: React Router e useNavigate

3. **Eventos**
   - Angular: (click)="handler()"
   - React: onClick={handler}

4. **Classes Condicionais**
   - Angular: [ngClass]="{ 'active': isActive }"
   - React: className={`menu ${isActive ? 'active' : ''}`}

## Considerações de Performance

1. Evitar re-renderizações desnecessárias
2. Implementar memo() para subcomponentes estáticos
3. Usar lazy loading para rotas
4. Otimizar manipulação de eventos no menu mobile
