// Tally API utility functions

// Set up global flag to track if extension is detected
window.__tallyExtensionDetected = false;

// Define custom error types for better error handling
class TallyAPIError extends Error {
  constructor(message, type, details = {}) {
    super(message);
    this.name = 'TallyAPIError';
    this.type = type;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

// Error type constants
const ErrorTypes = {
  CONNECTION: 'CONNECTION_ERROR',
  AUTHENTICATION: 'AUTHENTICATION_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  PARSING: 'PARSING_ERROR',
  SERVER: 'SERVER_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR'
};

// Listen for extension ready message
window.addEventListener('message', function(event) {
  // Check for extension ready message
  if (event.data && event.data.type === 'TALLY_EXTENSION_READY') {
    window.__tallyExtensionDetected = true;
    console.log('Tally CORS Bridge extension detected and ready');
    
    // Trigger custom event that the page can listen for
    window.dispatchEvent(new CustomEvent('tallyExtensionReady', {
      detail: {
        timestamp: event.data.timestamp,
        extensionId: event.data.extensionId
      }
    }));
  }
  
  // Handle detection response
  if (event.data && 
      (event.data.type === 'TALLY_EXTENSION_DETECTED' || 
       event.data.type === 'TALLY_EXTENSION_BACKGROUND_RESPONSE')) {
    window.__tallyExtensionDetected = true;
    
    // Complete any pending detect callbacks
    if (window.__tallyDetectCallbacks && window.__tallyDetectCallbacks[event.data.id]) {
      window.__tallyDetectCallbacks[event.data.id](true, event.data);
      delete window.__tallyDetectCallbacks[event.data.id];
    }
  }
});

// Helper for extension detection
window.detectTallyExtension = function(callback, timeoutMs = 1000) {
  // Initialize callbacks store if needed
  if (!window.__tallyDetectCallbacks) {
    window.__tallyDetectCallbacks = {};
  }
  
  // Generate a unique ID for this detection request
  const detectId = 'detect_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  
  // Set up timeout
  const timeoutId = setTimeout(() => {
    if (window.__tallyDetectCallbacks[detectId]) {
      window.__tallyDetectCallbacks[detectId](false, { error: 'Detection timed out' });
      delete window.__tallyDetectCallbacks[detectId];
    }
  }, timeoutMs);
  
  // Store callback with timeout cleanup
  window.__tallyDetectCallbacks[detectId] = (detected, data) => {
    clearTimeout(timeoutId);
    callback(detected, data);
  };
  
  // Send detection message
  window.postMessage({
    type: 'TALLY_EXTENSION_DETECT',
    id: detectId,
    timestamp: Date.now()
  }, '*');
  
  return detectId;
};

class TallyAPI {
  constructor(baseUrl = "http://localhost:9000") {
    this.baseUrl = baseUrl;
    this.errorTypes = ErrorTypes;
  }

  // Set the base URL for API calls
  setBaseUrl(url) {
    this.baseUrl = url;
  }

  // Send XML request to Tally
  async sendRequest(tallyRequest) {
    try {
      // Validate input
      if (!tallyRequest || typeof tallyRequest !== 'string') {
        throw new TallyAPIError(
          'Invalid Tally request format',
          ErrorTypes.VALIDATION,
          { request: tallyRequest }
        );
      }

      // Check connection before sending
      try {
        await fetch(`${this.baseUrl}`, { 
          method: 'HEAD',
          signal: AbortSignal.timeout(2000) // 2 second timeout for connection check
        });
      } catch (connError) {
        throw new TallyAPIError(
          `Cannot connect to Tally server at ${this.baseUrl}`,
          ErrorTypes.CONNECTION,
          { originalError: connError.message }
        );
      }

      // Send the actual request
      const response = await fetch(`${this.baseUrl}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/xml'
        },
        body: tallyRequest
      });

      if (!response.ok) {
        let errorType = ErrorTypes.SERVER;
        if (response.status === 401 || response.status === 403) {
          errorType = ErrorTypes.AUTHENTICATION;
        }
        
        throw new TallyAPIError(
          `Server responded with status: ${response.status} ${response.statusText}`,
          errorType,
          { status: response.status, statusText: response.statusText }
        );
      }

      const data = await response.text();
      return this.parseXmlResponse(data);
    } catch (error) {
      // Wrap non-TallyAPIError errors
      if (!(error instanceof TallyAPIError)) {
        error = new TallyAPIError(
          `Error sending request to Tally: ${error.message}`,
          ErrorTypes.UNKNOWN,
          { originalError: error.message }
        );
      }
      
      console.error('Tally API Error:', error);
      
      // Log error to extension's diagnostic log
      this.logError(error);
      
      throw error;
    }
  }

  // Parse XML response from Tally
  parseXmlResponse(xmlString) {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, "text/xml");
      
      // Handle parsing errors
      const parserError = xmlDoc.querySelector('parsererror');
      if (parserError) {
        throw new TallyAPIError(
          'XML parsing error: ' + parserError.textContent,
          ErrorTypes.PARSING,
          { xmlResponse: xmlString.substring(0, 500) } // First 500 chars for context
        );
      }
      
      // Check for Tally error responses
      const tallyError = xmlDoc.querySelector('LINEERROR, REGERROR');
      if (tallyError) {
        throw new TallyAPIError(
          `Tally reported an error: ${tallyError.textContent}`,
          ErrorTypes.SERVER,
          { tallyError: tallyError.textContent }
        );
      }
      
      return xmlDoc;
    } catch (error) {
      // Wrap non-TallyAPIError errors
      if (!(error instanceof TallyAPIError)) {
        error = new TallyAPIError(
          `Error parsing XML response: ${error.message}`,
          ErrorTypes.PARSING,
          { originalError: error.message }
        );
      }
      
      throw error;
    }
  }

  // Log errors for diagnostic purposes
  logError(error) {
    try {
      const errorLog = JSON.parse(localStorage.getItem('tallyErrorLog') || '[]');
      errorLog.push({
        timestamp: new Date().toISOString(),
        message: error.message,
        type: error.type,
        details: error.details
      });
      
      // Keep only the last 20 errors
      while (errorLog.length > 20) {
        errorLog.shift();
      }
      
      localStorage.setItem('tallyErrorLog', JSON.stringify(errorLog));
    } catch (e) {
      console.error('Error logging to diagnostic log:', e);
    }
  }

  // Get diagnostic logs
  getDiagnosticLogs() {
    try {
      return JSON.parse(localStorage.getItem('tallyErrorLog') || '[]');
    } catch (e) {
      return [];
    }
  }

  // Clear diagnostic logs
  clearDiagnosticLogs() {
    localStorage.removeItem('tallyErrorLog');
  }

  // Build XML for company list request
  getCompanyListRequest() {
    return `<ENVELOPE>
      <HEADER>
        <VERSION>1</VERSION>
        <TALLYREQUEST>Export</TALLYREQUEST>
        <TYPE>Collection</TYPE>
        <ID>List of Companies</ID>
      </HEADER>
      <BODY>
        <DESC>
          <STATICVARIABLES>
            <SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>
          </STATICVARIABLES>
        </DESC>
      </BODY>
    </ENVELOPE>`;
  }

  // Build XML for ledger request
  getLedgersRequest(companyName) {
    return `<ENVELOPE>
      <HEADER>
        <VERSION>1</VERSION>
        <TALLYREQUEST>Export</TALLYREQUEST>
        <TYPE>Collection</TYPE>
        <ID>List of Ledgers</ID>
      </HEADER>
      <BODY>
        <DESC>
          <STATICVARIABLES>
            <SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>
            <COMPANYNAME>${companyName}</COMPANYNAME>
          </STATICVARIABLES>
        </DESC>
      </BODY>
    </ENVELOPE>`;
  }

  // Build XML for sales invoices request
  getSalesInvoicesRequest(companyName, fromDate, toDate) {
    return `<ENVELOPE>
      <HEADER>
        <VERSION>1</VERSION>
        <TALLYREQUEST>Export</TALLYREQUEST>
        <TYPE>Collection</TYPE>
        <ID>Sales Register</ID>
      </HEADER>
      <BODY>
        <DESC>
          <STATICVARIABLES>
            <SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>
            <COMPANYNAME>${companyName}</COMPANYNAME>
            <SVFROMDATE>${fromDate}</SVFROMDATE>
            <SVTODATE>${toDate}</SVTODATE>
          </STATICVARIABLES>
        </DESC>
      </BODY>
    </ENVELOPE>`;
  }
}

// Export the class and error types
window.TallyAPI = TallyAPI;
window.TallyAPIErrorTypes = ErrorTypes;
