'use client';

import { useState, useRef } from 'react';

export default function FileUploader() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
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

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length) {
      handleFiles(droppedFiles[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files.length) {
      handleFiles(e.target.files[0]);
    }
  };

  const handleFiles = (selectedFile) => {
    // Check if file is Excel or CSV
    const validTypes = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv'];
    if (!validTypes.includes(selectedFile.type)) {
      alert('Please upload an Excel (.xlsx, .xls) or CSV file.');
      return;
    }

    setFile(selectedFile);
    simulateUpload(selectedFile);
  };

  const simulateUpload = (file) => {
    setIsUploading(true);
    setUploadProgress(0);
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  const openFileSelector = () => {
    fileInputRef.current.click();
  };

  return (
    <div 
      className={`w-full border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors h-[340px] ${
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
      <div className="flex flex-col items-center justify-center h-full">
        {!file ? (
          <>
            <svg className="w-12 h-12 mb-3 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
            </svg>
            <h3 className="text-lg font-medium mb-2 text-gray-700 dark:text-gray-200">Drag and drop your debit Excel file</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              Your file should have the dealer names on the left and debit amounts on the right
            </p>
            <div className="flex items-center justify-center space-x-2 mb-3">
              <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs">Name</span>
              <span className="text-gray-400 dark:text-gray-500">&rarr;</span>
              <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs">Amount</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Supported formats: .xlsx, .xls, .csv
            </p>
            <button className="mt-4 px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors">
              Browse Files
            </button>
          </>
        ) : (
          <>
            <div className="w-12 h-12 mb-3 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2 text-gray-700 dark:text-gray-200">
              {isUploading ? 'Uploading...' : 'File Uploaded Successfully!'}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{file.name}</p>
            {isUploading ? (
              <div className="w-full max-w-xs mx-auto mt-3">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1 text-right">{uploadProgress}%</p>
              </div>
            ) : (
              <button 
                className="mt-3 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  // Proceed with processing the file
                  alert("Processing the uploaded file...");
                }}
              >
                Process File
              </button>
            )}
            <button 
              className="mt-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              onClick={(e) => {
                e.stopPropagation();
                setFile(null);
                setUploadProgress(0);
              }}
            >
              Upload a different file
            </button>
          </>
        )}
      </div>
      <input 
        type="file" 
        className="hidden" 
        accept=".xlsx,.xls,.csv" 
        ref={fileInputRef}
        onChange={handleFileInput}
      />
    </div>
  );
}
