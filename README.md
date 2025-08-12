# Casa Mattos - Sistema de Gestão

Sistema de gestão de estoque e endereçamento para Casa Mattos, desenvolvido com arquitetura DDD (Domain-Driven Design).

## 🚀 Tecnologias

### Backend
- **Node.js** com TypeScript
- **Express.js** para API REST
- **Sequelize** como ORM
- **PostgreSQL** como banco de dados
- **JWT** para autenticação
- **Arquitetura DDD** (Domain-Driven Design)

### Frontend
- **React** com TypeScript
- **Vite** como bundler
- **Material-UI** para componentes
- **React Router** para roteamento
- **Axios** para requisições HTTP
- **React Hook Form** para formulários

## 📱 Funcionalidades

- **Autenticação**: Sistema de login com JWT
- **Dashboard**: Visão geral do sistema
- **Fornecedores**: Cadastro e gestão de fornecedores
- **Produtos**: Gestão completa de produtos
- **Endereçamentos**: Controle de localização dos produtos
- **Listas de Separação**: Sistema de listas para separação de produtos
- **Responsividade**: Interface adaptada para desktop, tablet e celular

## 🔧 Como executar

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Configure o .env com suas credenciais do banco
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 📊 Estrutura do Banco

Ver arquivo `bd-postgres.sql` para o script de criação do banco de dados PostgreSQL.
