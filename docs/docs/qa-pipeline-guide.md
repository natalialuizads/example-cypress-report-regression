# QA Pipeline - Guia de Uso

## 📋 Visão Geral

Este pipeline automatizado conecta todas as aplicações do monorepo para executar testes de regressão e gerar documentação automática.

## 🏗️ Arquitetura

```
┌─────────────────┐
│ Web Components  │ ──► Build ──► Bundle (main.js)
└─────────────────┘                      │
                                         ▼
┌─────────────────┐              ┌──────────────┐
│   API Server    │ ◄────────────┤   Cypress    │
└─────────────────┘              │    Tests     │
                                 └──────────────┘
                                         │
                                         ▼
                                 ┌──────────────┐
                                 │ Runner Script│
                                 │  - Git Meta  │
                                 │  - Bundle ✓  │
                                 │  - Report MD │
                                 └──────────────┘
                                         │
                                         ▼
                                 ┌──────────────┐
                                 │  Docusaurus  │
                                 │   /historico │
                                 └──────────────┘
```

## 🚀 Executando Localmente

### 1. Preparação

```bash
# Instalar todas as dependências
npm run install:all

# Build dos web components
cd web-components
npm run build
cd ..
```

### 2. Iniciar API

```bash
# Terminal 1
npm run api:dev
```

### 3. Executar Runner

```bash
# Terminal 2
node cypress/scripts/runner.js
```

### 4. Visualizar Relatórios

```bash
# Terminal 3
npm run docs:start
# Acesse http://localhost:3000/historico
```

## 🧪 Comandos Customizados do Cypress

### cy.visitMfe()

Carrega um Microfrontend em um shell mockado.

```typescript
// Uso básico
cy.visitMfe('hello-world')

// Com token customizado
cy.visitMfe('hello-world', { 
  token: 'custom-token-123' 
})

// Com atributos adicionais
cy.visitMfe('hello-world', {
  token: 'my-token',
  attributes: {
    theme: 'dark',
    lang: 'pt-BR'
  }
})
```

**Como funciona:**
1. Usa `cy.intercept` para interceptar a página
2. Injeta HTML com o script do MFE
3. Insere a tag do web component com atributos
4. Aguarda o custom element ser definido

### cy.loginAzure()

Mock de login Azure AD (não faz chamada real).

```typescript
// Login padrão
cy.loginAzure()

// Com informações customizadas
cy.loginAzure({
  email: 'admin@example.com',
  name: 'Admin User',
  role: 'admin'
})

// Encadeamento
cy.loginAzure().then((token) => {
  cy.log('Token:', token)
  cy.visitMfe('app-dashboard', { token })
})
```

**O que faz:**
1. Retorna um JWT mockado (variável de ambiente)
2. Salva no localStorage (`authToken` e `userInfo`)
3. Permite encadeamento para usar o token

## 📊 Relatórios Gerados

O runner script gera relatórios Markdown com:

### Frontmatter
```yaml
---
sidebar_position: 1
title: ✅ Relatório 2025-12-01T20-30-00
description: Relatório de testes automatizados
---
```

### Admonitions

- `:::tip` - Todos os testes passaram
- `:::warning` - Testes com avisos
- `:::danger` - Testes falharam
- `:::caution` - Bundle não encontrado

### Conteúdo

1. **Resumo dos Testes**
   - Total, Passou, Falhou, Pendente, Ignorado
   - Duração total

2. **Performance do Bundle**
   - Tamanho em KB/MB
   - Status vs limites configurados

3. **Detalhes dos Testes**
   - Lista de specs executados
   - Status de cada teste
   - Erros (se houver)

4. **Informações do Commit**
   - Hash, Autor, Data, Mensagem, Branch

## ⚙️ Configuração

### Limites de Bundle

Edite `cypress/scripts/runner.js`:

```javascript
const CONFIG = {
  bundleMaxSize: 1024 * 1024,      // 1MB (erro)
  bundleWarningSize: 500 * 1024,   // 500KB (aviso)
  // ...
}
```

### Variáveis de Ambiente Cypress

Edite `cypress.config.ts`:

```typescript
env: {
  mfeUrl: 'http://localhost:4201',
  mfeScriptPath: '/main.js',
  apiUrl: 'http://localhost:3001',
  mockToken: 'seu-token-jwt-mockado'
}
```

## 🔄 CI/CD (GitHub Actions)

O workflow `.github/workflows/qa-pipeline.yml` executa:

### Job 1: Build Web Components
- Checkout do código
- Instala dependências
- Build do Angular
- Upload de artefatos

### Job 2: Run Tests
- Download do build
- Inicia API server
- Executa `runner.js`
- Upload de resultados e relatórios

### Job 3: Deploy Docs
- Download dos relatórios gerados
- Build do Docusaurus
- Deploy no GitHub Pages

### Job 4: Summary
- Gera resumo no GitHub Actions

## 📝 Exemplo de Teste

```typescript
describe('MFE Test Suite', () => {
  beforeEach(() => {
    // Mock login
    cy.loginAzure({
      email: 'qa@example.com',
      role: 'tester'
    })
  })

  it('should load MFE successfully', () => {
    // Visita o MFE
    cy.visitMfe('hello-world')
    
    // Verifica se carregou
    cy.get('hello-world').should('exist')
    
    // Interage com o componente
    cy.get('hello-world')
      .shadow()
      .find('button')
      .click()
  })

  it('should validate bundle size', () => {
    const bundlePath = '../web-components/dist/browser/main.js'
    
    cy.task('getBundleSize', bundlePath).then((size) => {
      expect(size).to.be.lessThan(1024 * 1024) // < 1MB
    })
  })
})
```

## 🐛 Troubleshooting

### Bundle não encontrado
```bash
cd web-components
npm run build
```

### API não responde
```bash
cd api
npm run dev
```

### Git metadata vazio
```bash
git config user.name "Seu Nome"
git config user.email "seu@email.com"
git commit --allow-empty -m "Test commit"
```

### Relatórios não aparecem no Docusaurus
1. Verifique se `docs/docs/historico/` existe
2. Verifique se `_category_.json` está presente
3. Reinicie o Docusaurus

## 📚 Recursos

- [Cypress Module API](https://docs.cypress.io/guides/guides/module-api)
- [Docusaurus Frontmatter](https://docusaurus.io/docs/api/plugins/@docusaurus/plugin-content-docs#markdown-front-matter)
- [GitHub Actions](https://docs.github.com/en/actions)
