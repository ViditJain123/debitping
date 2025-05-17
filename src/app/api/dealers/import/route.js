// API endpoint for importing dealers from Excel
import { NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import * as XLSX from 'xlsx';
import { createDealer, getDealersByDistributor, updateDealer } from '../../../../utils/dealer';
import { connectToDatabase } from '../../../../utils/db';
import { processFormData, getFileBuffer, errorResponse, successResponse } from '../../../../utils/api-helpers';

export async function POST(request) {
  try {
    // Get the user's Clerk ID from the auth session
    const { userId } = getAuth(request);
    
    if (!userId) {
      return errorResponse('Unauthorized', 401);
    }
    
    // Process the form data
    const formData = await processFormData(request);
    
    // Get the file from form data and convert to buffer
    const fileBuffer = await getFileBuffer(formData);
    
    // Parse the Excel file
    const workbook = XLSX.read(fileBuffer, { type: 'array' });
    
    // Get the first sheet
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    
    // Convert the sheet to JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 'A' });
    
    // Extract dealer data - looking for name in column A and phone in column B
    const dealersData = [];
    
    // Skip header rows - start from row 7 in typical template
    // But still check all rows to be flexible with different file formats
    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i];
      
      // Skip if name is missing or if this looks like a header row
      if (!row.A || row.A === 'Dealer Name' || row.A === 'Instructions') continue;
      
      // Get dealer name and phone
      const name = row.A.toString().trim();
      const phone = row.B ? row.B.toString().trim() : '';
      
      // Skip if missing required fields
      if (!name || !phone) continue;
      
      dealersData.push({
        companyName: name,
        phoneNumber: phone,
        // Amount is optional - if present in column C, use it, otherwise set to 0
        // Clean amount string if it has rupee symbol or formatting
        amount: row.C ? (typeof row.C === 'string' ? 
          parseFloat(row.C.replace(/[₹,\s]/g, '')) || 0 : 
          parseFloat(row.C) || 0) : 0
      });
    }
    
    if (!dealersData || dealersData.length === 0) {
      return errorResponse('No valid data found in the Excel file. Make sure you have dealer names in column A and phone numbers in column B.');
    }
    
    // Connect to the database
    await connectToDatabase();
    
    // Get existing dealers for this distributor
    const existingDealers = await getDealersByDistributor(userId);
    
    // Track success and failures
    const results = {
      created: 0,
      updated: 0,
      failed: 0,
      dealers: []
    };
    
    // Process each dealer from the Excel file
    for (const dealerData of dealersData) {
      try {
        // Check if dealer with this name already exists for this distributor
        const existingDealer = existingDealers.find(
          dealer => dealer.companyName.toLowerCase() === dealerData.companyName.toLowerCase()
        );
        
        // If dealer exists, update phone if needed
        if (existingDealer) {
          // Only update if phone changed
          if (existingDealer.phoneNumber !== dealerData.phoneNumber) {
            await updateDealer(
              existingDealer._id,
              { phoneNumber: dealerData.phoneNumber },
              userId
            );
            results.updated++;
          } else {
            // Just count as updated even if nothing changed
            results.updated++;
          }
          
          results.dealers.push({
            id: existingDealer._id,
            name: existingDealer.companyName,
            phone: existingDealer.phoneNumber,
            amount: existingDealer.amount,
            isNew: false
          });
          continue;
        }
        
        // Create a new dealer - use amount if provided, otherwise 0
        const dealer = await createDealer(
          { 
            companyName: dealerData.companyName, 
            phoneNumber: dealerData.phoneNumber, 
            amount: dealerData.amount || 0
          }, 
          userId
        );
        
        results.created++;
        results.dealers.push({
          id: dealer._id,
          name: dealer.companyName,
          phone: dealer.phoneNumber,
          amount: dealer.amount,
          isNew: true
        });
      } catch (error) {
        console.error(`Error processing dealer ${dealerData.companyName}:`, error);
        results.failed++;
      }
    }
    
    // Create a more detailed success message
    let successMessage = `Processed ${dealersData.length} dealers: ${results.created} imported as new, ${results.updated} already existed`;
    if (results.failed > 0) {
      successMessage += `, ${results.failed} failed`;
    }
    
    return successResponse({ 
      success: true,
      message: successMessage,
      results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error processing dealer import:', error);
    return errorResponse(error.message || 'Failed to process uploaded file', 500);
  }
}
