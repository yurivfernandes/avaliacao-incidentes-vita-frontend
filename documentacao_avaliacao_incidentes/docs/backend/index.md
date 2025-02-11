# Backend do Sistema

## Visão Geral

Esta seção documenta a estrutura e os componentes do backend do sistema de Avaliação de Incidentes.

## Tecnologias Utilizadas

### Django Framework
[Django](https://www.djangoproject.com/) é um framework web Python de alto nível que incentiva o desenvolvimento rápido e limpo. Construído por desenvolvedores experientes, ele cuida de grande parte do trabalho de desenvolvimento web, permitindo que você se concentre em escrever seu aplicativo sem precisar reinventar a roda.

#### Principais Características
- ORM poderoso para abstração do banco de dados
- Interface administrativa automática
- Sistema de templates sofisticado
- Framework de formulários
- Sistema de autenticação
- Sistema de cache
- Internacionalização

### Django REST Framework
[DRF](https://www.django-rest-framework.org/) é um kit de ferramentas poderoso e flexível para construir APIs Web em Django.

#### Recursos Principais
- Interface web navegável da API
- Políticas de autenticação incluindo OAuth1a e OAuth2
- Serialização que suporta ORM e fontes de dados não-ORM
- Documentação automática da API

## Instalação do Ambiente

### 1. Instalando o Python

#### Windows
1. Acesse [python.org](https://www.python.org/downloads/)
2. Baixe a versão mais recente do Python (3.8 ou superior)
3. Execute o instalador
4. **IMPORTANTE:** Marque a opção "Add Python to PATH"
5. Clique em "Install Now"

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install python3 python3-pip python3-venv