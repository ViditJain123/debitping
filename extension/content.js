// Content script for Tally CORS Bridge

// Inject the Tally API utility into the page
const script = document.createElement('script');
script.src = chrome.runtime.getURL('tally-api.js');
(document.head || document.documentElement).appendChild(script);
script.onload = function() {
  script.remove();
  
  // Let the page know the extension is ready
  window.postMessage({
    type: 'TALLY_EXTENSION_READY',
    extensionId: chrome.runtime.id,
    timestamp: new Date().toISOString()
  }, '*');
  
  // Explicitly log to console for debugging
  console.log('Tally CORS Bridge extension injected and ready:', chrome.runtime.id);
};

// Listen for messages from the page
window.addEventListener('message', function(event) {
  // Ensure the message is from the same origin
  if (event.source !== window) return;

  // Handle detection ping
  if (event.data.type === 'TALLY_EXTENSION_DETECT') {
    console.log('Extension detection requested with ID:', event.data.id);
    
    // Immediately respond to the page
    window.postMessage({
      type: 'TALLY_EXTENSION_DETECTED',
      id: event.data.id,
      timestamp: new Date().toISOString(),
      source: 'content_script'
    }, '*');
    
    // Also forward to background script for more complete detection
    chrome.runtime.sendMessage(
      { action: "ping" },
      function(response) {
        // Check if we got a response from the background
        if (chrome.runtime.lastError) {
          console.error('Background script error:', chrome.runtime.lastError);
          window.postMessage({
            type: 'TALLY_EXTENSION_BACKGROUND_ERROR',
            id: event.data.id,
            error: chrome.runtime.lastError
          }, '*');
          return;
        }
        
        window.postMessage({
          type: 'TALLY_EXTENSION_BACKGROUND_RESPONSE',
          id: event.data.id,
          data: response
        }, '*');
      }
    );
  }

  // Handle Tally API requests from the page
  if (event.data.type === 'TALLY_API_REQUEST') {
    // Get the current extension configuration
    chrome.runtime.sendMessage({action: "getConfig"}, function(response) {
      // Check for runtime errors
      if (chrome.runtime.lastError) {
        console.error('Background script error:', chrome.runtime.lastError);
        window.postMessage({
          type: 'TALLY_API_RESPONSE',
          id: event.data.id,
          error: {
            message: 'Failed to get configuration: ' + chrome.runtime.lastError.message,
            type: 'EXTENSION_ERROR',
            details: { error: chrome.runtime.lastError }
          }
        }, '*');
        return;
      }
      
      // Check if we got a valid response with config
      if (!response || !response.config) {
        console.error('Invalid config response:', response);
        window.postMessage({
          type: 'TALLY_API_RESPONSE',
          id: event.data.id,
          error: {
            message: 'Invalid extension configuration',
            type: 'EXTENSION_CONFIG_ERROR',
            details: { response }
          }
        }, '*');
        return;
      }
      
      const config = response.config;
      
      if (!config.enabled) {
        window.postMessage({
          type: 'TALLY_API_RESPONSE',
          id: event.data.id,
          error: {
            message: 'Tally CORS Bridge is disabled',
            type: 'EXTENSION_DISABLED',
            details: {}
          }
        }, '*');
        return;
      }
      
      console.log('Making request to Tally at:', config.tallyEndpoint);
      
      // Make the request to Tally
      fetch(config.tallyEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/xml'
        },
        body: event.data.payload
      })
      .then(response => {
        if (!response.ok) {
          let errorType = 'SERVER_ERROR';
          if (response.status === 401 || response.status === 403) {
            errorType = 'AUTHENTICATION_ERROR';
          }
          
          throw {
            message: `Server responded with status: ${response.status} ${response.statusText}`,
            type: errorType,
            details: { status: response.status, statusText: response.statusText }
          };
        }
        return response.text();
      })
      .then(data => {
        console.log('Received successful response from Tally');
        window.postMessage({
          type: 'TALLY_API_RESPONSE',
          id: event.data.id,
          data: data
        }, '*');
      })
      .catch(error => {
        // Format error response consistently
        const errorResponse = {
          message: error.message || 'Unknown error',
          type: error.type || 'UNKNOWN_ERROR',
          details: error.details || {}
        };
        
        // Log error for diagnostic purposes
        console.error('Tally API request error:', errorResponse);
        
        window.postMessage({
          type: 'TALLY_API_RESPONSE',
          id: event.data.id,
          error: errorResponse
        }, '*');
      });
    });
  }
  
  // Handle diagnostic log requests
  if (event.data.type === 'TALLY_GET_DIAGNOSTICS') {
    chrome.runtime.sendMessage(
      { action: "getDiagnostics" },
      function(response) {
        window.postMessage({
          type: 'TALLY_DIAGNOSTICS_RESPONSE',
          id: event.data.id,
          data: response
        }, '*');
      }
    );
  }
});
