#!/usr/bin/env node

/**
 * Cypress Test Runner with Automated Documentation Generation
 * 
 * This script orchestrates the entire QA pipeline:
 * 1. Starts MFE server (for testing only - in production, MFE is on separate URL)
 * 2. Runs Cypress tests via Module API
 * 3. Captures Git metadata
 * 4. Validates bundle size
 * 5. Generates Markdown reports for Docusaurus
 */

const cypress = require('cypress');
const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  bundlePath: path.join(__dirname, '../../web-components/dist/browser/main.js'),
  bundleMaxSize: 1024 * 1024, // 1MB
  bundleWarningSize: 500 * 1024, // 500KB
  resultsPath: path.join(__dirname, '../results/results.json'),
  docsHistoricoPath: path.join(__dirname, '../../docs/docs/historico'),
};

/**
 * Capture Git metadata
 */
function getGitMetadata() {
  try {
    const author = execSync('git log -1 --pretty=format:"%an"', { encoding: 'utf-8' }).trim();
    const email = execSync('git log -1 --pretty=format:"%ae"', { encoding: 'utf-8' }).trim();
    const hash = execSync('git log -1 --pretty=format:"%H"', { encoding: 'utf-8' }).trim();
    const shortHash = execSync('git log -1 --pretty=format:"%h"', { encoding: 'utf-8' }).trim();
    const message = execSync('git log -1 --pretty=format:"%s"', { encoding: 'utf-8' }).trim();
    const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).trim();
    const timestamp = execSync('git log -1 --pretty=format:"%ci"', { encoding: 'utf-8' }).trim();

    return {
      author,
      email,
      hash,
      shortHash,
      message,
      branch,
      timestamp,
    };
  } catch (error) {
    console.warn('⚠️  Could not retrieve Git metadata:', error.message);
    return {
      author: 'Unknown',
      email: 'unknown@example.com',
      hash: 'N/A',
      shortHash: 'N/A',
      message: 'No commit message',
      branch: 'unknown',
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Validate bundle size
 */
function validateBundleSize() {
  try {
    if (!fs.existsSync(CONFIG.bundlePath)) {
      return {
        exists: false,
        size: 0,
        sizeKB: 0,
        sizeMB: 0,
        status: 'not_found',
        message: '⚠️ Bundle file not found. Run `npm run wc:build` first.',
      };
    }

    const stats = fs.statSync(CONFIG.bundlePath);
    const sizeBytes = stats.size;
    const sizeKB = (sizeBytes / 1024).toFixed(2);
    const sizeMB = (sizeBytes / (1024 * 1024)).toFixed(2);

    let status = 'success';
    let message = `✅ Bundle size: ${sizeKB} KB`;

    if (sizeBytes > CONFIG.bundleMaxSize) {
      status = 'error';
      message = `❌ Bundle exceeds maximum size! ${sizeKB} KB > ${(CONFIG.bundleMaxSize / 1024).toFixed(0)} KB`;
    } else if (sizeBytes > CONFIG.bundleWarningSize) {
      status = 'warning';
      message = `⚠️ Bundle size is large: ${sizeKB} KB (Warning threshold: ${(CONFIG.bundleWarningSize / 1024).toFixed(0)} KB)`;
    }

    return {
      exists: true,
      size: sizeBytes,
      sizeKB: parseFloat(sizeKB),
      sizeMB: parseFloat(sizeMB),
      status,
      message,
    };
  } catch (error) {
    return {
      exists: false,
      size: 0,
      sizeKB: 0,
      sizeMB: 0,
      status: 'error',
      message: `❌ Error reading bundle: ${error.message}`,
    };
  }
}

/**
 * Generate Markdown report for Docusaurus
 */
function generateMarkdownReport(cypressResults, gitMetadata, bundleInfo) {
  const timestamp = new Date().toISOString();
  const dateFormatted = new Date().toLocaleString('pt-BR', {
    dateStyle: 'full',
    timeStyle: 'short',
  });
  const fileTimestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);

  // Calculate test statistics
  const totalTests = cypressResults.totalTests || 0;
  const totalPassed = cypressResults.totalPassed || 0;
  const totalFailed = cypressResults.totalFailed || 0;
  const totalPending = cypressResults.totalPending || 0;
  const totalSkipped = cypressResults.totalSkipped || 0;
  const duration = cypressResults.totalDuration || 0;
  const durationFormatted = (duration / 1000).toFixed(2);

  // Determine overall status
  let overallStatus = 'success';
  let statusEmoji = '✅';
  let statusAdmonition = 'tip';

  if (totalFailed > 0) {
    overallStatus = 'failure';
    statusEmoji = '❌';
    statusAdmonition = 'danger';
  } else if (totalPending > 0 || totalSkipped > 0) {
    overallStatus = 'warning';
    statusEmoji = '⚠️';
    statusAdmonition = 'warning';
  }

  // Build Markdown content
  let markdown = `---
sidebar_position: 1
title: ${statusEmoji} Relatório ${fileTimestamp}
description: Relatório de testes automatizados - ${dateFormatted}
---

# ${statusEmoji} Relatório de Regressão

**Data:** ${dateFormatted}  
**Status:** ${overallStatus.toUpperCase()}  
**Commit:** \`${gitMetadata.shortHash}\` - ${gitMetadata.message}  
**Autor:** ${gitMetadata.author}  
**Branch:** \`${gitMetadata.branch}\`

---

## 📊 Resumo dos Testes

:::${statusAdmonition}[Status: ${overallStatus.toUpperCase()}]
`;

  if (overallStatus === 'success') {
    markdown += `Todos os testes passaram com sucesso! 🎉\n`;
  } else if (overallStatus === 'failure') {
    markdown += `Alguns testes falharam. Revise os detalhes abaixo.\n`;
  } else {
    markdown += `Testes concluídos com avisos.\n`;
  }

  markdown += `:::

| Métrica | Valor |
|---------|-------|
| **Total de Testes** | ${totalTests} |
| **✅ Passou** | ${totalPassed} |
| **❌ Falhou** | ${totalFailed} |
| **⏭️ Pendente** | ${totalPending} |
| **⏸️ Ignorado** | ${totalSkipped} |
| **⏱️ Duração** | ${durationFormatted}s |

---

## 📦 Performance do Bundle

`;

  if (bundleInfo.status === 'success') {
    markdown += `:::tip[Bundle OK]
${bundleInfo.message}
:::

`;
  } else if (bundleInfo.status === 'warning') {
    markdown += `:::warning[Bundle Grande]
${bundleInfo.message}
:::

`;
  } else if (bundleInfo.status === 'error') {
    markdown += `:::danger[Erro no Bundle]
${bundleInfo.message}
:::

`;
  } else {
    markdown += `:::caution[Bundle Não Encontrado]
${bundleInfo.message}
:::

`;
  }

  markdown += `| Métrica | Valor |
|---------|-------|
| **Tamanho** | ${bundleInfo.sizeKB} KB (${bundleInfo.sizeMB} MB) |
| **Limite Máximo** | ${(CONFIG.bundleMaxSize / 1024).toFixed(0)} KB |
| **Limite de Aviso** | ${(CONFIG.bundleWarningSize / 1024).toFixed(0)} KB |

---

## 🧪 Detalhes dos Testes

`;

  // Add test details if available
  if (cypressResults.runs && cypressResults.runs.length > 0) {
    cypressResults.runs.forEach((run) => {
      if (run.specs && run.specs.length > 0) {
        run.specs.forEach((spec) => {
          markdown += `### 📄 ${spec.name || 'Test Spec'}\n\n`;

          if (spec.tests && spec.tests.length > 0) {
            spec.tests.forEach((test) => {
              const testStatus = test.state === 'passed' ? '✅' : test.state === 'failed' ? '❌' : '⏭️';
              const testDuration = test.duration ? `(${(test.duration / 1000).toFixed(2)}s)` : '';

              markdown += `- ${testStatus} **${test.title.join(' > ')}** ${testDuration}\n`;

              if (test.state === 'failed' && test.displayError) {
                markdown += `  \`\`\`\n  ${test.displayError}\n  \`\`\`\n`;
              }
            });
          }

          markdown += `\n`;
        });
      }
    });
  }

  markdown += `---

## 🔍 Informações do Commit

\`\`\`
Hash: ${gitMetadata.hash}
Autor: ${gitMetadata.author} <${gitMetadata.email}>
Data: ${gitMetadata.timestamp}
Mensagem: ${gitMetadata.message}
Branch: ${gitMetadata.branch}
\`\`\`

---

*Relatório gerado automaticamente em ${timestamp}*
`;

  return {
    content: markdown,
    filename: `relatorio-${fileTimestamp}.md`,
  };
}

/**
 * Save Markdown report to docs/historico
 */
function saveReport(report) {
  // Create directory if it doesn't exist
  if (!fs.existsSync(CONFIG.docsHistoricoPath)) {
    fs.mkdirSync(CONFIG.docsHistoricoPath, { recursive: true });
    console.log(`📁 Created directory: ${CONFIG.docsHistoricoPath}`);
  }

  const filePath = path.join(CONFIG.docsHistoricoPath, report.filename);
  fs.writeFileSync(filePath, report.content, 'utf-8');
  console.log(`📝 Report saved: ${filePath}`);

  return filePath;
}

/**
 * Start MFE server for testing
 * NOTE: In production, MFE will be on a separate URL
 * This is only for local/CI testing environments
 */
function startMfeServer() {
  return new Promise((resolve, reject) => {
    console.log('🚀 Starting MFE server (for testing only)...');

    const mfePath = path.join(__dirname, '../../web-components');

    // Check if web-components directory exists
    if (!fs.existsSync(mfePath)) {
      console.warn('⚠️  Web components directory not found. Skipping MFE server.');
      resolve(null);
      return;
    }

    // Start the Angular dev server
    const mfeServer = spawn('npx', ['http-server', './dist/browser', '--port', '4200'], {
      cwd: mfePath,
      stdio: 'pipe',
      shell: true
    });

    let serverReady = false;

    // Listen for server ready message
    mfeServer.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(`   MFE: ${output.trim()}`);

      // Check if server is ready (http-server message)
      if (output.includes('Available on:')) {
        if (!serverReady) {
          serverReady = true;
          console.log('✅ MFE server is ready!\n');
          resolve(mfeServer);
        }
      }
    });

    mfeServer.stderr.on('data', (data) => {
      console.error(`   MFE Error: ${data.toString().trim()}`);
    });

    mfeServer.on('error', (error) => {
      console.error('❌ Failed to start MFE server:', error);
      reject(error);
    });

    // Timeout after 60 seconds
    setTimeout(() => {
      if (!serverReady) {
        console.warn('⚠️  MFE server did not start in time. Continuing anyway...');
        resolve(mfeServer);
      }
    }, 60000);
  });
}

/**
 * Stop MFE server
 */
function stopMfeServer(mfeServer) {
  if (mfeServer) {
    console.log('\n🛑 Stopping MFE server...');
    mfeServer.kill('SIGTERM');

    // Force kill after 5 seconds if not stopped
    setTimeout(() => {
      if (!mfeServer.killed) {
        mfeServer.kill('SIGKILL');
      }
    }, 5000);
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Starting Cypress Test Runner...\n');

  let mfeServer = null;

  try {
    // Step 1: Capture Git metadata
    console.log('📋 Capturing Git metadata...');
    const gitMetadata = getGitMetadata();
    console.log(`   Author: ${gitMetadata.author}`);
    console.log(`   Commit: ${gitMetadata.shortHash} - ${gitMetadata.message}`);
    console.log(`   Branch: ${gitMetadata.branch}\n`);

    // Step 2: Validate bundle size
    console.log('📦 Validating bundle size...');
    const bundleInfo = validateBundleSize();
    console.log(`   ${bundleInfo.message}\n`);

    // Step 3: Start MFE server (for testing only)
    // NOTE: In production, MFE will be on a separate URL
    mfeServer = await startMfeServer();

    // Step 4: Run Cypress tests
    console.log('🧪 Running Cypress tests...\n');

    const results = await cypress.run({
      browser: 'chrome',
      headless: true,
      config: {
        video: true,
        screenshotOnRunFailure: true,
      },
    });

    console.log('\n✅ Cypress tests completed!\n');

    // Step 5: Generate Markdown report
    console.log('📄 Generating Markdown report...');
    const report = generateMarkdownReport(results, gitMetadata, bundleInfo);

    // Step 6: Save report
    const reportPath = saveReport(report);

    console.log('\n✨ Pipeline completed successfully!');
    console.log(`📊 Report: ${reportPath}\n`);

    // Cleanup
    stopMfeServer(mfeServer);

    // Exit with appropriate code
    if (results.totalFailed > 0) {
      console.error('❌ Some tests failed. Check the report for details.');
      process.exit(1);
    } else {
      console.log('🎉 All tests passed!');
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ Error running Cypress:', error);

    // Cleanup
    stopMfeServer(mfeServer);

    // Generate error report
    const gitMetadata = getGitMetadata();
    const bundleInfo = validateBundleSize();

    const errorResults = {
      totalTests: 0,
      totalPassed: 0,
      totalFailed: 1,
      totalPending: 0,
      totalSkipped: 0,
      totalDuration: 0,
      runs: [],
    };

    const report = generateMarkdownReport(errorResults, gitMetadata, bundleInfo);
    saveReport(report);

    process.exit(1);
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n\n🛑 Received SIGINT. Cleaning up...');
  process.exit(130);
});

process.on('SIGTERM', () => {
  console.log('\n\n🛑 Received SIGTERM. Cleaning up...');
  process.exit(143);
});

// Run the script
main();
