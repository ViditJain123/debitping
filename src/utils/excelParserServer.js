// Server-side Excel parsing utilities
import * as XLSX from 'xlsx';

/**
 * Parses Excel data from a buffer and extracts dealer information
 * Looks for dealer names in column A and amounts in column B starting from row 6
 * 
 * @param {Buffer} buffer - The Excel file buffer
 * @returns {Array} - Array of objects with dealer information
 */
export function parseExcelBuffer(buffer) {
  try {
    // Read the Excel file
    const workbook = XLSX.read(buffer, { type: 'array' });
    
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
    
    return dealers;
  } catch (error) {
    console.error('Error parsing Excel buffer:', error);
    throw new Error(`Failed to parse Excel file: ${error.message}`);
  }
}

/**
 * Generates a sample Excel file with the required structure
 * @returns {Buffer} - The Excel file as a buffer
 */
export function generateSampleExcelFile() {
  // Create a new workbook
  const workbook = XLSX.utils.book_new();
  
  // Sample data with header row and example dealers
  const sampleData = [
    ['Company', 'Instructions'],
    ['', 'Please keep this header information.'],
    ['', 'Data should start from row 6 (after these instructions).'],
    ['', ''],
    ['Dealer Name', 'Amount'],
    ['ABC Enterprises', 5000],
    ['XYZ Corporation', 7500],
    ['Sample Company', 3200],
    ['Test Business', 10500],
  ];
  
  // Create a worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(sampleData);
  
  // Add the worksheet to the workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Dealers');
  
  // Style the worksheet (bold header, etc.)
  if (!worksheet['!cols']) worksheet['!cols'] = [];
  worksheet['!cols'][0] = { wch: 20 }; // Column A width
  worksheet['!cols'][1] = { wch: 12 }; // Column B width
  
  // Write the workbook to a buffer
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  
  return buffer;
}
