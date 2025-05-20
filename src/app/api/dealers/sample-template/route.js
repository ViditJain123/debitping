// API endpoint to generate a sample dealer Excel file template
import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

export async function GET() {
  try {
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
    
    // Style the worksheet
    if (!worksheet['!cols']) worksheet['!cols'] = [];
    worksheet['!cols'][0] = { wch: 28 }; // Column A width - Dealer Name
    worksheet['!cols'][1] = { wch: 22 }; // Column B width - Phone Number
    worksheet['!cols'][2] = { wch: 20 }; // Column C width - Total Amount
    worksheet['!cols'][3] = { wch: 20 }; // Column D width - Bill Number
    worksheet['!cols'][4] = { wch: 15 }; // Column E width - Bill Date
    worksheet['!cols'][5] = { wch: 20 }; // Column F width - Bill Amount
    
    // Write the workbook to a buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
    // Create the HTTP response with the Excel file
    const response = new NextResponse(buffer);
    
    // Set the appropriate headers
    response.headers.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    response.headers.set('Content-Disposition', 'attachment; filename="dealer_import_template.xlsx"');
    
    return response;
  } catch (error) {
    console.error('Error generating dealer import template:', error);
    return NextResponse.json(
      { error: 'Failed to generate template file' },
      { status: 500 }
    );
  }
}
