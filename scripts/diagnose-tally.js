// Script to diagnose Tally connection issues
// Save this as diagnose-tally.js and run it with Node.js

const fetch = require('node-fetch');
const { AbortController } = require('abort-controller');
const http = require('http');
const https = require('https');

// Configure timeouts
const httpAgent = new http.Agent({
  keepAlive: true,
  timeout: 10000, // 10 seconds
});

const httpsAgent = new https.Agent({
  keepAlive: true,
  timeout: 10000, // 10 seconds
});

// Perform diagnostics
async function diagnoseTallyConnection() {
  console.log('🔍 Starting Tally Connection Diagnostics');
  console.log('======================================');
  
  // Step 1: Basic connectivity check
  console.log('\n📡 Testing basic connectivity to Tally...');
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    console.log('  Attempting connection to http://localhost:9000...');
    const basicResponse = await fetch('http://localhost:9000', { 
      method: 'HEAD',
      signal: controller.signal,
      agent: httpAgent,
    });
    
    clearTimeout(timeoutId);
    console.log(`  ✅ Connection successful! Status: ${basicResponse.status}`);
  } catch (error) {
    console.log(`  ❌ Basic connection failed: ${error.message}`);
    console.log('  This indicates Tally is either not running or not serving on port 9000.');
  }
  
  // Step 2: XML request test
  console.log('\n📤 Testing Tally XML API...');
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const simpleXml = '<ENVELOPE><HEADER><VERSION>1</VERSION><TALLYREQUEST>Export</TALLYREQUEST><TYPE>Data</TYPE></HEADER><BODY/></ENVELOPE>';
    
    console.log('  Sending simple XML request...');
    const xmlResponse = await fetch('http://localhost:9000', {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml'
      },
      body: simpleXml,
      signal: controller.signal,
      agent: httpAgent,
    });
    
    clearTimeout(timeoutId);
    
    if (xmlResponse.ok) {
      const text = await xmlResponse.text();
      console.log(`  ✅ XML request successful! Response status: ${xmlResponse.status}`);
      console.log(`  Response starts with: ${text.substring(0, 100)}...`);
    } else {
      console.log(`  ⚠️ XML request returned non-OK status: ${xmlResponse.status} ${xmlResponse.statusText}`);
    }
  } catch (error) {
    console.log(`  ❌ XML request failed: ${error.message}`);
    console.log('  This suggests Tally is not correctly processing XML requests.');
  }
  
  // Step 3: Check if extension settings are correct
  console.log('\n🔧 Checking extension settings...');
  console.log('  The extension should be:');
  console.log('  1. Installed in your browser');
  console.log('  2. Configured with endpoint: http://localhost:9000');
  console.log('  3. Enabled (toggle switch turned on)');
  
  // Step 4: Recommendations
  console.log('\n🛠️ Recommendations:');
  console.log('  1. Ensure Tally is running and configured to accept XML/HTTP requests');
  console.log('     - In Tally, go to F12 > Advanced Configuration');
  console.log('     - Set "Allow XML/HTTP Interaction" to "Yes"');
  console.log('  2. Check if any firewall is blocking port 9000');
  console.log('  3. Try reinstalling the browser extension');
  console.log('  4. Restart both Tally and your browser');
  console.log('  5. Test the connection using the extension\'s test page');
  
  console.log('\n✨ Diagnostics complete!');
}

// Run the diagnostics
diagnoseTallyConnection().catch(err => {
  console.error('Error during diagnostics:', err);
});
