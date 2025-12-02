describe('Frontend - MFE Loading', () => {
  beforeEach(() => {
    // Mock Azure login before each test
    cy.loginAzure({
      email: 'qa@example.com',
      name: 'QA Tester',
      role: 'tester'
    })
  })

  describe('MFE Shell Integration', () => {
    it('should load MFE successfully', () => {
      cy.visitMfe('hello-world')
      
      // Verify the web component exists
      cy.get('hello-world').should('exist')
    })

    it('should load MFE with custom token', () => {
      const customToken = 'custom-test-token-123'
      
      cy.visitMfe('hello-world', { token: customToken })
      
      cy.get('hello-world').should('exist')
    })

    it('should load MFE with custom attributes', () => {
      cy.visitMfe('hello-world', {
        attributes: {
          theme: 'dark',
          lang: 'pt-BR'
        }
      })
      
      cy.get('hello-world')
        .should('have.attr', 'theme', 'dark')
        .and('have.attr', 'lang', 'pt-BR')
    })

    it('should wait for web component to be defined', () => {
      cy.visitMfe('hello-world')
      
      cy.window().then((win) => {
        expect(win.customElements.get('hello-world')).to.exist
      })
    })
  })

  describe('MFE Rendering', () => {
    beforeEach(() => {
      cy.visitMfe('hello-world')
    })

    it('should render MFE content', () => {
      cy.get('hello-world').should('be.visible')
    })

    it('should have shadow DOM', () => {
      cy.get('hello-world').shadow().should('exist')
    })

    it('should render heading inside shadow DOM', () => {
      cy.get('hello-world')
        .shadow()
        .find('h2')
        .should('be.visible')
        .and('contain.text', 'Hello')
    })

    it('should render button inside shadow DOM', () => {
      cy.get('hello-world')
        .shadow()
        .find('button')
        .should('be.visible')
    })
  })

  describe('MFE Interactions', () => {
    beforeEach(() => {
      cy.visitMfe('hello-world')
    })

    it('should handle button click', () => {
      cy.get('hello-world')
        .shadow()
        .find('button')
        .click()
      
      // Verify message changed
      cy.get('hello-world')
        .shadow()
        .find('h2')
        .should('contain.text', 'Message updated')
    })

    it('should display user name from attribute', () => {
      cy.visitMfe('hello-world', {
        attributes: { name: 'Cypress' }
      })
      
      cy.get('hello-world')
        .shadow()
        .find('p')
        .should('contain.text', 'Cypress')
    })
  })

  describe('MFE Styling', () => {
    beforeEach(() => {
      cy.visitMfe('hello-world')
    })

    it('should have styled container', () => {
      cy.get('hello-world')
        .shadow()
        .find('.hello-world-container')
        .should('have.css', 'padding')
        .and('not.eq', '0px')
    })

    it('should have gradient background', () => {
      cy.get('hello-world')
        .shadow()
        .find('.hello-world-container')
        .should('have.css', 'background')
        .and('include', 'gradient')
    })
  })

  describe('MFE Responsiveness', () => {
    it('should render correctly on mobile', () => {
      cy.viewport('iphone-x')
      cy.visitMfe('hello-world')
      
      cy.get('hello-world')
        .shadow()
        .find('.hello-world-container')
        .should('be.visible')
    })

    it('should render correctly on tablet', () => {
      cy.viewport('ipad-2')
      cy.visitMfe('hello-world')
      
      cy.get('hello-world')
        .shadow()
        .find('.hello-world-container')
        .should('be.visible')
    })

    it('should render correctly on desktop', () => {
      cy.viewport(1920, 1080)
      cy.visitMfe('hello-world')
      
      cy.get('hello-world')
        .shadow()
        .find('.hello-world-container')
        .should('be.visible')
    })
  })
})
