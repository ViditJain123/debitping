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
      ['Column C: Outstanding Amount in Rupees (₹) (optional)'],
      [''],
      ['Dealer Name', 'Phone Number', 'Amount (Rs)'],
      ['Example Dealer 1', '+1 (555) 123-4567', '₹5,000.00'],
      ['Example Dealer 2', '+1 (555) 987-6543', '₹3,750.50'],
      ['Example Dealer 3', '+1 (555) 234-5678', ''],
    ];
    
    // Create a worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(sampleData);
    
    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Dealers');
    
    // Style the worksheet
    if (!worksheet['!cols']) worksheet['!cols'] = [];
    worksheet['!cols'][0] = { wch: 25 }; // Column A width
    worksheet['!cols'][1] = { wch: 20 }; // Column B width
    worksheet['!cols'][2] = { wch: 18 }; // Column C width
    
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
