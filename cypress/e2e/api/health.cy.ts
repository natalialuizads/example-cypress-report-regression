describe('API - Health & Error Handling', () => {
  const apiUrl = Cypress.env('apiUrl') || 'http://localhost:3001'

  describe('Health Check', () => {
    it('should return API information on root endpoint', () => {
      cy.request(`${apiUrl}/`).then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body).to.have.property('message')
        expect(response.body).to.have.property('version')
        expect(response.body).to.have.property('endpoints')
      })
    })

    it('should have correct API version', () => {
      cy.request(`${apiUrl}/`).then((response) => {
        expect(response.body.version).to.match(/^\d+\.\d+\.\d+$/)
      })
    })

    it('should list available endpoints', () => {
      cy.request(`${apiUrl}/`).then((response) => {
        expect(response.body.endpoints).to.have.property('users')
        expect(response.body.endpoints).to.have.property('products')
      })
    })
  })

  describe('Error Handling', () => {
    it('should return 404 for non-existent endpoint', () => {
      cy.request({
        url: `${apiUrl}/api/nonexistent`,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(404)
        expect(response.body).to.have.property('error')
      })
    })

    it('should handle malformed requests gracefully', () => {
      cy.request({
        method: 'POST',
        url: `${apiUrl}/api/users`,
        body: 'invalid-json',
        headers: {
          'Content-Type': 'application/json'
        },
        failOnStatusCode: false
      }).then((response) => {
        // Should handle error gracefully (400 or 500)
        expect([400, 500]).to.include(response.status)
      })
    })
  })

  describe('CORS Headers', () => {
    it('should include CORS headers', () => {
      cy.request(`${apiUrl}/api/users`).then((response) => {
        expect(response.headers).to.have.property('access-control-allow-origin')
      })
    })
  })

  describe('Response Headers', () => {
    it('should return JSON content type', () => {
      cy.request(`${apiUrl}/api/users`).then((response) => {
        expect(response.headers['content-type']).to.include('application/json')
      })
    })
  })

  describe('API Availability', () => {
    it('should be accessible and responsive', () => {
      const startTime = Date.now()
      
      cy.request(`${apiUrl}/`).then((response) => {
        const duration = Date.now() - startTime
        
        expect(response.status).to.eq(200)
        expect(duration).to.be.lessThan(500) // Should respond quickly
      })
    })

    it('should handle multiple concurrent requests', () => {
      const requests = [
        cy.request(`${apiUrl}/api/users`),
        cy.request(`${apiUrl}/api/products`),
        cy.request(`${apiUrl}/api/users/1`),
        cy.request(`${apiUrl}/api/products/1`),
      ];

      requests.forEach((req) => {
        req.then((response) => {
          expect(response.status).to.eq(200);
        });
      });
    });
  })
})
