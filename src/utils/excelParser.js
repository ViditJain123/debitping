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
        // We're looking for columns A (name) and B (amount)
        const dealers = [];
        
        // Start from row 6 (index 5)
        for (let i = 5; i < jsonData.length; i++) {
          const row = jsonData[i];
          
          // Skip if either name or amount is missing
          if (!row.A || !row.B) continue;
          
          // Parse the amount as a number
          const amount = parseFloat(row.B);
          
          // Skip if amount is not a valid number
          if (isNaN(amount)) continue;
          
          dealers.push({
            companyName: row.A.toString().trim(),
            amount: amount
          });
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
