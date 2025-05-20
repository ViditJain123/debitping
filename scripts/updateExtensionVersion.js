/**
 * Script to update the version number in the extension's manifest.json file
 * 
 * Usage: node updateExtensionVersion.js [patch|minor|major]
 * - patch: Increases the third number (1.0.0 -> 1.0.1)
 * - minor: Increases the second number (1.0.0 -> 1.1.0)
 * - major: Increases the first number (1.0.0 -> 2.0.0)
 * 
 * If no argument is provided, defaults to patch.
 */

const fs = require('fs');
const path = require('path');

// Path to manifest.json
const manifestPath = path.join(__dirname, '..', 'extension', 'manifest.json');

// Read the manifest file
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

// Get the current version
const currentVersion = manifest.version;
console.log(`Current version: ${currentVersion}`);

// Parse the version
const versionParts = currentVersion.split('.').map(part => parseInt(part, 10));
if (versionParts.length !== 3) {
  // If not in format x.y.z, convert to proper format
  while (versionParts.length < 3) {
    versionParts.push(0);
  }
}

// Get the version update type from command line arguments
const updateType = process.argv[2] || 'patch';

// Update the version based on the type
switch (updateType.toLowerCase()) {
  case 'major':
    versionParts[0] += 1;
    versionParts[1] = 0;
    versionParts[2] = 0;
    break;
  case 'minor':
    versionParts[1] += 1;
    versionParts[2] = 0;
    break;
  case 'patch':
  default:
    versionParts[2] += 1;
    break;
}

// Create the new version string
const newVersion = versionParts.join('.');

// Update the manifest
manifest.version = newVersion;

// Write the updated manifest back to the file
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

console.log(`Updated to version: ${newVersion}`);

// Also update the package.json if it contains extension version
try {
  const packagePath = path.join(__dirname, '..', 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  if (packageJson.extensionVersion) {
    packageJson.extensionVersion = newVersion;
    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
    console.log(`Updated extensionVersion in package.json to: ${newVersion}`);
  }
} catch (error) {
  // Ignore errors with package.json
  console.log('Could not update package.json (this may be normal)');
}

// Update the createExtensionZip script to include version in filename
try {
  const zipScriptPath = path.join(__dirname, 'createExtensionZip.js');
  let zipScript = fs.readFileSync(zipScriptPath, 'utf8');
  
  // Update the output filename to include version
  if (zipScript.includes('tally-cors-bridge.zip')) {
    zipScript = zipScript.replace(
      /('|")tally-cors-bridge\.zip('|")/g, 
      `$1tally-cors-bridge-v${newVersion}.zip$2`
    );
    fs.writeFileSync(zipScriptPath, zipScript);
    console.log(`Updated ZIP filename in createExtensionZip.js to include version v${newVersion}`);
  }
} catch (error) {
  console.log('Could not update createExtensionZip.js (this may be normal)');
}

console.log('Version update complete!');
