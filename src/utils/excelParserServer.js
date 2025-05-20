// Server-side Excel parsing utilities
import * as XLSX from 'xlsx';

/**
 * Parses Excel data from a buffer and extracts dealer information
 * Looks for dealer data in columns A-F, supporting dealer names, phone numbers, 
 * outstanding amounts, and bill information
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
    
    // Extract dealer data with bill information
    const dealers = [];
    const dealerMap = new Map(); // Map to group dealers by name and phone
    
    // Process all rows, skipping headers
    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i];
      
      // Skip if name is missing or if this looks like a header row
      if (!row.A || row.A === 'Dealer Name' || row.A === 'Instructions') continue;
      
      // Get dealer name and phone
      const name = row.A.toString().trim();
      const phone = row.B ? row.B.toString().trim() : '';
      
      // Skip if missing required fields
      if (!name || !phone) continue;
      
      // Clean amount string if it has rupee symbol or formatting
      const totalAmount = row.C ? (typeof row.C === 'string' ? 
        parseFloat(row.C.replace(/[₹,\s]/g, '')) || 0 : 
        parseFloat(row.C) || 0) : 0;
      
      // Process bill data if available
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
      
      // Create unique key for dealer
      const dealerKey = `${name.toLowerCase()}:::${phone}`;
      
      // Get or create dealer in map
      if (!dealerMap.has(dealerKey)) {
        dealerMap.set(dealerKey, {
          companyName: name,
          phoneNumber: phone,
          amount: totalAmount,
          outstandingBills: []
        });
      }
      
      // Add bill if details available
      if (billNumber && billDate && billAmount > 0) {
        dealerMap.get(dealerKey).outstandingBills.push({
          billNumber,
          billDate,
          billAmount
        });
      }
    }
    
    // Convert map to array
    for (const dealer of dealerMap.values()) {
      dealers.push(dealer);
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
    ['Instructions'],
    ['Use this template to import dealers into the system.'],
    ['Column A: Dealer Name (required)'],
    ['Column B: Phone Number (required)'],
    ['Column C: Outstanding Amount in Rupees (₹) (optional - will be calculated from bill amounts if not provided)'],
    ['Column D: Bill Number (required for each bill, e.g., INV-2023-001)'],
    ['Column E: Bill Date (DD/MM/YYYY format, required for each bill)'],
    ['Column F: Bill Amount (₹) (required for each bill)'],
    ['Note: You can add multiple bills per dealer by repeating rows with the same dealer name and phone number'],
    [''],
    ['Dealer Name', 'Phone Number', 'Total Amount (Rs)', 'Bill Number', 'Bill Date', 'Bill Amount (Rs)'],
    ['Example Dealer 1', '+1 (555) 123-4567', '₹5,000.00', 'INV-2023-001', '01/05/2023', '₹2,000.00'],
    ['Example Dealer 1', '+1 (555) 123-4567', '', 'INV-2023-002', '15/05/2023', '₹3,000.00'],
    ['Example Dealer 2', '+1 (555) 987-6543', '₹3,750.50', 'INV-2023-003', '10/06/2023', '₹3,750.50'],
    ['Example Dealer 3', '+1 (555) 234-5678', '₹10,000.00', '', '', ''],
    ['Example Without Bills', '+1 (555) 876-5432', '₹8,500.00', '', '', ''],
  ];
  
  // Create a worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(sampleData);
  
  // Add the worksheet to the workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Dealers');
  
  // Style the worksheet (bold header, etc.)
  if (!worksheet['!cols']) worksheet['!cols'] = [];
  worksheet['!cols'][0] = { wch: 28 }; // Column A width - Dealer Name
  worksheet['!cols'][1] = { wch: 22 }; // Column B width - Phone Number
  worksheet['!cols'][2] = { wch: 20 }; // Column C width - Total Amount
  worksheet['!cols'][3] = { wch: 20 }; // Column D width - Bill Number
  worksheet['!cols'][4] = { wch: 15 }; // Column E width - Bill Date
  worksheet['!cols'][5] = { wch: 20 }; // Column F width - Bill Amount
  
  // Write the workbook to a buffer
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  
  return buffer;
}
