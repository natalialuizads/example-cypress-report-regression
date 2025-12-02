describe('API - Products Endpoints', () => {
  const apiUrl = Cypress.env('apiUrl') || 'http://localhost:3001'

  beforeEach(() => {
    // Ensure API is running
    cy.request(`${apiUrl}/`).its('status').should('eq', 200)
  })

  describe('GET /api/products', () => {
    it('should return all products', () => {
      cy.request(`${apiUrl}/api/products`).then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body).to.be.an('array')
        expect(response.body.length).to.be.greaterThan(0)
      })
    })

    it('should return products with correct structure', () => {
      cy.request(`${apiUrl}/api/products`).then((response) => {
        const product = response.body[0]
        expect(product).to.have.property('id')
        expect(product).to.have.property('name')
        expect(product).to.have.property('price')
        expect(product).to.have.property('category')
        expect(product).to.have.property('inStock')
      })
    })

    it('should return products with valid data types', () => {
      cy.request(`${apiUrl}/api/products`).then((response) => {
        const product = response.body[0]
        expect(product.id).to.be.a('number')
        expect(product.name).to.be.a('string')
        expect(product.price).to.be.a('number')
        expect(product.category).to.be.a('string')
        expect(product.inStock).to.be.a('boolean')
      })
    })

    it('should have positive prices', () => {
      cy.request(`${apiUrl}/api/products`).then((response) => {
        response.body.forEach((product: any) => {
          expect(product.price).to.be.greaterThan(0)
        })
      })
    })
  })

  describe('GET /api/products/:id', () => {
    it('should return a specific product by ID', () => {
      cy.request(`${apiUrl}/api/products/1`).then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body).to.have.property('id', 1)
        expect(response.body).to.have.property('name')
      })
    })

    it('should return 404 for non-existent product', () => {
      cy.request({
        url: `${apiUrl}/api/products/999`,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(404)
        expect(response.body).to.have.property('error')
      })
    })
  })

  describe('Query Parameters - Filter by Category', () => {
    it('should filter products by category', () => {
      cy.request(`${apiUrl}/api/products?category=Electronics`).then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body).to.be.an('array')
        
        response.body.forEach((product: any) => {
          expect(product.category).to.eq('Electronics')
        })
      })
    })

    it('should return empty array for non-existent category', () => {
      cy.request(`${apiUrl}/api/products?category=NonExistent`).then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body).to.be.an('array').that.is.empty
      })
    })
  })

  describe('Query Parameters - Filter by Stock', () => {
    it('should filter products in stock', () => {
      cy.request(`${apiUrl}/api/products?inStock=true`).then((response) => {
        expect(response.status).to.eq(200)
        
        response.body.forEach((product: any) => {
          expect(product.inStock).to.be.true
        })
      })
    })

    it('should filter products out of stock', () => {
      cy.request(`${apiUrl}/api/products?inStock=false`).then((response) => {
        expect(response.status).to.eq(200)
        
        response.body.forEach((product: any) => {
          expect(product.inStock).to.be.false
        })
      })
    })
  })

  describe('Combined Filters', () => {
    it('should filter by category and stock status', () => {
      cy.request(`${apiUrl}/api/products?category=Accessories&inStock=true`).then((response) => {
        expect(response.status).to.eq(200)
        
        response.body.forEach((product: any) => {
          expect(product.category).to.eq('Accessories')
          expect(product.inStock).to.be.true
        })
      })
    })
  })

  describe('Data Validation', () => {
    it('should have valid product categories', () => {
      const validCategories = ['Electronics', 'Accessories']
      
      cy.request(`${apiUrl}/api/products`).then((response) => {
        response.body.forEach((product: any) => {
          expect(validCategories).to.include(product.category)
        })
      })
    })

    it('should have reasonable price ranges', () => {
      cy.request(`${apiUrl}/api/products`).then((response) => {
        response.body.forEach((product: any) => {
          expect(product.price).to.be.greaterThan(0)
          expect(product.price).to.be.lessThan(10000) // Max reasonable price
        })
      })
    })
  })
})
