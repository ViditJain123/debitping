"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { FiAlertTriangle, FiCheckCircle, FiDownload, FiHelpCircle } from 'react-icons/fi';
import ExtensionDebugDialog from './ExtensionDebugDialog';

export default function ExtensionCheckDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [extensionInstalled, setExtensionInstalled] = useState(true);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [showDebugDialog, setShowDebugDialog] = useState(false);

  useEffect(() => {
    // Check if user has manually closed the dialog recently
    const userDismissedAt = localStorage.getItem('tallyExtensionDismissedAt');
    const currentTime = new Date().getTime();
    
    // If user dismissed dialog in the last hour, don't show it again
    if (userDismissedAt && (currentTime - parseInt(userDismissedAt)) < 3600000) {
      setIsOpen(false);
      return;
    }
    
    // Direct check for the extension being installed
    const checkIfExtensionInstalled = () => {
      return new Promise((resolve) => {
        // First check if we have the global detection flag
        if (window.__tallyExtensionDetected) {
          console.log("Extension detected via global flag");
          resolve(true);
          return;
        }
        
        // Check if the TallyAPI object exists, which is injected by the extension
        if (typeof window.TallyAPI === 'function') {
          console.log("Extension detected via TallyAPI object");
          window.__tallyExtensionDetected = true; // Set the flag manually
          resolve(true);
          return;
        }
        
        // Listen for the extension ready event
        const readyHandler = () => {
          console.log("Extension detected via ready event");
          window.removeEventListener('tallyExtensionReady', readyHandler);
          document.removeEventListener('tallyExtensionReady', readyHandler);
          clearTimeout(timeoutId);
          resolve(true);
        };
        
        // Set a timeout for extension response
        const timeoutId = setTimeout(() => {
          window.removeEventListener('tallyExtensionReady', readyHandler);
          document.removeEventListener('tallyExtensionReady', readyHandler);
          console.log("Extension detection timeout - trying alternative detection");
          
          // Try alternative detection via the detect function
          if (typeof window.detectTallyExtension === 'function') {
            window.detectTallyExtension((detected, data) => {
              console.log("Extension detection result:", detected, data);
              resolve(detected);
            }, 1200); // Increased timeout for more reliability
          } else {
            console.log("Extension detection helper not available");
            resolve(false);
          }
        }, 1200); // Increased timeout for more reliability
        
        // Add event listener for extension ready event (try both window and document)
        window.addEventListener('tallyExtensionReady', readyHandler);
        document.addEventListener('tallyExtensionReady', readyHandler);
      });
    };

    // Function to handle the extension check
    const checkExtension = async () => {
      try {
        // Force clear any stale local storage state
        const wasRecentlyInstalled = localStorage.getItem('tallyExtensionRecentlyInstalled') === 'true';
        
        // Check if extension is installed
        const isInstalled = await checkIfExtensionInstalled();
        
        // Update state based on whether extension is installed
        setExtensionInstalled(isInstalled);
        
        if (isInstalled) {
          console.log("Extension is installed");
          // Show success message if extension was recently missing (user just installed it)
          if (localStorage.getItem('tallyExtensionMissing') === 'true') {
            setShowSuccessMessage(true);
            setIsOpen(true);
            localStorage.removeItem('tallyExtensionMissing');
            localStorage.setItem('tallyExtensionRecentlyInstalled', 'true');
          } else if (wasRecentlyInstalled) {
            // If we've already shown the success message, hide the dialog
            setShowSuccessMessage(false);
            setIsOpen(false);
            localStorage.removeItem('tallyExtensionRecentlyInstalled');
          } else {
            // Extension was already installed, keep dialog closed
            setIsOpen(false);
          }
        } else {
          console.log("Extension is NOT installed, showing dialog");
          // Extension is not installed, show dialog and fetch extension URL
          setShowSuccessMessage(false);
          setIsOpen(true);
          localStorage.setItem('tallyExtensionMissing', 'true');
          fetchExtensionUrl();
        }
      } catch (error) {
        console.error("Error in extension check flow:", error);
        // Show dialog in case of errors
        setExtensionInstalled(false);
        setShowSuccessMessage(false);
        setIsOpen(true);
        fetchExtensionUrl();
      }
    };

    // Fetch the extension download URL
    const fetchExtensionUrl = async () => {
      try {
        const response = await fetch('/api/extension');
        const data = await response.json();
        if (data.downloadUrl) {
          setDownloadUrl(data.downloadUrl);
        }
      } catch (error) {
        console.error('Error fetching extension download URL:', error);
      }
    };

    // Check after a short delay to allow page to fully load
    const timer = setTimeout(() => {
      checkExtension();
    }, 3000); // Increased from 1500ms to 3000ms for a more reliable detection
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          {extensionInstalled && showSuccessMessage ? (
            // Success message
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-green-600">
                  <FiCheckCircle className="h-5 w-5" />
                  Tally Integration Active
                </DialogTitle>
                <DialogDescription>
                  The Tally CORS Bridge extension has been successfully detected.
                </DialogDescription>
              </DialogHeader>
              
              <div className="py-4">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  You can now use all Tally integration features in this application.
                </p>
              </div>

              <DialogFooter className="sm:justify-between flex flex-row gap-2">
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
                  variant="outline"
                >
                  Force Reset
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    setShowSuccessMessage(false);
                    // Clear all extension-related localStorage flags
                    localStorage.removeItem('tallyExtensionMissing');
                    localStorage.removeItem('tallyExtensionRecentlyInstalled');
                  }}
                >
                  Continue
                </Button>
              </DialogFooter>
            </>
          ) : (
            // Missing extension message
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-amber-600">
                  <FiAlertTriangle className="h-5 w-5" />
                  Tally Integration Required
                </DialogTitle>
                <DialogDescription>
                  The Tally CORS Bridge extension is required for this application to communicate with Tally.
                </DialogDescription>
              </DialogHeader>
              
              <div className="py-4">
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                  Please follow these steps to install the extension:
                </p>
                <ol className="text-sm text-gray-700 dark:text-gray-300 space-y-2 list-decimal pl-5">
                  <li>
                    {downloadUrl ? (
                      <a 
                        href={downloadUrl} 
                        className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        download
                      >
                        <FiDownload className="inline-block" /> Download the extension
                      </a>
                    ) : (
                      'Download the extension from the folder'
                    )}
                  </li>
                  <li>Open Chrome and go to <code>chrome://extensions</code></li>
                  <li>Enable &quot;Developer mode&quot; in the top-right corner</li>
                  <li>Click &quot;Load unpacked&quot; and select the extension directory</li>
                  <li>Refresh this page after installation</li>
                </ol>
              </div>

              <DialogFooter className="sm:justify-between flex flex-row gap-2">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      // Remember when user dismissed the dialog
                      localStorage.setItem('tallyExtensionDismissedAt', new Date().getTime().toString());
                      setIsOpen(false);
                    }}
                  >
                    Dismiss
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      // Clear all extension-related localStorage flags
                      localStorage.removeItem('tallyExtensionMissing');
                      localStorage.removeItem('tallyExtensionRecentlyInstalled');
                      localStorage.removeItem('tallyExtensionDismissedAt');
                      
                      // Force reload the page to restart detection
                      window.location.reload();
                    }}
                  >
                    Reset Detection
                  </Button>
                </div>
                <Button
                  type="button"
                  onClick={() => window.location.reload()}
                >
                  Refresh Page
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Debug dialog button */}
      <div className="fixed bottom-4 right-4 z-10">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="bg-white/80 backdrop-blur-sm opacity-70 hover:opacity-100"
          onClick={() => setShowDebugDialog(true)}
        >
          <FiHelpCircle className="w-4 h-4 mr-1" /> Extension Debug
        </Button>
      </div>
      
      {/* Debug dialog */}
      <ExtensionDebugDialog 
        isOpen={showDebugDialog} 
        setIsOpen={setShowDebugDialog} 
      />
    </>
  );
}
