// Next.js API route for uploading and processing Excel files
import { NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import * as XLSX from 'xlsx';
import { createDealer, getDealersByDistributor, updateDealer } from '../../../utils/dealer';
import { connectToDatabase } from '../../../utils/db';
import { processFormData, getFileBuffer, errorResponse, successResponse } from '../../../utils/api-helpers';

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
    
    // Extract dealer data starting from row 6 (index 5 in zero-based array)
    const dealersData = [];
    
    // Start from row 6 (index 5)
    for (let i = 5; i < jsonData.length; i++) {
      const row = jsonData[i];
      
      // Skip if either name or amount is missing
      if (!row.A || !row.B) continue;
      
      // Parse the amount as a number
      const amount = parseFloat(row.B);
      
      // Skip if amount is not a valid number
      if (isNaN(amount)) continue;
      
      dealersData.push({
        companyName: row.A.toString().trim(),
        amount: amount
      });
    }
    
    if (!dealersData || dealersData.length === 0) {
      return errorResponse('No valid data found in the Excel file. Make sure you have dealer names in column A and amounts in column B starting from row 6.');
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
        
        let dealer;
        
        // If dealer exists, update the amount
        if (existingDealer) {
          dealer = await updateDealer(
            existingDealer._id,
            { amount: dealerData.amount },
            userId
          );
          results.updated++;
        } 
        // Otherwise create a new dealer
        else {
          // Generate a random phone number for new dealers
          // In production, you'd want to handle this differently or prompt for this information
          const phoneNumber = `+1${Math.floor(1000000000 + Math.random() * 9000000000)}`;
          
          dealer = await createDealer(
            { 
              companyName: dealerData.companyName, 
              phoneNumber: phoneNumber, 
              amount: dealerData.amount 
            }, 
            userId
          );
          results.created++;
        }
        
        results.dealers.push({
          id: dealer._id,
          name: dealer.companyName,
          amount: dealer.amount,
          isNew: !existingDealer
        });
      } catch (error) {
        console.error(`Error processing dealer ${dealerData.companyName}:`, error);
        results.failed++;
      }
    }
    
    return successResponse({ 
      success: true,
      message: `Processed ${dealersData.length} dealers: ${results.created} created, ${results.updated} updated, ${results.failed} failed`,
      results
    });
  } catch (error) {
    console.error('Error processing Excel upload:', error);
    return errorResponse(error.message || 'Failed to process uploaded file', 500);
  }
}
