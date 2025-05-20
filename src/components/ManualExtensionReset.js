"use client";

import { Button } from './ui/button';
import { useState } from 'react';
import { FiRefreshCw } from 'react-icons/fi';

export default function ManualExtensionReset() {
  const [resetting, setResetting] = useState(false);
  const [message, setMessage] = useState('');

  const handleReset = () => {
    setResetting(true);
    setMessage('Resetting extension detection...');

    // Clear all extension-related localStorage flags
    localStorage.removeItem('tallyExtensionMissing');
    localStorage.removeItem('tallyExtensionRecentlyInstalled');
    localStorage.removeItem('tallyExtensionDismissedAt');
    
    // Set a flag indicating a manual reset
    localStorage.setItem('tallyExtensionManualReset', Date.now().toString());
    
    // Force window.__tallyExtensionDetected to true (try to overcome detection issues)
    if (typeof window !== 'undefined') {
      window.__tallyExtensionDetected = true;
      
      // Create and dispatch an event to try to trigger detection
      try {
        const event = new CustomEvent('tallyExtensionReady', {
          detail: {
            timestamp: new Date().toISOString(),
            extensionId: 'manual-reset'
          }
        });
        window.dispatchEvent(event);
        document.dispatchEvent(event);
      } catch (e) {
        console.error('Error dispatching extension event:', e);
      }
    }
    
    // Show success message
    setMessage('Reset complete. Reloading page in 2 seconds...');
    
    // Reload the page after a short delay
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  };

  return (
    <div className="fixed bottom-16 right-4 z-10">
      <Button
        onClick={handleReset}
        disabled={resetting}
        variant="outline"
        size="sm"
        className="bg-white/80 backdrop-blur-sm opacity-70 hover:opacity-100"
      >
        <FiRefreshCw className={`w-4 h-4 mr-1 ${resetting ? 'animate-spin' : ''}`} />
        {resetting ? 'Resetting...' : 'Reset Extension Detection'}
      </Button>
      
      {message && (
        <div className="fixed bottom-28 right-4 z-10 bg-black/80 text-white p-2 rounded-md text-sm max-w-[250px]">
          {message}
        </div>
      )}
    </div>
  );
}
