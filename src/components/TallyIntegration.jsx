// TallyIntegration.jsx - Component for managing Tally integration
'use client';

import React, { useState, useEffect } from 'react';
import { FiRefreshCw, FiCheck, FiAlertTriangle, FiX, FiLoader } from 'react-icons/fi';

export default function TallyIntegration({ onSyncComplete }) {
  const [isTallyAvailable, setIsTallyAvailable] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState(null);
  const [error, setError] = useState('');
  const [availableCompanies, setAvailableCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState('');

  // Check Tally availability when component mounts
  useEffect(() => {
    checkTallyAvailability();
  }, []);

  // Function to check if Tally is available
  const checkTallyAvailability = async () => {
    try {
      setIsChecking(true);
      setError('');
      
      const response = await fetch('/api/tally/check');
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to check Tally availability');
      }
      
      setIsTallyAvailable(result.available);
      
      // If available, get list of companies
      if (result.available) {
        // In a real implementation, you would fetch companies from Tally here
        // For now, we'll use a placeholder
        setAvailableCompanies([
          { name: 'Main Company' },
          { name: 'Sample Company' }
        ]);
        
        // Default to first company
        if (availableCompanies.length > 0 && !selectedCompany) {
          setSelectedCompany(availableCompanies[0].name);
        }
      }
    } catch (error) {
      console.error('Error checking Tally availability:', error);
      setError(error.message || 'Failed to check Tally availability');
      setIsTallyAvailable(false);
    } finally {
      setIsChecking(false);
    }
  };

  // Function to sync dealers from Tally
  const syncDealersFromTally = async () => {
    try {
      setIsSyncing(true);
      setError('');
      
      const response = await fetch('/api/tally/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          companyName: selectedCompany
        })
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to sync dealers from Tally');
      }
      
      setLastSyncResult(result);
      
      // Notify parent component about sync completion
      if (onSyncComplete && typeof onSyncComplete === 'function') {
        onSyncComplete(result);
      }
    } catch (error) {
      console.error('Error syncing dealers from Tally:', error);
      setError(error.message || 'Failed to sync dealers from Tally');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-100 dark:border-gray-700">
      <h3 className="text-lg font-semibold mb-3">Tally Integration</h3>
      
      <div className="mb-4">
        <div className="flex items-center mb-2">
          <span className="mr-2">Tally Status:</span>
          {isChecking ? (
            <div className="flex items-center text-blue-500">
              <FiLoader className="animate-spin mr-1" /> 
              Checking...
            </div>
          ) : isTallyAvailable ? (
            <div className="flex items-center text-green-500">
              <FiCheck className="mr-1" /> 
              Connected
            </div>
          ) : (
            <div className="flex items-center text-red-500">
              <FiX className="mr-1" /> 
              Not Connected
            </div>
          )}
          
          <button
            onClick={checkTallyAvailability}
            disabled={isChecking}
            className="ml-2 p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            title="Check Tally connection"
          >
            <FiRefreshCw className={isChecking ? 'animate-spin' : ''} />
          </button>
        </div>
        
        {!isTallyAvailable && !isChecking && (
          <div className="text-sm text-red-500 mb-2">
            <div className="flex items-center">
              <FiAlertTriangle className="mr-1" />
              <span>Tally is not available. Please make sure:</span>
            </div>
            <ul className="list-disc pl-8 mt-1">
              <li>Tally ERP is running</li>
              <li>Tally is configured to accept requests on port 9000</li>
              <li>The Tally CORS Bridge extension is installed and enabled</li>
            </ul>
          </div>
        )}
      </div>
      
      {isTallyAvailable && (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tally Company
            </label>
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary border-gray-300 dark:border-gray-600"
              disabled={isSyncing}
            >
              {availableCompanies.length === 0 ? (
                <option value="">No companies available</option>
              ) : (
                availableCompanies.map((company, index) => (
                  <option key={index} value={company.name}>
                    {company.name}
                  </option>
                ))
              )}
            </select>
          </div>
          
          <div className="mb-4">
            <button
              onClick={syncDealersFromTally}
              disabled={isSyncing || !selectedCompany}
              className={`px-4 py-2 rounded-md text-white flex items-center justify-center w-full ${
                isSyncing
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isSyncing ? (
                <>
                  <FiLoader className="animate-spin mr-2" />
                  Syncing Dealers...
                </>
              ) : (
                <>
                  <FiRefreshCw className="mr-2" />
                  Sync Dealers from Tally
                </>
              )}
            </button>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              This will fetch dealers and their outstanding bills from Tally.
            </p>
          </div>
        </>
      )}
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md text-sm">
          <div className="flex items-center">
            <FiAlertTriangle className="mr-1" />
            <span>Error: {error}</span>
          </div>
        </div>
      )}
      
      {lastSyncResult && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-md text-sm">
          <div className="flex items-center mb-1">
            <FiCheck className="mr-1" />
            <span className="font-medium">Sync Completed</span>
          </div>
          <p>{lastSyncResult.message}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Last sync: {new Date(lastSyncResult.timestamp).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
}
