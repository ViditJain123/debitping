// Script to create a zip file of the extension
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

// Get the manifest to read version number
const manifestPath = path.join(__dirname, '../extension/manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const version = manifest.version || '1.0';

const extensionDir = path.join(__dirname, '../extension');
const outputFile = path.join(__dirname, `../public/downloads/tally-cors-bridge-v${version}.zip`);

// Also create a version-independent file for backward compatibility
const legacyOutputFile = path.join(__dirname, '../public/downloads/tally-cors-bridge.zip');

console.log(`Creating extension package version ${version}`);

// Ensure the downloads directory exists
const downloadsDir = path.dirname(outputFile);
if (!fs.existsSync(downloadsDir)) {
  fs.mkdirSync(downloadsDir, { recursive: true });
}

// Create a file to stream archive data to
const output = fs.createWriteStream(outputFile);
const archive = archiver('zip', {
  zlib: { level: 9 } // Sets the compression level
});

// Listen for all archive data to be written
// 'close' event is fired only when a file descriptor is involved
output.on('close', function() {
  console.log(`Extension ZIP created: ${outputFile}`);
  console.log(`Total bytes: ${archive.pointer()}`);
  
  // Also copy to the legacy filename for backward compatibility
  fs.copyFileSync(outputFile, legacyOutputFile);
  console.log(`Legacy file created: ${legacyOutputFile}`);
});

// This event is fired when the data source is drained no matter what was the data source.
// It is not part of this library but rather from the NodeJS Stream API.
output.on('end', function() {
  console.log('Data has been drained');
});

// Good practice to catch warnings (ie stat failures and other non-blocking errors)
archive.on('warning', function(err) {
  if (err.code === 'ENOENT') {
    // log warning
    console.warn(err);
  } else {
    // throw error
    throw err;
  }
});

// Good practice to catch this error explicitly
archive.on('error', function(err) {
  throw err;
});

// Pipe archive data to the file
archive.pipe(output);

// Append the extension directory content
archive.directory(extensionDir, false);

// Finalize the archive (ie we are done appending files but streams have to finish yet)
archive.finalize();
