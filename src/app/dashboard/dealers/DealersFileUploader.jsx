'use client';

import { useState, useRef } from 'react';
import { FiUploadCloud, FiFileText, FiAlertCircle } from 'react-icons/fi';

export default function DealersFileUploader({ onImport }) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
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

  const handleFiles = (selectedFile) => {
    // Check if file is Excel or CSV
    const validTypes = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv'];
    if (!validTypes.includes(selectedFile.type)) {
      setError('Please upload an Excel (.xlsx, .xls) or CSV file.');
      return;
    }

    setFile(selectedFile);
    processFile(selectedFile);
  };

  const processFile = (file) => {
    setIsUploading(true);
    setUploadProgress(0);
    
    // Simulate upload and processing progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          
          // In a real app, this would parse the Excel file
          // For now, we'll simulate with mock data
          const mockImportedDealers = [
            { name: 'Excel Import Ltd.', email: 'info@excelimport.com', phone: '+1 (555) 111-2233', outstandingAmount: 7800 },
            { name: 'Sheet Dealers Co.', email: 'contact@sheetdealers.com', phone: '+1 (555) 444-5566', outstandingAmount: 3200 },
          ];
          
          onImport(mockImportedDealers);
          return 100;
        }
        return prev + 5;
      });
    }, 100);
  };

  const openFileSelector = () => {
    fileInputRef.current.click();
  };

  return (
    <div>
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
                Your file should have columns for name, email, phone, and outstanding amount
              </p>
              <div className="flex flex-wrap justify-center gap-2 mb-3">
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs">
                  Dealer Name
                </span>
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs">
                  Email
                </span>
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs">
                  Phone
                </span>
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs">
                  Amount
                </span>
              </div>
              <button className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-dark transition-colors">
                Select File
              </button>
            </>
          ) : (
            <>
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
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Dealers have been imported successfully
                  </p>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                    }}
                    className="mt-3 px-4 py-2 text-sm font-medium text-primary border border-primary rounded-md hover:bg-primary/10 transition-colors"
                  >
                    Upload Another File
                  </button>
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
  );
}
