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
    const dealerMap = new Map(); // Map to group dealers by name and phone
    
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
      dealersData.push(dealer);
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
        
        // If dealer exists, update as needed
        if (existingDealer) {
          // Prepare update data
          const updateData = {};
          
          // Update phone if changed
          if (existingDealer.phoneNumber !== dealerData.phoneNumber) {
            updateData.phoneNumber = dealerData.phoneNumber;
          }
          
          // Update amount if provided
          if (dealerData.amount && existingDealer.amount !== dealerData.amount) {
            updateData.amount = dealerData.amount;
          }
          
          // Update outstanding bills if provided
          if (dealerData.outstandingBills && dealerData.outstandingBills.length > 0) {
            // Merge with existing bills or replace completely
            // Option 1: Replace all bills
            // updateData.outstandingBills = dealerData.outstandingBills;
            
            // Option 2: Merge with existing bills (avoiding duplicates by bill number)
            const existingBills = existingDealer.outstandingBills || [];
            const existingBillNumbers = new Set(existingBills.map(bill => bill.billNumber));
            
            // Filter out new bills that have the same bill number as existing ones
            const newBills = dealerData.outstandingBills.filter(
              bill => !existingBillNumbers.has(bill.billNumber)
            );
            
            updateData.outstandingBills = [...existingBills, ...newBills];
          }
          
          // Only update if there are changes to make
          if (Object.keys(updateData).length > 0) {
            await updateDealer(
              existingDealer._id,
              updateData,
              userId
            );
            results.updated++;
          } else {
            // Just count as updated even if nothing changed
            results.updated++;
          }
          
          // Get the updated dealer data
          const updatedDealer = await updateDealer(
            existingDealer._id,
            {}, // Empty update to get the latest dealer data
            userId
          );
          
          results.dealers.push({
            id: updatedDealer._id,
            name: updatedDealer.companyName,
            phone: updatedDealer.phoneNumber,
            amount: updatedDealer.amount,
            outstandingBills: updatedDealer.outstandingBills || [],
            isNew: false
          });
          continue;
        }
        
        // Create a new dealer - include outstanding bills data
        const dealer = await createDealer(
          { 
            companyName: dealerData.companyName, 
            phoneNumber: dealerData.phoneNumber, 
            amount: dealerData.amount || 0,
            outstandingBills: dealerData.outstandingBills || []
          }, 
          userId
        );
        
        results.created++;
        results.dealers.push({
          id: dealer._id,
          name: dealer.companyName,
          phone: dealer.phoneNumber,
          amount: dealer.amount,
          outstandingBills: dealer.outstandingBills || [],
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
