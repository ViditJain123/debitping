# Tally CORS Bridge Extension Installation

Thank you for downloading the Tally CORS Bridge Extension. This extension allows the DebitPing application to communicate with your Tally ERP software by bypassing CORS restrictions.

## Installation Instructions

1. **Extract the ZIP file** to a folder on your computer.

2. **Open Chrome** and navigate to `chrome://extensions` in the address bar.

3. **Enable Developer Mode** by toggling the switch in the top-right corner of the extensions page.

4. **Click "Load unpacked"** and select the folder where you extracted the extension files.

5. **Verify installation** - You should see "Tally CORS Bridge" in your list of extensions with a toggle to enable/disable it.

6. **Return to DebitPing** - Refresh the DebitPing application page to connect with Tally.

## Configuration

You can configure the extension by clicking on its icon in your browser toolbar:

- **Tally Server Endpoint**: By default, this is set to `http://localhost:9000`, which is the standard Tally port.
- **Enable/Disable**: You can temporarily disable the extension without uninstalling it.
- **Test Connection**: Verify that the extension can communicate with Tally.
- **Test Page**: Access a comprehensive testing interface for troubleshooting.

## Troubleshooting

If you encounter issues:

1. Make sure Tally ERP is running on your computer
2. Verify the correct Tally Server Endpoint in the extension settings
3. Try restarting Chrome after installation
4. Ensure Developer Mode is enabled in Chrome
5. Use the "Test Connection" button to check connectivity
6. Open the "Test Page" for advanced diagnostics
7. Use the "Extension Debug" tool in the DebitPing application

### Test Page

The test page provides tools to:
- Verify extension detection
- Test connection to Tally
- Send sample requests
- View diagnostic logs

### Common Error Types

- **CONNECTION_ERROR**: Cannot connect to Tally at the specified endpoint
- **AUTHENTICATION_ERROR**: Invalid authentication with Tally
- **VALIDATION_ERROR**: Malformed request
- **PARSING_ERROR**: Cannot parse Tally's response
- **SERVER_ERROR**: Tally server returned an error

For additional support, please contact our support team.

---

This extension was created specifically for DebitPing users to integrate with Tally ERP.
