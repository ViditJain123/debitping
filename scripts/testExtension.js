/**
 * Node.js script to test the Tally CORS Bridge extension
 * 
 * This script creates a simple HTTP server that hosts an HTML page
 * which tests the extension functionality.
 * 
 * Usage: node testExtension.js [port]
 * Default port: 3333
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const open = require('open'); // You may need to install this: npm install open

// Default port
const port = process.argv[2] || 3333;

// Test HTML content
const testHtml = `
<!DOCTYPE html>
<html>
<head>
  <title>Tally CORS Bridge Extension Test</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 800px;
      margin: 40px auto;
      padding: 20px;
      line-height: 1.6;
      color: #333;
    }
    h1 { color: #2c3e50; }
    .card {
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
      background-color: #f8f9fa;
    }
    .success { color: #28a745; }
    .error { color: #dc3545; }
    .warning { color: #ffc107; }
    button {
      background-color: #007bff;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      margin-right: 8px;
    }
    button:hover { background-color: #0069d9; }
    code, pre {
      font-family: monospace;
      background-color: #f1f1f1;
      padding: 2px 5px;
      border-radius: 3px;
      font-size: 0.9em;
    }
    pre {
      padding: 10px;
      overflow-x: auto;
      white-space: pre-wrap;
    }
    .timestamp {
      font-size: 0.8em;
      color: #6c757d;
    }
  </style>
</head>
<body>
  <h1>Tally CORS Bridge Extension Test</h1>
  <p class="timestamp">Started: <span id="timestamp"></span></p>
  
  <div class="card">
    <h2>1. Extension Detection</h2>
    <p>Checking if the Tally CORS Bridge extension is installed and active...</p>
    <div id="detectionResult"></div>
    <button onclick="checkExtension()">Recheck</button>
  </div>
  
  <div class="card">
    <h2>2. Test API Availability</h2>
    <p>Checking if the TallyAPI class is available...</p>
    <div id="apiResult"></div>
    <button onclick="checkAPI()">Recheck</button>
  </div>
  
  <div class="card">
    <h2>3. Tally Connection Test</h2>
    <p>This will attempt to connect to Tally and retrieve a list of companies.</p>
    <div id="connectionResult"></div>
    <button onclick="testConnection()">Test Connection</button>
  </div>
  
  <div class="card">
    <h2>4. Diagnostic Information</h2>
    <pre id="diagnosticInfo">Click "Show Diagnostics" to load...</pre>
    <button onclick="showDiagnostics()">Show Diagnostics</button>
  </div>
  
  <script>
    // Initialize timestamp
    document.getElementById('timestamp').textContent = new Date().toLocaleString();
    
    // Extension detection
    function checkExtension() {
      const detectionResult = document.getElementById('detectionResult');
      detectionResult.innerHTML = '<p>Checking extension status...</p>';
      
      // Check if global detection flag is set
      if (window.__tallyExtensionDetected) {
        detectionResult.innerHTML = '<p class="success">✓ Extension detected via global flag</p>';
        return;
      }
      
      // Check if detection function exists
      if (typeof window.detectTallyExtension === 'function') {
        window.detectTallyExtension((detected, data) => {
          if (detected) {
            detectionResult.innerHTML = \`
              <p class="success">✓ Extension detected via detection function</p>
              <pre>\${JSON.stringify(data, null, 2)}</pre>
            \`;
          } else {
            detectionResult.innerHTML = \`
              <p class="error">✗ Extension not detected</p>
              <pre>\${JSON.stringify(data, null, 2)}</pre>
              <p>Please check if the extension is installed and enabled in Chrome.</p>
            \`;
          }
        }, 2000);
      } else {
        detectionResult.innerHTML = \`
          <p class="error">✗ Extension not detected</p>
          <p>The detection function 'detectTallyExtension' is not available.</p>
          <p>Please check if the extension is installed and enabled in Chrome.</p>
        \`;
      }
    }
    
    // Check TallyAPI availability
    function checkAPI() {
      const apiResult = document.getElementById('apiResult');
      
      if (typeof window.TallyAPI === 'function') {
        apiResult.innerHTML = '<p class="success">✓ TallyAPI class is available</p>';
        
        // Show available methods
        const api = new window.TallyAPI();
        const methods = Object.getOwnPropertyNames(window.TallyAPI.prototype)
          .filter(item => typeof api[item] === 'function' && item !== 'constructor');
        
        apiResult.innerHTML += \`
          <p>Available methods:</p>
          <pre>\${methods.join('\\n')}</pre>
        \`;
      } else {
        apiResult.innerHTML = \`
          <p class="error">✗ TallyAPI class is not available</p>
          <p>Please check if the extension is installed and enabled in Chrome.</p>
        \`;
      }
    }
    
    // Test connection to Tally
    function testConnection() {
      const connectionResult = document.getElementById('connectionResult');
      connectionResult.innerHTML = '<p>Testing connection to Tally...</p>';
      
      if (typeof window.TallyAPI !== 'function') {
        connectionResult.innerHTML = \`
          <p class="error">✗ TallyAPI class is not available</p>
          <p>Please check if the extension is installed and enabled in Chrome.</p>
        \`;
        return;
      }
      
      try {
        const api = new window.TallyAPI();
        const companyListXml = api.getCompanyListRequest();
        
        api.sendRequest(companyListXml)
          .then(response => {
            connectionResult.innerHTML = \`
              <p class="success">✓ Successfully connected to Tally!</p>
              <p>Response received from Tally server.</p>
            \`;
            
            // Try to extract company names
            try {
              const companies = response.querySelectorAll('COMPANY NAME');
              if (companies.length > 0) {
                connectionResult.innerHTML += '<p>Companies found:</p><ul>';
                companies.forEach(company => {
                  connectionResult.innerHTML += \`<li>\${company.textContent}</li>\`;
                });
                connectionResult.innerHTML += '</ul>';
              } else {
                connectionResult.innerHTML += '<p class="warning">No companies found in the response.</p>';
              }
            } catch (e) {
              connectionResult.innerHTML += \`<p class="warning">Could not parse company names: \${e.message}</p>\`;
            }
          })
          .catch(error => {
            connectionResult.innerHTML = \`
              <p class="error">✗ Connection to Tally failed</p>
              <pre>\${JSON.stringify(error, null, 2)}</pre>
              <p>Please check if Tally is running and accessible.</p>
            \`;
          });
      } catch (error) {
        connectionResult.innerHTML = \`
          <p class="error">✗ Error initializing TallyAPI</p>
          <p>\${error.message}</p>
        \`;
      }
    }
    
    // Show diagnostic information
    function showDiagnostics() {
      const diagnosticInfo = document.getElementById('diagnosticInfo');
      diagnosticInfo.textContent = 'Loading diagnostic information...';
      
      // Gather diagnostic information
      const diagnostics = {
        browserInfo: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          vendor: navigator.vendor
        },
        extensionStatus: {
          globalFlag: window.__tallyExtensionDetected || false,
          detectFunctionExists: typeof window.detectTallyExtension === 'function',
          apiExists: typeof window.TallyAPI === 'function'
        },
        timestamp: new Date().toISOString()
      };
      
      // Show the information we already have
      diagnosticInfo.textContent = JSON.stringify(diagnostics, null, 2);
      
      // If we have the detection function, use it to get more info
      if (diagnostics.extensionStatus.detectFunctionExists) {
        window.detectTallyExtension((detected, data) => {
          diagnostics.extensionStatus.detected = detected;
          diagnostics.extensionStatus.detectionData = data;
          diagnosticInfo.textContent = JSON.stringify(diagnostics, null, 2);
        });
      }
    }
    
    // Run initial checks
    window.addEventListener('DOMContentLoaded', () => {
      // Wait a moment to allow extension to initialize
      setTimeout(() => {
        checkExtension();
        checkAPI();
      }, 500);
      
      // Listen for extension ready event
      window.addEventListener('tallyExtensionReady', function(event) {
        const detectionResult = document.getElementById('detectionResult');
        detectionResult.innerHTML = \`
          <p class="success">✓ Extension detected via ready event</p>
          <pre>\${JSON.stringify(event.detail, null, 2)}</pre>
        \`;
        
        // Re-run API check
        checkAPI();
      });
    });
  </script>
</body>
</html>
`;

// Create HTTP server
const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html');
  res.end(testHtml);
});

// Start the server
server.listen(port, () => {
  const url = `http://localhost:${port}`;
  console.log(`Test server running at ${url}`);
  console.log('Opening browser...');
  open(url);
});

console.log('Press Ctrl+C to close the server');
