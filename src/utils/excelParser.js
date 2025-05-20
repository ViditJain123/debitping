'use client';

import * as XLSX from 'xlsx';

/**
 * Parses Excel or CSV file and extracts dealer names and amounts
 * Specifically targets column A for dealer names and column B for amounts,
 * starting from row 6
 * 
 * @param {File} file - The Excel file to parse
 * @returns {Promise<Array>} - Array of objects with name and amount
 */
export async function parseExcelFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get the first sheet
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert the sheet to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 'A' });
        
        // Extract dealer data starting from row 6 (index 5 in zero-based array)
        const dealers = [];
        
        // Start from row 6 (index 5)
        for (let i = 5; i < jsonData.length; i++) {
          const row = jsonData[i];
          
          // Skip if name or phone is missing
          if (!row.A || !row.B) continue;
          
          // Get dealer name and phone
          const name = row.A.toString().trim();
          const phone = row.B.toString().trim();
          
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
          
          // Process bill details if available
          const billNumber = row.D ? row.D.toString().trim() : '';
          let billDate = null;
          
          // Process bill date - convert from DD/MM/YYYY format
          if (row.E) {
            try {
              // Check if it's already a date object
              if (row.E instanceof Date) {
                billDate = row.E;
              } else {
                // Parse string date in DD/MM/YYYY format
                const parts = row.E.toString().split('/');
                if (parts.length === 3) {
                  // Note: Month is 0-indexed in JavaScript Date
                  billDate = new Date(parts[2], parts[1] - 1, parts[0]);
                }
              }
            } catch (error) {
              console.error(`Error parsing date ${row.E}:`, error);
            }
          }
          
          // Process bill amount
          const billAmount = row.F ? (typeof row.F === 'string' ? 
            parseFloat(row.F.replace(/[₹,\s]/g, '')) || 0 : 
            parseFloat(row.F) || 0) : 0;
          
          // Create dealer object with bill information
          const dealer = {
            companyName: name,
            phoneNumber: phone,
            amount: amount,
            outstandingBills: []
          };
          
          // Add bill if details available
          if (billNumber && billDate && billAmount > 0) {
            dealer.outstandingBills.push({
              billNumber,
              billDate,
              billAmount
            });
          }
          
          dealers.push(dealer);
        }
        
        resolve(dealers);
      } catch (error) {
        reject(new Error(`Failed to parse Excel file: ${error.message}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading the Excel file'));
    };
    
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Validates the Excel file structure to ensure it has the required columns
 * in the expected format starting from row 6
 * 
 * @param {File} file - The Excel file to validate
 * @returns {Promise<{isValid: boolean, message: string}>} - Validation result
 */
export async function validateExcelStructure(file) {
  try {
    const dealers = await parseExcelFile(file);
    
    if (!dealers || dealers.length === 0) {
      return {
        isValid: false,
        message: 'No valid data found in the Excel file. Please ensure your file has dealer names in column A and amounts in column B starting from row 6.'
      };
    }
    
    // Check if any dealer is missing a name or has an invalid amount
    const invalidEntries = dealers.filter(dealer => 
      !dealer.companyName || 
      dealer.companyName.trim() === '' || 
      isNaN(dealer.amount)
    );
    
    if (invalidEntries.length > 0) {
      return {
        isValid: false,
        message: `Found ${invalidEntries.length} invalid entries in your Excel file. Please check your data format.`
      };
    }
    
    return {
      isValid: true,
      message: `Successfully validated ${dealers.length} dealer entries.`,
      dealerCount: dealers.length
    };
    
  } catch (error) {
    return {
      isValid: false,
      message: `Error validating Excel file: ${error.message}`
    };
  }
}
