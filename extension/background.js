// Background script for Tally CORS Bridge

// Error tracking
let errorLog = [];
const MAX_ERROR_LOG_SIZE = 50;

// Log errors for diagnostic purposes
function logError(error) {
  try {
    // Normalize error object
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
    chrome.storage.local.set({ tallyErrorLog: errorLog }, function() {
      if (chrome.runtime.lastError) {
        console.error('Failed to save error log:', chrome.runtime.lastError);
      }
    });
    
    console.error('Tally extension error:', errorEntry);
  } catch (e) {
    // Last resort error logging
    console.error('Error in logError function:', e);
    console.error('Original error:', error);
  }
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

// Check if Tally server is running (useful for diagnostics)
function checkTallyConnection(endpoint, callback) {
  endpoint = endpoint || "http://localhost:9000";
  
  console.log("Checking Tally connection at:", endpoint);
  
  fetch(endpoint, { 
    method: 'HEAD',
    signal: AbortSignal.timeout(3000) // 3 second timeout
  })
  .then(response => {
    console.log("Tally connection check successful:", response.status);
    callback({
      connected: true,
      status: response.status,
      statusText: response.statusText
    });
  })
  .catch(error => {
    console.error("Tally connection check failed:", error);
    logError({
      message: `Tally connection check failed: ${error.message}`,
      type: 'CONNECTION_ERROR',
      details: { 
        endpoint: endpoint,
        error: error.message 
      }
    });
    
    callback({
      connected: false,
      error: error.message
    });
  });
}

// Check if local storage is working properly
function checkLocalStorage(callback) {
  const testData = { test: "storage-test-" + Date.now() };
  
  try {
    chrome.storage.local.set({storageTest: testData}, function() {
      if (chrome.runtime.lastError) {
        callback({
          working: false,
          error: chrome.runtime.lastError.message
        });
        return;
      }
      
      chrome.storage.local.get('storageTest', function(data) {
        if (chrome.runtime.lastError) {
          callback({
            working: false,
            error: chrome.runtime.lastError.message
          });
          return;
        }
        
        if (!data || !data.storageTest || data.storageTest.test !== testData.test) {
          callback({
            working: false,
            error: "Storage verification failed",
            expected: testData,
            received: data
          });
          return;
        }
        
        // Storage is working correctly
        callback({ working: true });
        
        // Clean up test data
        chrome.storage.local.remove('storageTest');
      });
    });
  } catch (e) {
    callback({
      working: false,
      error: e.message,
      exception: e.toString()
    });
  }
}

// Improved message handler with better response for debugging
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    // Log all requests for debugging
    console.log("Background script received message:", request, "from sender:", sender);
    
    try {
      if (request.action === "getConfig") {
        // Get the current config
        chrome.storage.local.get('tallyConfig', function(data) {
          if (chrome.runtime.lastError) {
            console.error("Error getting config:", chrome.runtime.lastError);
            sendResponse({
              error: "Failed to get config: " + chrome.runtime.lastError.message,
              fallbackConfig: {
                enabled: true,
                tallyEndpoint: "http://localhost:9000"
              }
            });
            return;
          }
          
          const config = data.tallyConfig || {
            enabled: true,
            tallyEndpoint: "http://localhost:9000"
          };
          
          console.log("Retrieved config:", config);
          
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
        
        console.log("Testing connection to Tally at:", endpoint);
        
        fetch(endpoint, { 
          method: 'HEAD',
          signal: AbortSignal.timeout(3000) // 3 second timeout
        })
        .then(response => {
          console.log("Tally connection test successful:", response.status);
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
          console.error("Tally connection test failed:", error);
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
      } else if (request.action === "checkLocalStorage") {
        // Check if storage is working properly
        checkLocalStorage(function(result) {
          sendResponse({
            status: result.working ? "ok" : "error",
            storageStatus: result
          });
        });
        return true; // Required for async response
      } else {
        // Unknown action
        sendResponse({
          status: "error",
          error: `Unknown action: ${request.action}`
        });
      }
    } catch (error) {
      // Handle any exceptions in the message handler
      console.error("Error handling message:", error);
      logError({
        message: `Error handling message: ${error.message}`,
        type: 'MESSAGE_HANDLER_ERROR',
        details: { 
          error: error.toString(),
          request: request 
        }
      });
      
      sendResponse({
        status: "error",
        error: `Error processing request: ${error.message}`
      });
    }
    return true;
  }
);
