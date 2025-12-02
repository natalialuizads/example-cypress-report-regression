// ***********************************************
// Custom commands for MFE testing and Azure login
// ***********************************************

/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to visit the home page
       * @example cy.visitHomePage()
       */
      visitHomePage(): Chainable<void>
      
      /**
       * Custom command to check if element is visible
       * @example cy.get('button').shouldBeVisible()
       */
      shouldBeVisible(): Chainable<JQuery<HTMLElement>>
      
      /**
       * Custom command to visit a Microfrontend (MFE) with mock shell
       * Intercepts the page and injects the MFE script dynamically
       * @param mfeTag - The web component tag name (e.g., 'hello-world')
       * @param options - Optional configuration
       * @example cy.visitMfe('hello-world', { token: 'custom-token' })
       */
      visitMfe(mfeTag: string, options?: { token?: string; attributes?: Record<string, string> }): Chainable<void>
      
      /**
       * Mock Azure AD login - returns a static JWT token for development
       * @param userInfo - Optional user information to include in the mock
       * @example cy.loginAzure({ email: 'test@example.com' })
       */
      loginAzure(userInfo?: { email?: string; name?: string; role?: string }): Chainable<string>
    }
  }
}

// Example custom command
Cypress.Commands.add('visitHomePage', () => {
  cy.visit('/')
})

// Example command to check if element is visible
Cypress.Commands.add('shouldBeVisible', { prevSubject: 'element' }, (subject) => {
  cy.wrap(subject).should('be.visible')
})

/**
 * visitMfe - Loads a Microfrontend in a mock shell
 * Uses cy.intercept to inject HTML that loads the MFE script and renders the web component
 */
Cypress.Commands.add('visitMfe', (mfeTag: string, options = {}) => {
  const token = options.token || Cypress.env('mockToken')
  const mfeUrl = Cypress.env('mfeUrl') || 'http://localhost:4201'
  const mfeScriptPath = Cypress.env('mfeScriptPath') || '/main.js'
  
  // Build attributes string for the web component
  let attributesStr = `token="${token}"`
  if (options.attributes) {
    Object.entries(options.attributes).forEach(([key, value]) => {
      attributesStr += ` ${key}="${value}"`
    })
  }
  
  // Create the mock shell HTML
  const mockShellHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>MFE Test Shell</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        }
        #mfe-container {
          width: 100%;
          min-height: 100vh;
        }
      </style>
    </head>
    <body>
      <div id="mfe-container">
        <${mfeTag} ${attributesStr}></${mfeTag}>
      </div>
      <script src="${mfeUrl}${mfeScriptPath}"></script>
    </body>
    </html>
  `
  
  // Intercept the base URL and inject our mock shell
  cy.intercept('GET', '/', {
    statusCode: 200,
    headers: {
      'content-type': 'text/html'
    },
    body: mockShellHtml
  }).as('mfeShell')
  
  // Visit the page (will be intercepted)
  cy.visit('/')
  cy.wait('@mfeShell')
  
  // Wait for the web component to be defined
  cy.window().then((win) => {
    return new Cypress.Promise((resolve) => {
      if (win.customElements.get(mfeTag)) {
        resolve()
      } else {
        win.customElements.whenDefined(mfeTag).then(resolve)
      }
    })
  })
  
  cy.log(`✅ MFE loaded: <${mfeTag}>`)
})

/**
 * loginAzure - Mock Azure AD login
 * Returns a static JWT token for development/testing purposes
 */
Cypress.Commands.add('loginAzure', (userInfo = {}) => {
  const defaultUser = {
    email: 'test@example.com',
    name: 'Mock User',
    role: 'admin'
  }
  
  const user = { ...defaultUser, ...userInfo }
  
  // Create a mock JWT payload (not a real JWT, just for testing)
  const mockPayload = {
    sub: '1234567890',
    name: user.name,
    email: user.email,
    role: user.role,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // 24 hours
  }
  
  // Get the mock token from environment or use default
  const mockToken = Cypress.env('mockToken')
  
  // Store token in localStorage (common pattern for SPAs)
  cy.window().then((win) => {
    win.localStorage.setItem('authToken', mockToken)
    win.localStorage.setItem('userInfo', JSON.stringify(user))
  })
  
  cy.log('🔐 Azure login mocked', user)
  
  // Return the token for chaining
  return cy.wrap(mockToken)
})

export { };

