// src/components/TallyIntegration.jsx – front‑end only
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { FiRefreshCw, FiCheck, FiAlertTriangle, FiX, FiLoader } from 'react-icons/fi';

/**
 * Parse Tally XML response and extract company information
 * Helper function defined inline to avoid import issues
 */
function parseTallyCompanyResponse(xmlResponse) {
  try {
    // Function to parse XML (simplified version)
    const parseBasicXML = (xmlString) => {
      // Basic extraction for company info
      const companyMatch = xmlString.match(/<COMPANY\s+NAME="([^"]+)"/);
      const startDateMatch = xmlString.match(/<STARTINGFROM[^>]*>(\d{8})<\/STARTINGFROM>/);
      
      const companyName = companyMatch ? companyMatch[1] : 'Unknown Company';
      let startDate = null;
      
      if (startDateMatch) {
        const dateStr = startDateMatch[1];
        const year = dateStr.substring(0, 4);
        const month = dateStr.substring(4, 6);
        const day = dateStr.substring(6, 8);
        
        const date = new Date(`${year}-${month}-${day}`);
        startDate = date.toLocaleDateString();
      }
      
      return {
        companyName,
        financialYearStart: startDate
      };
    };
    
    // Parse the XML
    const result = parseBasicXML(xmlResponse);
    
    // Log the result for debugging
    console.log('Parsed Tally company information:', result);
    
    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error('Error parsing Tally company response:', error);
    return {
      success: false,
      error: error.message || 'Failed to parse Tally response'
    };
  }
}

/**
 * Component that checks a backend `/api/tally/check` endpoint, lists companies,
 * and triggers a `/api/tally/sync` POST for the selected company.
 */
export default function TallyIntegration({ onSyncComplete }) {
  /* --------------------------- state --------------------------- */
  const [isTallyAvailable, setIsTallyAvailable] = useState(false);
  const [isChecking,       setIsChecking]       = useState(false);
  const [isSyncing,        setIsSyncing]        = useState(false);
  const [companies,        setCompanies]        = useState([]);
  const [selectedCompany,  setSelectedCompany]  = useState('');
  const [error,            setError]            = useState('');
  const [lastSync,         setLastSync]         = useState(null);

  /* ---------------------- helpers ------------------------------ */  const fetchStatus = useCallback(async () => {
    try {
      setIsChecking(true); setError('');
      const res = await fetch('/api/tally/check');
      
      // Check if response is JSON
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        // Try to get the raw text for better error diagnosis
        const rawText = await res.text();
        console.error('Non-JSON response received:', rawText.substring(0, 200) + '...');
        
        // If the response looks like Tally XML, try to parse it directly
        if (rawText.includes('<ENVELOPE>') && rawText.includes('<COMPANY')) {
          try {
            const parsedResult = parseTallyCompanyResponse(rawText);
            if (parsedResult.success && parsedResult.data) {
              setIsTallyAvailable(true);
              const company = {
                NAME: parsedResult.data.companyName,
                STARTINGFROM: parsedResult.data.financialYearStart ? 
                  parsedResult.data.financialYearStart.replace(/\//g, '') : null
              };
              setCompanies([company]);
              setSelectedCompany(company.NAME);
              return;
            }
          } catch (parseError) {
            console.error('Failed to parse direct XML response:', parseError);
          }
        }
        
        throw new Error('Server returned a non-JSON response. The API endpoint might be unavailable or misconfigured.');
      }
      
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to check Tally');

      setIsTallyAvailable(json.available);
      
      // Ensure companies is an array of objects with NAME property
      let companiesList = [];
      if (json.companies) {
        // Convert to array if it's not already
        const companiesArray = Array.isArray(json.companies) ? json.companies : [json.companies];
        
        // Filter out any invalid entries and ensure each has a NAME property
        companiesList = companiesArray
          .filter(company => company && typeof company === 'object')
          .map(company => {
            // Ensure NAME is a string
            return { ...company, NAME: typeof company.NAME === 'string' ? company.NAME : String(company.NAME || '') };
          });
      }
      
      setCompanies(companiesList);
      if (companiesList.length && !selectedCompany) {
        setSelectedCompany(companiesList[0].NAME);
      }
    } catch (e) {
      setError(e.message);
      setIsTallyAvailable(false);
    } finally { 
      setIsChecking(false); 
    }
  }, [selectedCompany]);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  const syncDealers = async () => {
    try {
      setIsSyncing(true); setError('');
      const res  = await fetch('/api/tally/sync', {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({ companyName: selectedCompany })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Sync failed');
      setLastSync(json);
      onSyncComplete?.(json);
    } catch (e) { setError(e.message); }
    finally { setIsSyncing(false); }
  };

  /* ---------------------- render ------------------------------- */
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-100 dark:border-gray-700">
      <h3 className="text-lg font-semibold mb-3">Tally Integration</h3>

      {/* status */}
      <div className="mb-4">
        <div className="flex items-center mb-2">
          <span className="mr-2">Tally Status:</span>
          {isChecking ? (
            <span className="flex items-center text-blue-500"><FiLoader className="animate-spin mr-1"/>Checking…</span>
          ) : isTallyAvailable ? (
            <span className="flex items-center text-green-500"><FiCheck className="mr-1"/>Connected</span>
          ) : (
            <span className="flex items-center text-red-500"><FiX className="mr-1"/>Not Connected</span>
          )}
          <button onClick={fetchStatus} disabled={isChecking} className="ml-2 p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300" title="Refresh status">
            <FiRefreshCw className={isChecking ? 'animate-spin' : ''}/>
          </button>
        </div>        {!isTallyAvailable && !isChecking && (
          <div className="text-sm text-red-500 mb-2">
            <div className="flex items-center"><FiAlertTriangle className="mr-1"/>Tally unreachable.</div>
            <p className="mb-1">Please ensure:</p>
            <ul className="list-disc pl-8 mt-1">
              <li>Tally is running with XML/HTTP enabled (port 9000)</li>
              <li>CORS Bridge browser extension is active</li>
              <li>No firewalls are blocking connections to Tally</li>
              <li>Your Tally version supports XML/HTTP interface</li>
            </ul>
            <p className="mt-2 text-xs border-t border-red-200 pt-1">
              <strong>Troubleshooting:</strong> If you're seeing "Unexpected token" errors, try reinstalling the CORS Bridge extension or restarting your browser.
            </p>
          </div>
        )}
      </div>

      {/* company + sync */}
      {isTallyAvailable && (
        <>          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Tally Company</label>            
            <select value={selectedCompany} onChange={e => setSelectedCompany(e.target.value)} disabled={isSyncing} className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white">
              {companies.length ? companies.map((c,i) => {
                // Ensure we have a valid NAME string to avoid React rendering issues
                const name = typeof c.NAME === 'string' ? c.NAME : String(c.NAME || `Company ${i+1}`);
                // Format the starting date if available
                const startDate = c.STARTINGFROM ? new Date(
                  c.STARTINGFROM.substring(0, 4),
                  parseInt(c.STARTINGFROM.substring(4, 6)) - 1,
                  c.STARTINGFROM.substring(6, 8)
                ).toLocaleDateString() : '';
                
                return <option key={i} value={name}>{name}{startDate ? ` (From: ${startDate})` : ''}</option>;
              }) : <option>No companies found</option>}
            </select>
            
            {/* Company details */}
            {selectedCompany && companies.length > 0 && (
              <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-md">
                {companies.find(c => c.NAME === selectedCompany) && (
                  <div className="text-sm">
                    <p className="font-medium">{selectedCompany}</p>
                    {(() => {
                      const company = companies.find(c => c.NAME === selectedCompany);
                      if (company && company.STARTINGFROM) {
                        const startDate = new Date(
                          company.STARTINGFROM.substring(0, 4),
                          parseInt(company.STARTINGFROM.substring(4, 6)) - 1,
                          company.STARTINGFROM.substring(6, 8)
                        );
                        return <p className="text-gray-600 dark:text-gray-300">Financial Year Start: {startDate.toLocaleDateString()}</p>
                      }
                      return null;
                    })()}
                  </div>
                )}
              </div>
            )}
          </div>
          <button disabled={isSyncing || !selectedCompany} onClick={syncDealers} className={`w-full flex items-center justify-center px-4 py-2 rounded-md text-white ${isSyncing ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}>
            {isSyncing ? <><FiLoader className="animate-spin mr-2"/>Syncing…</> : <><FiRefreshCw className="mr-2"/>Sync Dealers</>}
          </button>
        </>
      )}      {/* error */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md text-sm">
          <div className="flex items-center mb-2">
            <FiAlertTriangle className="mr-1 flex-shrink-0" />
            <span className="font-medium">Error:</span>
          </div>
          <p className="whitespace-pre-wrap break-words">{error}</p>
          
          {error.includes('non-JSON') && (
            <div className="mt-2 pt-2 border-t border-red-200 dark:border-red-700">
              <p className="font-medium mb-1">Troubleshooting steps:</p>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Make sure your Next.js API routes are properly configured</li>
                <li>Check if there are server-side errors in the console</li>
                <li>Verify the API endpoint is correct and accessible</li>
                <li>Try refreshing the page and clearing your browser cache</li>
              </ol>
            </div>
          )}
          
          {error.includes('Unexpected token') && (
            <div className="mt-2 pt-2 border-t border-red-200 dark:border-red-700">
              <p className="font-medium mb-1">JSON parse error:</p>
              <p>The API returned data that couldn't be parsed as JSON. This usually indicates that:</p>
              <ol className="list-decimal pl-5 space-y-1">
                <li>The server returned HTML instead of JSON (possibly a 404 or 500 error page)</li>
                <li>The CORS Bridge extension might not be properly forwarding the response</li>
                <li>Tally might be returning malformed data</li>
              </ol>
            </div>
          )}
        </div>
      )}

      {/* last sync */}
      {lastSync && (
        <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-md text-sm">
          <div className="flex items-center mb-1"><FiCheck className="mr-1"/><span className="font-medium">Sync Completed</span></div>
          <p>{lastSync.message || `${lastSync.dealersCount} dealers synced.`}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{new Date(lastSync.timestamp).toLocaleString()}</p>
        </div>
      )}
    </div>
  );
}
