'use client';

import FileUploader from '../../components/FileUploader';
import { useState } from 'react';
import Link from 'next/link';

export default function FileUploaderWrapper() {
  const [lastUpload, setLastUpload] = useState(null);
  
  return (
    <div>
      <div className="mb-4">
        <div className="flex justify-between items-center">
          <h3 className="text-base font-medium text-gray-700 dark:text-gray-200">
            Upload Excel Data
          </h3>
          <Link 
            href="/api/sample-excel" 
            className="text-sm text-primary hover:text-primary-dark flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            Download Template
          </Link>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Upload an Excel file with dealer names in column A, phone numbers in column B, outstanding amounts in rupees (₹) in column C, and bill details (number, date, amount) in columns D, E, and F
        </p>
      </div>
      
      <FileUploader onUploadComplete={setLastUpload} />
      
      {lastUpload && (
        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded border border-gray-100 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-300">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div>
              <p>Last upload: {new Date(lastUpload.timestamp).toLocaleString()}</p>
              <p>Dealers processed: {lastUpload.count}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
