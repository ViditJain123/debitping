'use client';

import { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { parseExcelFile } from '../utils/excelParser';

export default function FileUploader({ onUploadComplete }) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [previewData, setPreviewData] = useState([]);
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
    setError(null);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length) {
      handleFiles(droppedFiles[0]);
    }
  };

  const handleFileInput = (e) => {
    setError(null);
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
    setIsUploading(true);
    setUploadProgress(0);
    setResult(null);
    
    try {
      // Preview the data
      const dealers = await parseExcelFile(selectedFile);
      setPreviewData(dealers.slice(0, 5)); // Preview first 5 rows
      
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
      }, 150);
    } catch (err) {
      setError(`Error parsing file: ${err.message}`);
      setIsUploading(false);
    }
  };

  const processFile = async () => {
    if (!file) return;
    
    setIsUploading(true);
    setResult(null);
    setError(null);
    
    try {
      // Create form data to upload file
      const formData = new FormData();
      formData.append('file', file);
      
      // Upload the file to our API endpoint
      const response = await fetch('/api/excel-upload', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to process file');
      }
      
      setResult(data);
      
      // Call the callback function if provided
      if (onUploadComplete && typeof onUploadComplete === 'function') {
        onUploadComplete({
          timestamp: new Date(),
          count: data.results.created + data.results.updated,
          success: data.success
        });
      }
    } catch (err) {
      setError(err.message || 'Failed to process file');
    } finally {
      setIsUploading(false);
    }
  };

  const openFileSelector = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="w-full">
      <div 
        className={`w-full border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all h-[340px] ${
          isDragging 
            ? 'border-primary bg-primary/10 shadow-lg' 
            : file 
              ? 'border-green-500 bg-green-50/70 dark:bg-green-900/20 backdrop-blur-sm' 
              : 'border-gray-300/70 dark:border-gray-600/70 glass'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileSelector}
      >
        <div className="flex flex-col items-center justify-center h-full">
          {!file ? (
            <>
              <svg className="w-14 h-14 mb-4 text-primary/70 dark:text-primary/80" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
              </svg>
              <h3 className="text-lg font-medium mb-2 gradient-text">Drag and drop your Excel file</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                Your file should have dealer names in column A and amounts in column B (starting from row 6)
              </p>
              <div className="flex items-center justify-center space-x-2 mb-3">
                <span className="px-3 py-1 glass rounded-lg text-xs">Column A (Name)</span>
                <span className="text-gray-400 dark:text-gray-500">&rarr;</span>
                <span className="px-3 py-1 glass rounded-lg text-xs">Column B (Amount)</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Supported formats: .xlsx, .xls, .csv
              </p>
              <button className="mt-5 px-6 py-2.5 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:shadow-lg transition-all">
                Browse Files
              </button>
            </>
          ) : (
            <>
              <div className="w-14 h-14 mb-4 bg-green-100/90 dark:bg-green-900/40 rounded-full flex items-center justify-center shadow-md">
                <svg className="w-7 h-7 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2 gradient-text">
                {isUploading ? 'Analyzing File...' : 'File Ready to Process'}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{file.name}</p>
              
              {/* Preview data section */}
              {previewData.length > 0 && !isUploading && (
                <div className="w-full max-w-xs mx-auto mt-1 mb-3 text-left">
                  <p className="text-xs font-medium text-gray-500 mb-1">Preview (first 5 entries):</p>
                  <div className="max-h-28 overflow-y-auto text-xs glass rounded-lg p-3">
                    {previewData.map((dealer, index) => (
                      <div key={index} className="flex justify-between py-1">
                        <span className="font-medium">{dealer.companyName}</span>
                        <span className="text-green-600 dark:text-green-400">${dealer.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {isUploading ? (
                <div className="w-full max-w-xs mx-auto mt-3">
                  <div className="w-full bg-gray-200/70 dark:bg-gray-700/70 rounded-full h-2.5">
                    <div 
                      className="bg-gradient-to-r from-primary to-secondary h-2.5 rounded-full" 
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 text-right">{uploadProgress}%</p>
                </div>
              ) : (
                <button 
                  className="mt-3 px-6 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:shadow-lg transition-all"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Process the file
                    processFile();
                  }}
                >
                  Save to Database
                </button>
              )}
              <button 
                className="mt-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                  setUploadProgress(0);
                  setPreviewData([]);
                  setError(null);
                  setResult(null);
                }}
              >
                Upload a different file
              </button>
            </>
          )}&#125;
        </div>
        <input 
          type="file" 
          className="hidden" 
          accept=".xlsx,.xls,.csv" 
          ref={fileInputRef}
          onChange={handleFileInput}
        />
      </div>
      
      {error && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 rounded-lg text-red-700 dark:text-red-400">
          <p className="flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            {error}
          </p>
        </div>
      )}
      
      {result && (
        <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/40 rounded-lg">
          <div className="flex items-center mb-2 text-green-700 dark:text-green-400">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <h4 className="font-medium">Success!</h4>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{result.message}</p>
          {result.results && (
            <div className="mt-2 text-sm">
              <p>
                <span className="font-medium">Created:</span> {result.results.created} dealers
              </p>
              <p>
                <span className="font-medium">Updated:</span> {result.results.updated} dealers
              </p>
              {result.results.failed > 0 && (
                <p className="text-yellow-600 dark:text-yellow-500">
                  <span className="font-medium">Failed:</span> {result.results.failed} dealers
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
