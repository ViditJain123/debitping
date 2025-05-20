// Background script for Tally CORS Bridge

// Error tracking
let errorLog = [];
const MAX_ERROR_LOG_SIZE = 50;

// Log errors for diagnostic purposes
function logError(error) {
  const errorEntry = {
    timestamp: new Date().toISOString(),
    message: error.message || 'Unknown error',
    type: error.type || 'UNKNOWN_ERROR',
    details: error.details || {},
    source: 'background'
  };
  
  // Add to in-memory log
  errorLog.push(errorEntry);
  
  // Keep only the most recent errors
  if (errorLog.length > MAX_ERROR_LOG_SIZE) {
    errorLog.shift();
  }
  
  // Also persist to storage
  chrome.storage.local.set({ tallyErrorLog: errorLog });
  
  console.error('Tally extension error:', errorEntry);
}

// Load any existing error log from storage
chrome.storage.local.get('tallyErrorLog', function(data) {
  if (data.tallyErrorLog && Array.isArray(data.tallyErrorLog)) {
    errorLog = data.tallyErrorLog;
  }
});

// Initialize default configuration
chrome.runtime.onInstalled.addListener(function() {
  chrome.storage.local.get('tallyConfig', function(data) {
    if (!data.tallyConfig) {
      chrome.storage.local.set({
        tallyConfig: {
          enabled: true,
          tallyEndpoint: "http://localhost:9000"
        }
      });
    }
    
    // Log installation/update event
    const manifest = chrome.runtime.getManifest();
    logError({
      message: `Extension ${manifest.version} ${chrome.runtime.id} installed/updated`,
      type: 'LIFECYCLE_EVENT',
      details: { 
        version: manifest.version,
        extensionId: chrome.runtime.id,
        action: 'installed/updated'
      }
    });
  });
});

// Improved message handler with better response for debugging
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    // Log all requests for debugging
    console.log("Background script received message:", request);
    
    if (request.action === "getConfig") {
      // Get the current config
      chrome.storage.local.get('tallyConfig', function(data) {
        const config = data.tallyConfig || {
          enabled: true,
          tallyEndpoint: "http://localhost:9000"
        };
        
        // For debugging messages, add extra information
        if (request.debug) {
          sendResponse({
            config: config,
            debug: {
              extensionId: chrome.runtime.id,
              timestamp: new Date().toISOString(),
              version: chrome.runtime.getManifest().version,
              sender: sender
            }
          });
        } else {
          sendResponse({
            config: config
          });
        }
      });
      return true; // Required for async response
    } else if (request.action === "updateConfig") {
      // Save the updated config
      chrome.storage.local.set({tallyConfig: request.config}, function() {
        sendResponse({status: "Config updated"});
      });
      return true; // Required for async response
    } else if (request.action === "ping") {
      // Simple ping test for detection
      sendResponse({
        status: "alive", 
        timestamp: new Date().toISOString(),
        version: chrome.runtime.getManifest().version
      });
      return true;
    } else if (request.action === "getDiagnostics") {
      // Return diagnostic information
      chrome.storage.local.get(['tallyConfig', 'tallyErrorLog'], function(data) {
        sendResponse({
          status: "ok",
          timestamp: new Date().toISOString(),
          version: chrome.runtime.getManifest().version,
          extensionId: chrome.runtime.id,
          config: data.tallyConfig || { 
            enabled: true,
            tallyEndpoint: "http://localhost:9000"
          },
          errorLog: data.tallyErrorLog || errorLog || []
        });
      });
      return true; // Required for async response
    } else if (request.action === "clearDiagnostics") {
      // Clear error logs
      errorLog = [];
      chrome.storage.local.remove('tallyErrorLog', function() {
        sendResponse({
          status: "ok",
          message: "Diagnostic logs cleared"
        });
      });
      return true; // Required for async response
    } else if (request.action === "testTallyConnection") {
      // Test connection to Tally
      const config = request.config || {};
      const endpoint = config.endpoint || "http://localhost:9000";
      
      fetch(endpoint, { 
        method: 'HEAD',
        signal: AbortSignal.timeout(3000) // 3 second timeout
      })
      .then(response => {
        sendResponse({
          status: "ok",
          connected: true,
          serverResponse: {
            status: response.status,
            statusText: response.statusText
          }
        });
      })
      .catch(error => {
        logError({
          message: `Tally connection test failed: ${error.message}`,
          type: 'CONNECTION_ERROR',
          details: { 
            endpoint: endpoint,
            error: error.message
          }
        });
        
        sendResponse({
          status: "error",
          connected: false,
          error: error.message
        });
      });
      
      return true; // Required for async response
    }
  }
);
