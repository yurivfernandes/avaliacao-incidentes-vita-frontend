import axios from 'axios';

const api = axios.create({
  //baseURL: 'http://localhost:8000/api', // Verifique se esta URL está correta
  baseURL: 'https://api-avaliacao-incidentes.gestri.com.br/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Lista de rotas que não precisam de token
const publicRoutes = [
  'access/login/',
  'access/signup/',
  'docs/', // Adicionar rota da documentação como pública
];

api.interceptors.request.use(config => {
  const isPublicRoute = publicRoutes.some(route => config.url.includes(route));
  
  if (!isPublicRoute) {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
  }
  
  return config;
}, error => {
  return Promise.reject(error);
});

// Interceptor para tratamento de erros
api.interceptors.response.use(
  response => response,
  error => {
    return Promise.reject(error);
  }
);

export default api;
