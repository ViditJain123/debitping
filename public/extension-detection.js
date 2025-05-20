// This script helps detect the Tally extension by setting up global detection helpers

// Define a global detection function if it doesn't exist
if (typeof window.detectTallyExtension !== 'function') {
  window.detectTallyExtension = function(callback, timeout = 1500) {
    if (window.__tallyExtensionDetected) {
      callback?.(true, { source: 'global-flag' });
      return;
    }
    
    // Check if the extension has set the TallyAPI object
    if (typeof window.TallyAPI === 'function') {
      window.__tallyExtensionDetected = true;
      callback?.(true, { source: 'tally-api-object' });
      return;
    }
    
    // Initialize callback tracking if not already done
    if (!window.__tallyDetectCallbacks) {
      window.__tallyDetectCallbacks = {};
    }
    
    // Generate a unique ID for this detection request
    const detectId = 'detect-' + Date.now() + '-' + Math.floor(Math.random() * 1000000);
    
    // Store the callback
    window.__tallyDetectCallbacks[detectId] = callback;
    
    // Set a timeout to clean up and call back with false if no response
    const timeoutId = setTimeout(() => {
      if (window.__tallyDetectCallbacks[detectId]) {
        callback?.(false, { source: 'timeout' });
        delete window.__tallyDetectCallbacks[detectId];
      }
    }, timeout);
    
    // Try to ping the extension
    try {
      window.postMessage({
        type: 'TALLY_EXTENSION_DETECT',
        id: detectId,
        timestamp: new Date().toISOString()
      }, '*');
    } catch (e) {
      console.error('Error detecting Tally extension:', e);
      clearTimeout(timeoutId);
      callback?.(false, { source: 'error', error: e.message });
      delete window.__tallyDetectCallbacks[detectId];
    }
  };
}

// Listen for extension ready event
const extensionReadyHandler = function(event) {
  // Could be a CustomEvent or a MessageEvent
  window.__tallyExtensionDetected = true;
  console.log('Extension ready event received in helper script');
  
  // If it's a regular DOM event
  if (event.type === 'tallyExtensionReady') {
    // Trigger any waiting callbacks
    if (window.__tallyDetectCallbacks) {
      Object.keys(window.__tallyDetectCallbacks).forEach(id => {
        const callback = window.__tallyDetectCallbacks[id];
        if (typeof callback === 'function') {
          callback(true, { source: 'ready-event', event: 'dom-event' });
        }
        delete window.__tallyDetectCallbacks[id];
      });
    }
  }
  
  // Try to trigger another event that the extension might be listening for
  try {
    window.postMessage({
      type: 'TALLY_EXTENSION_DETECT',
      id: 'helper-script-' + Date.now(),
      timestamp: new Date().toISOString()
    }, '*');
  } catch (e) {
    console.error('Error in extension ready handler:', e);
  }
};

// Add event listeners for extension ready event (try both window and document)
window.addEventListener('tallyExtensionReady', extensionReadyHandler);
document.addEventListener('tallyExtensionReady', extensionReadyHandler);

// Also listen for message events that might come from the extension
window.addEventListener('message', function(event) {
  // Only process messages from our window
  if (event.source !== window) return;
  
  // Check for extension detection messages
  if (event.data && (
      event.data.type === 'TALLY_EXTENSION_DETECTED' || 
      event.data.type === 'TALLY_EXTENSION_BACKGROUND_RESPONSE' ||
      event.data.type === 'TALLY_EXTENSION_READY')) {
    
    // Set global detection flag
    window.__tallyExtensionDetected = true;
    
    // If it's a response to a specific detection request
    if (event.data.id && window.__tallyDetectCallbacks && window.__tallyDetectCallbacks[event.data.id]) {
      const callback = window.__tallyDetectCallbacks[event.data.id];
      if (typeof callback === 'function') {
        callback(true, { source: 'message-event', data: event.data });
      }
      delete window.__tallyDetectCallbacks[event.data.id];
    }
    
    // Dispatch a DOM event that our components can listen for
    try {
      const domEvent = new CustomEvent('tallyExtensionReady', {
        detail: {
          timestamp: event.data.timestamp || new Date().toISOString(),
          source: 'message-event',
          data: event.data
        }
      });
      window.dispatchEvent(domEvent);
      document.dispatchEvent(domEvent);
    } catch (e) {
      console.error('Error dispatching extension event:', e);
    }
  }
});
