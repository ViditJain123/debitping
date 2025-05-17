'use client';

import { useState, useRef } from 'react';
import { FiUploadCloud, FiFileText, FiAlertCircle, FiX, FiDownload } from 'react-icons/fi';
import * as XLSX from 'xlsx';

export default function DealersFileUploader({ onImport, onClose }) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [previewData, setPreviewData] = useState([]);
  const [importResult, setImportResult] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setError('');

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length) {
      handleFiles(droppedFiles[0]);
    }
  };

  const handleFileInput = (e) => {
    setError('');
    if (e.target.files.length) {
      handleFiles(e.target.files[0]);
    }
  };

  const handleFiles = async (selectedFile) => {
    // Check if file is Excel or CSV
    const validTypes = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv'];
    if (!validTypes.includes(selectedFile.type) && 
        !selectedFile.name.match(/\.(xlsx|xls|csv)$/i)) {
      setError('Please upload an Excel (.xlsx, .xls) or CSV file.');
      return;
    }

    setFile(selectedFile);
    setError('');
    setImportResult(null);
    previewExcelFile(selectedFile);
  };
  
  // Preview the Excel file contents
  const previewExcelFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        setIsUploading(true);
        setUploadProgress(30);
        
        // Parse the Excel data
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get the first sheet
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert the sheet to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 'A' });
        
        // Extract dealer data
        const dealers = [];
        
        for (let i = 0; i < jsonData.length; i++) {
          const row = jsonData[i];
          
          // Skip if name is missing
          if (!row.A) continue;
          
          // Get dealer name and phone
          const name = row.A.toString().trim();
          const phone = row.B ? row.B.toString().trim() : '';
          
          // Skip if missing required fields
          if (!name || !phone) continue;
          
          // Validate phone number - basic formatting check and ensure E.164 format
          let phoneClean = phone.replace(/[^\d+]/g, '');
          if (phoneClean.length < 10) {
            continue; // Skip invalid phone numbers
          }
          
          // Ensure phone number has the + prefix for E.164 format
          if (!phoneClean.startsWith('+')) {
            phoneClean = '+' + phoneClean;
          }
          
          // Process the amount field - handle different formats including rupee symbol
          let amount = 0;
          if (row.C) {
            // If it's a string, clean it up (remove rupee symbol, commas, etc.)
            if (typeof row.C === 'string') {
              const cleanAmount = row.C.replace(/[₹,\s]/g, '');
              amount = parseFloat(cleanAmount) || 0;
            } else {
              amount = parseFloat(row.C) || 0;
            }
          }
          
          dealers.push({
            companyName: name,
            phoneNumber: phoneClean, // Use the cleaned and formatted phone number with + prefix
            isValid: true,
            amount: amount
          });
        }
        
        // Update preview data and upload progress
        setPreviewData(dealers.slice(0, 5));
        setUploadProgress(100);
        setIsUploading(false);
        
      } catch (error) {
        setError(`Error parsing Excel file: ${error.message}`);
        setIsUploading(false);
      }
    };
    
    reader.onerror = () => {
      setError('Error reading the Excel file');
      setIsUploading(false);
    };
    
    reader.readAsArrayBuffer(file);
  };
  
  // Upload and process the file
  const processFile = async () => {
    if (!file) return;
    
    try {
      setIsUploading(true);
      setUploadProgress(0);
      setImportResult(null);
      setError('');
      
      // Create form data for the file upload
      const formData = new FormData();
      formData.append('file', file);
      
      // Simulate initial upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 80) {
            clearInterval(progressInterval);
            return 80;
          }
          return prev + 10;
        });
      }, 100);
      
      // Send the file to our API
      const response = await fetch('/api/dealers/import', {
        method: 'POST',
        body: formData
      });
      
      clearInterval(progressInterval);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to import dealers');
      }
      
      // Process the response
      const result = await response.json();
      setUploadProgress(100);
      setImportResult(result);
      
      // Notify the parent component
      if (onImport && typeof onImport === 'function') {
        onImport(result.results.dealers);
      }
      
      // Update preview data to show some of the imported dealers
      if (result.results && result.results.dealers && result.results.dealers.length > 0) {
        const importedDealers = result.results.dealers.map(dealer => ({
          companyName: dealer.name,
          phoneNumber: dealer.phone,
          amount: dealer.amount || 0
        }));
        setPreviewData(importedDealers.slice(0, 5));
      }
      
    } catch (error) {
      setError(error.message || 'Failed to import dealers');
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const openFileSelector = () => {
    fileInputRef.current.click();
  };

  // Function to download sample template
  const downloadTemplate = (e) => {
    e.preventDefault();
    e.stopPropagation();
    window.location.href = '/api/dealers/sample-template';
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Import Dealers from Excel
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">
          <div 
            className={`w-full border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              isDragging 
                ? 'border-primary bg-primary/5' 
                : file 
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/10' 
                  : 'border-gray-300 dark:border-gray-600'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={openFileSelector}
          >
        <div className="flex flex-col items-center justify-center py-6">
          {!file ? (
            <>
              <FiUploadCloud className="w-12 h-12 mb-3 text-gray-400 dark:text-gray-500" />
              <h3 className="text-lg font-medium mb-2 text-gray-700 dark:text-gray-200">
                Drag and drop your dealers Excel file
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                Your file should have columns for dealer name, phone number, and outstanding amount in rupees (₹)
              </p>
              <div className="flex flex-wrap justify-center gap-2 mb-3">
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs">
                  Dealer Name
                </span>
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs">
                  Phone Number
                </span>
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs opacity-60">
                  Amount (₹) (optional)
                </span>
              </div>
              <button 
                className="mt-1 flex items-center text-sm text-primary hover:text-primary-dark mx-auto"
                onClick={downloadTemplate}
              >
                <FiDownload className="mr-1" /> Download Template
              </button>
              <button className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-dark transition-colors">
                Select File
              </button>
            </>
          ) : (
            <>
              {previewData.length > 0 && !isUploading && !importResult && (
                <div className="w-full mb-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Preview ({previewData.length} dealers)
                  </h4>
                  <div className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 text-left">
                            Company Name
                          </th>
                          <th className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 text-left">
                            Phone Number
                          </th>
                          <th className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 text-right">
                            Amount
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {previewData.map((dealer, idx) => (
                          <tr key={idx}>
                            <td className="px-4 py-2 text-xs text-gray-900 dark:text-gray-100">
                              {dealer.companyName}
                            </td>
                            <td className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400">
                              {dealer.phoneNumber}
                              {!dealer.isValid && (
                                <span className="ml-2 text-xs text-red-500">(Invalid format)</span>
                              )}
                            </td>
                            <td className="px-4 py-2 text-xs text-gray-900 dark:text-gray-100 text-right">
                              ₹{dealer.amount.toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))}
                        
                        {previewData.length > 0 && importResult && (
                          <tr className="bg-gray-50 dark:bg-gray-700">
                            <td colSpan="3" className="px-4 py-2 text-xs text-gray-700 dark:text-gray-300">
                              <div className="text-center font-medium">
                                {importResult.message}
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-4 flex justify-center gap-2">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        processFile();
                      }}
                      disabled={isUploading}
                      className={`px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-dark transition-colors ${
                        isUploading ? 'opacity-70 cursor-not-allowed' : ''
                      }`}
                    >
                      {isUploading ? 'Processing...' : 'Import Dealers'}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                        setPreviewData([]);
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
              {isUploading ? (
                <div className="w-full">
                  <div className="flex items-center mb-2">
                    <FiFileText className="w-6 h-6 mr-2 text-primary" />
                    <span className="text-gray-700 dark:text-gray-200 font-medium">{file.name}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-2">
                    <div 
                      className="bg-primary h-2.5 rounded-full" 
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Processing file... {uploadProgress}%
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-3">
                    <FiUploadCloud className="w-8 h-8 text-green-500 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Upload Complete!
                  </h3>
                  
                  {importResult ? (
                    <>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                        {importResult.message}
                      </p>
                      <div className="flex flex-wrap justify-center gap-2 my-2">
                        <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs">
                          {importResult.results.created} new dealers
                        </span>
                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-xs">
                          {importResult.results.updated} updated
                        </span>
                        {importResult.results.failed > 0 && (
                          <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-xs">
                            {importResult.results.failed} failed
                          </span>
                        )}
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Dealers have been imported successfully
                    </p>
                  )}
                  
                  <div className="flex gap-2 mt-3">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onClose();
                      }}
                      className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-dark transition-colors"
                    >
                      View Dealers
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                        setImportResult(null);
                      }}
                      className="px-4 py-2 text-sm font-medium text-primary border border-primary rounded-md hover:bg-primary/10 transition-colors"
                    >
                      Upload Another
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      {error && (
        <div className="flex items-center mt-2 text-red-600 dark:text-red-400">
          <FiAlertCircle className="w-4 h-4 mr-1" />
          <span className="text-sm">{error}</span>
        </div>
      )}
      
        <input 
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileInput}
        />
        </div>
      </div>
    </div>
  );
}
