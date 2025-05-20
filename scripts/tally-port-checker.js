// Tally Port Checker - Run with: node tally-port-checker.js
const http = require('http');
const net = require('net');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const execPromise = promisify(require('child_process').exec);

const TALLY_PORT = 9000;
const TALLY_HOST = 'localhost';
const TIMEOUT_MS = 15000;

console.log('╔═══════════════════════════════════════════════╗');
console.log('║ Tally Connection Diagnostics Tool              ║');
console.log('╚═══════════════════════════════════════════════╝');
console.log('');

async function checkPort(host, port) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let status = false;
    let error = null;
    
    // Set timeout
    socket.setTimeout(TIMEOUT_MS);
    
    socket.on('connect', () => {
      status = true;
      socket.end();
    });
    
    socket.on('timeout', () => {
      error = 'Connection timed out';
      socket.destroy();
    });
    
    socket.on('error', (e) => {
      error = e.message;
    });
    
    socket.on('close', () => {
      resolve({ status, error });
    });
    
    socket.connect(port, host);
  });
}

async function sendSimpleRequest() {
  return new Promise((resolve) => {
    const simpleXml = '<?xml version="1.0" encoding="utf-8"?><ENVELOPE><HEADER>   <VERSION>1</VERSION> <TALLYREQUEST>Export</TALLYREQUEST> <TYPE>Data</TYPE> <ID>List of Companies</ID> </HEADER> <BODY/></ENVELOPE>';
    
    const options = {
      hostname: TALLY_HOST,
      port: TALLY_PORT,
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml',
        'Content-Length': Buffer.byteLength(simpleXml)
      },
      timeout: TIMEOUT_MS
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          status: true,
          statusCode: res.statusCode,
          headers: res.headers,
          data: data.substring(0, 500) // First 500 chars
        });
      });
    });
    
    req.on('error', (e) => {
      resolve({
        status: false,
        error: e.message
      });
    });
    
    req.on('timeout', () => {
      req.destroy();
      resolve({
        status: false,
        error: 'Request timed out'
      });
    });
    
    req.write(simpleXml);
    req.end();
  });
}

async function checkTallyProcesses() {
  try {
    // For Windows
    if (process.platform === 'win32') {
      const { stdout } = await execPromise('tasklist /FI "IMAGENAME eq tally*" /FO CSV');
      
      if (stdout.includes('INFO:')) {
        return { running: false, processes: [] };
      }
      
      // Parse the CSV output
      const lines = stdout.trim().split('\n');
      if (lines.length <= 1) {
        return { running: false, processes: [] };
      }
      
      const processes = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].replace(/"/g, '').split(',');
        if (cols.length >= 2) {
          processes.push({
            name: cols[0],
            pid: parseInt(cols[1])
          });
        }
      }
      
      return { running: processes.length > 0, processes };
    }
    
    return { running: false, error: 'Platform not supported for Tally process check' };
  } catch (error) {
    return { running: false, error: error.message };
  }
}

async function runDiagnostics() {
  // Check if Tally is running
  console.log('📊 Checking Tally processes...');
  const processResult = await checkTallyProcesses();
  
  if (processResult.running) {
    console.log('✅ Tally is running!');
    processResult.processes.forEach(process => {
      console.log(`   Process: ${process.name}, PID: ${process.pid}`);
    });
  } else {
    console.log('❌ Tally does not appear to be running!');
    if (processResult.error) {
      console.log(`   Error: ${processResult.error}`);
    }
    console.log('   Please start Tally before continuing.');
  }
  
  console.log('');
  
  // Check if port is open
  console.log(`📡 Checking if port ${TALLY_PORT} is open on ${TALLY_HOST}...`);
  const portResult = await checkPort(TALLY_HOST, TALLY_PORT);
  
  if (portResult.status) {
    console.log(`✅ Port ${TALLY_PORT} is open and accepting connections!`);
  } else {
    console.log(`❌ Port ${TALLY_PORT} is not accessible!`);
    console.log(`   Error: ${portResult.error}`);
    console.log('   Possible reasons:');
    console.log('   1. Tally is not running');
    console.log('   2. Tally is not configured to use port 9000');
    console.log('   3. Tally\'s XML/HTTP interface is disabled');
    console.log('   4. A firewall is blocking access to the port');
  }
  
  console.log('');
  
  // Try to send a simple request
  console.log('📤 Testing XML request to Tally...');
  const requestResult = await sendSimpleRequest();
  
  if (requestResult.status) {
    console.log('✅ Successfully received a response from Tally!');
    console.log(`   Status code: ${requestResult.statusCode}`);
    console.log(`   Response preview: ${requestResult.data.substring(0, 100)}...`);
  } else {
    console.log('❌ Failed to get a response from Tally!');
    console.log(`   Error: ${requestResult.error}`);
  }
  
  console.log('');
  console.log('📋 Summary and recommendations:');
  
  if (!processResult.running) {
    console.log('❗ Start Tally ERP and make sure it\'s running');
  }
  
  if (!portResult.status) {
    console.log('❗ Configure Tally to accept XML/HTTP requests:');
    console.log('  - In Tally, press F12 > Advanced Configuration');
    console.log('  - Set "Allow XML HTTP Interface" to "Yes"');
    console.log('  - Check that port 9000 is configured correctly');
  }
  
  if (processResult.running && portResult.status && !requestResult.status) {
    console.log('❗ Tally is running but not processing XML requests properly.');
    console.log('  - Check Tally.ERP9 configuration');
    console.log('  - Restart Tally and try again');
  }
  
  if (portResult.status && requestResult.status) {
    console.log('✅ Tally server is working correctly!');
    console.log('  If your browser extension still can\'t connect:');
    console.log('  1. Reinstall the Tally CORS Bridge extension');
    console.log('  2. Check that the extension is configured for http://localhost:9000');
    console.log('  3. Try restarting your browser');
  }
}

// Run the diagnostics
runDiagnostics().catch(error => {
  console.error('Error running diagnostics:', error);
});
