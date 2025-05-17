// API endpoint to generate a sample Excel file
import { NextResponse } from 'next/server';
import { generateSampleExcelFile } from '../../../utils/excelParserServer';

export async function GET() {
  try {
    // Generate the sample Excel file
    const buffer = generateSampleExcelFile();
    
    // Create the HTTP response with the Excel file
    const response = new NextResponse(buffer);
    
    // Set the appropriate headers
    response.headers.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    response.headers.set('Content-Disposition', 'attachment; filename="dealer_template.xlsx"');
    
    return response;
  } catch (error) {
    console.error('Error generating sample Excel file:', error);
    return NextResponse.json(
      { error: 'Failed to generate sample Excel file' },
      { status: 500 }
    );
  }
}
