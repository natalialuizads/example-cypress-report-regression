# Example Cypress Report Regression

Projeto multi-aplicação com **Cypress**, **Docusaurus**, **Angular Web Components** e **API Node.js** - tudo em **TypeScript**.

## 📁 Estrutura do Projeto

```
example-cypress-report-regression/
├── cypress/              # Testes E2E com Cypress
│   ├── e2e/             # Arquivos de teste
│   └── support/         # Comandos customizados
├── docs/                # Documentação com Docusaurus
├── web-components/      # Aplicação Angular (Web Components)
│   └── src/
│       └── app/
│           └── components/
├── api/                 # API fake em Node.js
│   └── src/
│       ├── routes/      # Rotas da API
│       └── server.ts    # Servidor Express
├── cypress.config.ts    # Configuração do Cypress
├── package.json         # Scripts do monorepo
└── tsconfig.json        # Config TypeScript (Cypress)
```

## 🚀 Começando

### Pré-requisitos

- Node.js 18 ou superior
- npm

### Instalação

```bash
# Instalar dependências de todas as aplicações
npm run install:all

# Ou instalar individualmente:
npm install              # Root (Cypress)
npm run docs:install     # Docusaurus
npm run wc:install       # Web Components
npm run api:install      # API
```

## 📦 Aplicações

### 1. Cypress (Testes E2E)

Testes end-to-end escritos em TypeScript.

```bash
# Abrir Cypress UI
npm run cypress:open

# Executar testes headless
npm run cypress:run

# Executar com navegador visível
npm run cypress:run:headed
```

**Arquivos principais:**
- `cypress/e2e/example.cy.ts` - Testes de exemplo
- `cypress/support/commands.ts` - Comandos customizados
- `cypress.config.ts` - Configuração

### 2. Docusaurus (Documentação)

Site de documentação estático.

```bash
# Iniciar servidor de desenvolvimento
npm run docs:start

# Build para produção
npm run docs:build
```

Acesse: http://localhost:3000

### 3. Angular Web Components

Aplicação Angular que gera web components reutilizáveis.

```bash
# Iniciar servidor de desenvolvimento
npm run wc:start

# Build para produção
npm run wc:build
```

**Web Components disponíveis:**
- `<hello-world>` - Componente de exemplo

**Uso:**
```html
<hello-world name="Seu Nome"></hello-world>
```

### 4. API Node.js

API fake com Express para testes.

```bash
# Modo desenvolvimento (com hot reload)
npm run api:dev

# Modo produção
npm run api:start
```

Acesse: http://localhost:3001

**Endpoints disponíveis:**

- `GET /api/users` - Lista todos os usuários
- `GET /api/users/:id` - Busca usuário por ID
- `POST /api/users` - Cria novo usuário
- `GET /api/products` - Lista todos os produtos
- `GET /api/products/:id` - Busca produto por ID
- `GET /api/products?category=Electronics` - Filtra por categoria
- `GET /api/products?inStock=true` - Filtra por disponibilidade

## 🎯 Executar Tudo

```bash
# Iniciar API, Web Components e Docs simultaneamente
npm run start:all
```

## 🧪 Testes

Os testes Cypress estão configurados para testar:
- Navegação e acessibilidade
- Responsividade
- Integração com a API
- Web Components

## 📚 Documentação

A documentação completa está disponível na pasta `docs/` e inclui:
- Guia de início rápido
- Referência da API
- Exemplos de uso
- Melhores práticas

## 🛠️ Tecnologias

- **Cypress** 13.6+ - Testes E2E
- **Docusaurus** 3.0+ - Documentação
- **Angular** 21.0+ - Web Components
- **Express** 4.18+ - API Server
- **TypeScript** 5.3+ - Tipagem estática
- **Node.js** 18+ - Runtime

## 📝 Scripts Disponíveis

### Root
- `npm run install:all` - Instala todas as dependências
- `npm run start:all` - Inicia todas as aplicações

### Cypress
- `npm run cypress:open` - Abre Cypress UI
- `npm run cypress:run` - Executa testes

### Docs
- `npm run docs:start` - Inicia Docusaurus
- `npm run docs:build` - Build de produção

### Web Components
- `npm run wc:start` - Inicia Angular dev server
- `npm run wc:build` - Build de produção

### API
- `npm run api:dev` - Inicia API em modo dev
- `npm run api:start` - Inicia API em modo produção

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

MIT
