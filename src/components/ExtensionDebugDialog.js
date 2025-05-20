"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';

export default function ExtensionDebugDialog({ isOpen, setIsOpen }) {
  const [debugInfo, setDebugInfo] = useState({});
  const [diagnosticLogs, setDiagnosticLogs] = useState([]);

  // Gather diagnostic info when dialog opens
  useEffect(() => {
    if (isOpen) {
      gatherDebugInfo();
      getDiagnosticLogs();
    }
  }, [isOpen]);

  const gatherDebugInfo = async () => {
    const info = {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      localStorage: {},
      chromeDetection: {},
      tallyApi: {},
      browserInfo: {
        cookiesEnabled: navigator.cookieEnabled,
        language: navigator.language,
        platform: navigator.platform
      }
    };

    // Gather localStorage info
    ['tallyExtensionMissing', 'tallyExtensionRecentlyInstalled', 'tallyExtensionDismissedAt'].forEach(key => {
      info.localStorage[key] = localStorage.getItem(key);
    });

    // Check global detection variables
    info.tallyApi.extensionDetected = window.__tallyExtensionDetected || false;
    info.tallyApi.detectFunctionExists = typeof window.detectTallyExtension === 'function';
    info.tallyApi.TallyAPIExists = typeof window.TallyAPI === 'function';

    // Try to detect extension
    if (info.tallyApi.detectFunctionExists) {
      try {
        const detectionPromise = new Promise((resolve) => {
          window.detectTallyExtension((detected, data) => {
            resolve({
              detected,
              data
            });
          }, 2000);
        });
        
        info.tallyApi.detectionResult = await detectionPromise;
      } catch (error) {
        info.tallyApi.detectionResult = {
          error: error.message
        };
      }
    }

    // Check Chrome API availability
    info.chromeDetection.chromeExists = typeof chrome !== 'undefined';
    info.chromeDetection.runtimeExists = info.chromeDetection.chromeExists && typeof chrome.runtime !== 'undefined';
    info.chromeDetection.sendMessageExists = info.chromeDetection.runtimeExists && typeof chrome.runtime.sendMessage === 'function';

    // Try to send a test message
    if (info.chromeDetection.sendMessageExists) {
      try {
        const messagePromise = new Promise((resolve) => {
          const timeoutId = setTimeout(() => {
            resolve({ success: false, error: 'Timeout after 1 second' });
          }, 1000);

          chrome.runtime.sendMessage(
            { action: "getConfig", debug: true },
            (response) => {
              clearTimeout(timeoutId);
              resolve({ 
                success: true, 
                hasResponse: !!response,
                responseData: response 
              });
            }
          );
        });

        info.chromeDetection.testMessage = await messagePromise;
      } catch (error) {
        info.chromeDetection.testMessage = { 
          success: false, 
          error: error.message 
        };
      }
    }

    setDebugInfo(info);
  };

  // Get diagnostic logs from extension
  const getDiagnosticLogs = async () => {
    if (typeof window.postMessage !== 'function') {
      setDiagnosticLogs([{ error: 'postMessage not available' }]);
      return;
    }
    
    try {
      const requestId = 'get_diagnostics_' + Date.now();
      
      // Create promise to wait for response
      const diagPromise = new Promise((resolve) => {
        const timeoutId = setTimeout(() => {
          resolve({ error: 'Timeout waiting for diagnostics' });
        }, 2000);
        
        // Listen for response
        const messageHandler = (event) => {
          if (event.data && event.data.type === 'TALLY_DIAGNOSTICS_RESPONSE' && event.data.id === requestId) {
            window.removeEventListener('message', messageHandler);
            clearTimeout(timeoutId);
            resolve(event.data.data);
          }
        };
        
        window.addEventListener('message', messageHandler);
        
        // Send request
        window.postMessage({
          type: 'TALLY_GET_DIAGNOSTICS',
          id: requestId
        }, '*');
      });
      
      const result = await diagPromise;
      setDiagnosticLogs(result.errorLog || []);
    } catch (error) {
      setDiagnosticLogs([{ error: error.message }]);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Extension Detection Debug Info</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <div className="flex gap-2 mb-4">
            <Button 
              onClick={gatherDebugInfo}
              type="button"
            >
              Refresh Debug Info
            </Button>
            <Button 
              onClick={getDiagnosticLogs}
              type="button"
              variant="outline"
            >
              Get Diagnostic Logs
            </Button>
            <Button 
              onClick={() => window.location.reload()}
              type="button"
              variant="outline"
            >
              Reload Page
            </Button>
          </div>

          {Object.keys(debugInfo).length > 0 && (
            <>
              <h3 className="font-medium mb-2">Extension Status</h3>
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md overflow-auto max-h-[200px] mb-4">
                <pre className="text-xs font-mono whitespace-pre-wrap break-words">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </div>
            </>
          )}
          
          {diagnosticLogs.length > 0 && (
            <>
              <h3 className="font-medium mb-2">Extension Diagnostic Logs ({diagnosticLogs.length})</h3>
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md overflow-auto max-h-[200px]">
                <pre className="text-xs font-mono whitespace-pre-wrap break-words">
                  {JSON.stringify(diagnosticLogs, null, 2)}
                </pre>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            type="button"
            onClick={async () => {
              try {
                // Attempt to clear diagnostic logs
                if (typeof window.postMessage === 'function') {
                  window.postMessage({
                    type: 'TALLY_GET_DIAGNOSTICS',
                    id: 'clear_logs_' + Date.now(),
                    clear: true
                  }, '*');
                }
                
                // Wait a moment for logs to clear
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // Refresh diagnostic logs
                getDiagnosticLogs();
              } catch (error) {
                console.error('Error clearing logs:', error);
              }
            }}
            variant="secondary"
          >
            Clear Diagnostic Logs
          </Button>
          
          <Button
            type="button"
            onClick={() => {
              // Clear all extension-related localStorage flags
              localStorage.removeItem('tallyExtensionMissing');
              localStorage.removeItem('tallyExtensionRecentlyInstalled');
              localStorage.removeItem('tallyExtensionDismissedAt');
              
              // Force reload the page to restart detection
              window.location.reload();
            }}
            variant="destructive"
          >
            Clear All Detection State & Reload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
