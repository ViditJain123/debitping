#!/usr/bin/env node

/**
 * This script helps reset the Tally CORS Bridge extension detection state.
 * Run it when you're having issues with the extension being detected properly.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Tally CORS Bridge Extension Troubleshooter');
console.log('=========================================');
console.log('This script will help resolve issues with the extension not being detected correctly.');

// 1. Check if the extension files exist
const extensionDir = path.join(__dirname, '..', 'extension');
if (!fs.existsSync(extensionDir)) {
  console.error('ERROR: Extension directory not found!');
  process.exit(1);
}

console.log('\n✅ Extension directory found:', extensionDir);

// 2. Check if manifest.json exists and is valid
const manifestPath = path.join(extensionDir, 'manifest.json');
if (!fs.existsSync(manifestPath)) {
  console.error('ERROR: manifest.json not found in extension directory!');
  process.exit(1);
}

try {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  console.log('✅ Valid manifest.json found');
  console.log(`   Extension Name: ${manifest.name}`);
  console.log(`   Version: ${manifest.version}`);
} catch (error) {
  console.error('ERROR: Failed to parse manifest.json:', error.message);
  process.exit(1);
}

// 3. Ensure the extension zip file is up-to-date
console.log('\nChecking extension zip file...');
try {
  execSync('node scripts/createExtensionZip.js', { stdio: 'inherit' });
  console.log('✅ Extension zip file updated successfully');
} catch (error) {
  console.error('ERROR: Failed to create extension zip file.');
  console.error('You can try running: npm run package-extension');
}

// 4. Show next steps
console.log('\n=========================================');
console.log('NEXT STEPS:');
console.log('1. Make sure you have installed the extension in Chrome');
console.log('2. Open Chrome and go to chrome://extensions');
console.log('3. Find "Tally CORS Bridge" and check that it is enabled');
console.log('4. Click the "Reload" icon on the extension to refresh it');
console.log('5. Return to the application and click the "Reset Extension Detection" button');
console.log('6. If issues persist, try uninstalling and reinstalling the extension');
console.log('\nFor complete instructions, refer to extension/INSTALLATION.md');
console.log('=========================================');
