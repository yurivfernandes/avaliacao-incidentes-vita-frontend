# Página de Alteração de Senha

## Visão Geral
A página de alteração de senha permite que usuários modifiquem suas credenciais de acesso. Esta documentação é focada em auxiliar desenvolvedores Angular a compreenderem a implementação em React.

## Principais Diferenças

### Gerenciamento de Estado

#### React (Hooks)
```jsx
const [formData, setFormData] = useState({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});
```

#### Angular (Two-way Binding)
```typescript
export class PasswordComponent {
  formData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };
}
```

### Manipulação de Eventos

#### React
```jsx
const handleChange = (e) => {
  setFormData({
    ...formData,
    [e.target.name]: e.target.value
  });
};
```

#### Angular
```typescript
handleChange(event: any): void {
  this.formData[event.target.name] = event.target.value;
}
```

### Navegação

#### React (useNavigate)
```jsx
const navigate = useNavigate();
navigate('/login');
```

#### Angular (Router)
```typescript
constructor(private router: Router) {}

// Navegação
this.router.navigate(['/login']);
```

### Ciclo de Vida

#### React (useEffect)
```jsx
useEffect(() => {
  document.title = 'Gestão de Inventário - Alterar Senha';
}, []);
```

#### Angular
```typescript
export class PasswordComponent implements OnInit {
  ngOnInit(): void {
    document.title = 'Gestão de Inventário - Alterar Senha';
  }
}
```

## Exemplos de Implementação

### Template React vs Angular

#### React (JSX)
```jsx
<form onSubmit={handleSubmit} className="password-form">
  <div className="form-group">
    <input
      type="password"
      name="currentPassword"
      value={formData.currentPassword}
      onChange={handleChange}
      required
    />
  </div>
</form>
```

#### Angular (Template)
```html
<form (ngSubmit)="handleSubmit()" class="password-form">
  <div class="form-group">
    <input
      type="password"
      name="currentPassword"
      [(ngModel)]="formData.currentPassword"
      required
    />
  </div>
</form>
```

## Considerações Importantes

1. **Estado**: React utiliza hooks (useState) enquanto Angular usa propriedades de classe com decorators
2. **Eventos**: React usa camelCase (onClick) enquanto Angular usa parenteses ((click))
3. **Binding**: React é unidirecional, Angular oferece two-way binding
4. **Injeção de Dependência**: Angular tem um sistema robusto de DI, React usa Context ou props

## Boas Práticas

1. Mantenha a lógica de validação separada do componente
2. Use tipos TypeScript em ambas as implementações
3. Implemente tratamento de erros adequado
4. Mantenha o estado consistente
