describe('API - Users Endpoints', () => {
  const apiUrl = Cypress.env('apiUrl') || 'http://localhost:3001'

  beforeEach(() => {
    // Ensure API is running
    cy.request(`${apiUrl}/`).its('status').should('eq', 200)
  })

  describe('GET /api/users', () => {
    it('should return all users', () => {
      cy.request(`${apiUrl}/api/users`).then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body).to.be.an('array')
        expect(response.body.length).to.be.greaterThan(0)
      })
    })

    it('should return users with correct structure', () => {
      cy.request(`${apiUrl}/api/users`).then((response) => {
        const user = response.body[0]
        expect(user).to.have.property('id')
        expect(user).to.have.property('name')
        expect(user).to.have.property('email')
        expect(user).to.have.property('role')
      })
    })

    it('should return users with valid data types', () => {
      cy.request(`${apiUrl}/api/users`).then((response) => {
        const user = response.body[0]
        expect(user.id).to.be.a('number')
        expect(user.name).to.be.a('string')
        expect(user.email).to.be.a('string')
        expect(user.role).to.be.a('string')
      })
    })
  })

  describe('GET /api/users/:id', () => {
    it('should return a specific user by ID', () => {
      cy.request(`${apiUrl}/api/users/1`).then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body).to.have.property('id', 1)
        expect(response.body).to.have.property('name')
      })
    })

    it('should return 404 for non-existent user', () => {
      cy.request({
        url: `${apiUrl}/api/users/999`,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(404)
        expect(response.body).to.have.property('error')
      })
    })

    it('should validate email format', () => {
      cy.request(`${apiUrl}/api/users/1`).then((response) => {
        expect(response.body.email).to.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
      })
    })
  })

  describe('POST /api/users', () => {
    it('should create a new user', () => {
      const newUser = {
        name: 'Test User',
        email: 'test@example.com',
        role: 'user'
      }

      cy.request('POST', `${apiUrl}/api/users`, newUser).then((response) => {
        expect(response.status).to.eq(201)
        expect(response.body).to.have.property('id')
        expect(response.body.name).to.eq(newUser.name)
        expect(response.body.email).to.eq(newUser.email)
        expect(response.body.role).to.eq(newUser.role)
      })
    })

    it('should create user with default role if not provided', () => {
      const newUser = {
        name: 'Test User 2',
        email: 'test2@example.com'
      }

      cy.request('POST', `${apiUrl}/api/users`, newUser).then((response) => {
        expect(response.status).to.eq(201)
        expect(response.body.role).to.eq('user')
      })
    })
  })

  describe('API Performance', () => {
    it('should respond within acceptable time', () => {
      const startTime = Date.now()
      
      cy.request(`${apiUrl}/api/users`).then(() => {
        const duration = Date.now() - startTime
        expect(duration).to.be.lessThan(1000) // Less than 1 second
      })
    })
  })
})
