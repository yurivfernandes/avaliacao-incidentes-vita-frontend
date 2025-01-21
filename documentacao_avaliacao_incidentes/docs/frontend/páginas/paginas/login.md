# Página de Login

## Visão Geral
A página de login é responsável pela autenticação do usuário no sistema. Esta documentação ajudará desenvolvedores Angular a entenderem a implementação em React.

## Comparação Angular vs React

### Estrutura do Componente

#### Angular

### React

A página de login em React é composta por um componente funcional que utiliza hooks para gerenciar o estado e efeitos colaterais. Abaixo está um exemplo básico de uma página de login em React:

```jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/LoginPage.css';
import logo from '../assets/logo_login.svg';

function LoginPage() {
  useEffect(() => {
    document.title = 'Gestão de Inventário - Login';
    const savedFormData = localStorage.getItem('loginFormData');
    if (savedFormData) {
      setFormData(JSON.parse(savedFormData));
    }
  }, []);

  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const value = e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    localStorage.setItem('loginFormData', JSON.stringify(formData));
    
    try {
      const response = await fetch('http://localhost:8000/api/access/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        await login(data.token);
        navigate('/welcome');
      } else {
        setError('Credenciais inválidas. Por favor, tente novamente.');
      }
    } catch (error) {
      setError('Erro ao conectar com o servidor. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <Link to="/">
            <img src={logo} alt="Gestão de Inventário Logo" height="40" />
          </Link>
          <h2>Bem-vindo de volta</h2>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Usuário</label>
            <input
              type="text"
              id="username"
              name="username"
              autoComplete="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Senha</label>
            <input
              type="password"
              id="password"
              name="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
```

### Angular

A página de login em Angular é composta por um componente que utiliza serviços para gerenciar o estado e efeitos colaterais. Abaixo está um exemplo básico de uma página de login em Angular:

```typescript
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  formData = {
    username: '',
    password: ''
  };
  error = '';
  loading = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    const savedFormData = localStorage.getItem('loginFormData');
    if (savedFormData) {
      this.formData = JSON.parse(savedFormData);
    }
  }

  handleChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.formData[target.name] = target.value;
  }

  async handleSubmit(event: Event): Promise<void> {
    event.preventDefault();
    this.loading = true;
    this.error = '';
    localStorage.setItem('loginFormData', JSON.stringify(this.formData));

    try {
      const response = await this.authService.login(this.formData);
      if (response.ok) {
        localStorage.setItem('token', response.token);
        this.router.navigate(['/welcome']);
      } else {
        this.error = 'Credenciais inválidas. Por favor, tente novamente.';
      }
    } catch (error) {
      this.error = 'Erro ao conectar com o servidor. Tente novamente mais tarde.';
    } finally {
      this.loading = false;
    }
  }
}
```

## Conclusão

Ambas as abordagens têm suas vantagens e desvantagens. A escolha entre React e Angular depende das necessidades específicas do projeto e das preferências da equipe de desenvolvimento.