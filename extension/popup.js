// Popup script for Tally CORS Bridge

// Load saved configuration when popup opens
document.addEventListener('DOMContentLoaded', function() {
  // Fetch current configuration
  chrome.runtime.sendMessage({action: "getConfig"}, function(response) {
    const config = response.config;
    
    // Set UI elements to match saved config
    document.getElementById('enableBridge').checked = config.enabled;
    document.getElementById('tallyEndpoint').value = config.tallyEndpoint || "http://localhost:9000";
  });
  
  // Add event listeners
  document.getElementById('saveButton').addEventListener('click', saveConfig);
  document.getElementById('testConnection').addEventListener('click', testConnection);
  document.getElementById('openTestPage').addEventListener('click', openTestPage);
  document.getElementById('clearLogs').addEventListener('click', clearLogs);
});

// Save configuration
function saveConfig() {
  const config = {
    enabled: document.getElementById('enableBridge').checked,
    tallyEndpoint: document.getElementById('tallyEndpoint').value
  };
  
  // Send config to background script for saving
  chrome.runtime.sendMessage({
    action: "updateConfig",
    config: config
  }, function(response) {
    // Show success message
    showStatus("Settings saved successfully!", "success");
  });
}

// Test connection to Tally server
function testConnection() {
  const endpoint = document.getElementById('tallyEndpoint').value;
  
  showStatus("Testing connection to Tally...", "");
  
  // Send test request to background script
  chrome.runtime.sendMessage({
    action: "testTallyConnection",
    config: {
      endpoint: endpoint
    }
  }, function(response) {
    if (response.connected) {
      showStatus("Connection to Tally successful!", "success");
    } else {
      showStatus(`Connection failed: ${response.error}`, "error");
    }
  });
}

// Open test page in a new tab
function openTestPage() {
  chrome.tabs.create({
    url: chrome.runtime.getURL('test.html')
  });
}

// Clear error logs
function clearLogs() {
  chrome.runtime.sendMessage({
    action: "clearDiagnostics"
  }, function(response) {
    showStatus("Diagnostic logs cleared!", "success");
  });
}

// Helper to show status messages
function showStatus(message, type) {
  const statusEl = document.getElementById('status');
  statusEl.textContent = message;
  statusEl.className = type ? `status ${type}` : "status";
  
  // Hide message after 3 seconds if it's a success message
  if (type === "success") {
    setTimeout(function() {
      statusEl.className = "status";
    }, 3000);
  }
}
