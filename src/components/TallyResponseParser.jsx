'use client';

import { useState } from 'react';
import tallyParser from '@/utils/tally-parser';

export default function TallyResponseParser() {
  const [companyInfo, setCompanyInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const parseResponse = (xmlString) => {
    setIsLoading(true);
    setError('');
    
    try {
      const info = tallyParser.extractCompanyInfo(xmlString);
      setCompanyInfo(info);
    } catch (err) {
      console.error('Error parsing XML:', err);
      setError(err.message || 'Failed to parse Tally response');
    } finally {
      setIsLoading(false);
    }
  };

  // This would handle the XML response from your Tally API
  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const xmlResponse = formData.get('xmlResponse');
    
    if (!xmlResponse) {
      setError('Please enter a Tally XML response');
      return;
    }
    
    parseResponse(xmlResponse);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-semibold mb-4">Tally XML Response Parser</h2>
      
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="mb-4">
          <label htmlFor="xmlResponse" className="block text-sm font-medium mb-1">
            Paste Tally XML Response
          </label>
          <textarea
            id="xmlResponse"
            name="xmlResponse"
            rows={10}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="<ENVELOPE>...</ENVELOPE>"
          ></textarea>
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isLoading ? 'Processing...' : 'Parse Response'}
        </button>
      </form>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded text-red-700 dark:text-red-300">
          {error}
        </div>
      )}
      
      {companyInfo && (
        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-900">
          <h3 className="text-lg font-semibold mb-2">Company Information</h3>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
            <dt className="text-gray-600 dark:text-gray-400">Company Name:</dt>
            <dd className="font-medium">{companyInfo.name}</dd>
            
            {companyInfo.startDate && (
              <>
                <dt className="text-gray-600 dark:text-gray-400">Financial Year Start:</dt>
                <dd className="font-medium">{companyInfo.startDate}</dd>
              </>
            )}
          </dl>
        </div>
      )}
    </div>
  );
}
