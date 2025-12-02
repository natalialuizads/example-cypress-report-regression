import { defineConfig } from 'cypress'
import * as fs from 'fs'
import * as path from 'path'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:4200',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    videosFolder: 'cypress/videos',
    screenshotOnRunFailure: true,
    screenshotsFolder: 'cypress/screenshots',
    
    // Reporter configuration for JSON output
    reporter: 'cypress-multi-reporters',
    reporterOptions: {
      reporterEnabled: 'spec, json',
      jsonReporterOptions: {
        toConsole: false,
        output: 'cypress/results/results.json'
      }
    },
    
    // MFE-specific configuration
    env: {
      mfeUrl: 'http://localhost:4201',
      mfeScriptPath: '/main.js',
      apiUrl: 'http://localhost:3001',
      mockToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6Ik1vY2sgVXNlciIsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTUxNjIzOTAyMiwiZXhwIjoxOTE2MjM5MDIyfQ.mock-signature-for-testing'
    },
    
    setupNodeEvents(on, config) {
      // Create results directory if it doesn't exist
      const resultsDir = path.join(__dirname, 'cypress', 'results')
      if (!fs.existsSync(resultsDir)) {
        fs.mkdirSync(resultsDir, { recursive: true })
      }
      
      // Task to get bundle size
      on('task', {
        getBundleSize(filePath: string) {
          try {
            const stats = fs.statSync(filePath)
            return stats.size
          } catch (error) {
            console.error(`Error getting bundle size: ${error}`)
            return null
          }
        },
        
        log(message: string) {
          console.log(message)
          return null
        }
      })
      
      return config
    },
  },
})
