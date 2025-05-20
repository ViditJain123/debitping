# Tally CORS Bridge Extension

A Chrome extension that serves as a CORS bridge for Tally ERP integration, allowing your web application to communicate with Tally ERP without cross-origin restrictions.

## Features

- Bypasses CORS restrictions for Tally ERP integration
- Configurable Tally server endpoint
- Enhanced error handling with detailed diagnostics
- Test tools for troubleshooting and debugging
- Simple user interface for configuration

## Installation

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" using the toggle in the top-right corner
4. Click "Load unpacked" and select the extension directory
5. The extension should now be installed and visible in your toolbar

## Usage

### Configuration

1. Click on the extension icon in your Chrome toolbar
2. Set the Tally Server Endpoint (default is `http://localhost:9000`)
3. Toggle the extension on/off as needed
4. Click "Save Settings" to store your configuration
5. Use "Test Connection" to verify connectivity with Tally

### Using the API in your web application

The extension injects a `TallyAPI` class into your web pages. Here's how to use it:

```javascript
// Create a new instance of TallyAPI
const tallyApi = new TallyAPI();

// Example: Get list of companies
async function getCompanies() {
  try {
    const requestXml = tallyApi.getCompanyListRequest();
    const response = await tallyApi.sendRequest(requestXml);
    console.log('Companies:', response);
  } catch (error) {
    console.error('Error fetching companies:', error);
  }
}

// Example: Get ledgers for a specific company
async function getLedgers(companyName) {
  try {
    const requestXml = tallyApi.getLedgersRequest(companyName);
    const response = await tallyApi.sendRequest(requestXml);
    console.log('Ledgers:', response);
  } catch (error) {
    console.error('Error fetching ledgers:', error);
  }
}

// Example: Get sales invoices for a date range
async function getSalesInvoices(companyName, fromDate, toDate) {
  try {
    const requestXml = tallyApi.getSalesInvoicesRequest(companyName, fromDate, toDate);
    const response = await tallyApi.sendRequest(requestXml);
    console.log('Sales Invoices:', response);
  } catch (error) {
    console.error('Error fetching sales invoices:', error);
  }
}
```

## Troubleshooting

### Detection Issues

If the web application doesn't detect the extension:

1. Make sure the extension is installed and enabled
2. Refresh the page to reinitialize detection
3. Use the "Extension Debug" tool in the web application for diagnostics
4. Clear browser cache and local storage if necessary
5. Check the console for any error messages

### Error Handling

The extension now includes comprehensive error handling with specific error types:

- **CONNECTION_ERROR**: Issues connecting to Tally server
- **AUTHENTICATION_ERROR**: Authentication problems with Tally
- **VALIDATION_ERROR**: Invalid request format
- **PARSING_ERROR**: Problems parsing Tally XML responses
- **SERVER_ERROR**: Errors returned by Tally server
- **UNKNOWN_ERROR**: Unclassified errors

### Test Tools

The extension includes a test page that can be accessed by:

1. Clicking on the extension icon in the Chrome toolbar
2. Clicking "Open Test Page" in the popup

The test page provides tools for:
- Checking extension detection status
- Testing connection to Tally
- Sending test requests to Tally
- Viewing diagnostic logs

### Diagnostic Logs

The extension keeps track of errors for debugging purposes:

1. Use the Test Page to view the diagnostic logs
2. Check extension details via the "Extension Debug" tool in the web app
3. Reset logs using the "Clear Logs" button if they become too large

## Security Considerations

This extension is intended for development and internal use only. Be cautious when allowing CORS bypass in production environments, as it could potentially expose sensitive data.

## License

MIT License
