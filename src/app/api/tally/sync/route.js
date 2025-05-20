// API endpoint to sync dealer data from Tally
import { NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import tallyService from '../../../../utils/tally-service';
import { errorResponse, successResponse } from '../../../../utils/api-helpers';
import { connectToDatabase } from '../../../../utils/db';
import { createDealer, getDealersByDistributor, updateDealer } from '../../../../utils/dealer';

export async function POST(request) {
  try {
    // Check authentication
    const { userId } = getAuth(request);
    
    if (!userId) {
      return errorResponse('Unauthorized', 401);
    }
    
    // Check if Tally is available
    const isAvailable = await tallyService.isTallyAvailable();
    
    if (!isAvailable) {
      return errorResponse('Tally not available. Please make sure Tally is running and serving at port 9000.', 503);
    }
    
    // Get request body (company name if provided)
    let companyName = '';
    
    try {
      const body = await request.json();
      companyName = body.companyName || '';
    } catch (error) {
      // No body or invalid JSON - default to empty company name
    }
    
    // Connect to database
    await connectToDatabase();
    
    // Get existing dealers for this distributor
    const existingDealers = await getDealersByDistributor(userId);
    
    // Fetch companies from Tally
    const companies = await tallyService.getCompanies();
    
    if (!companies || !companies.COMPANIES || !companies.COMPANIES.COMPANY) {
      return errorResponse('No companies found in Tally', 404);
    }
    
    // If company name is not provided, use the first company
    if (!companyName) {
      if (Array.isArray(companies.COMPANIES.COMPANY)) {
        companyName = companies.COMPANIES.COMPANY[0].NAME;
      } else {
        companyName = companies.COMPANIES.COMPANY.NAME;
      }
    }
    
    // Fetch ledgers for the selected company
    const ledgers = await tallyService.getLedgers(companyName);
    
    if (!ledgers) {
      return errorResponse('No ledgers found in Tally', 404);
    }
    
    // Fetch outstanding bills
    const outstandingBills = await tallyService.getOutstandingBills(companyName);
    
    // Process the ledger data to extract dealer information
    const dealers = tallyService.processDealerData(ledgers, outstandingBills || []);
    
    if (dealers.length === 0) {
      return errorResponse('No dealers found in Tally', 404);
    }
    
    // Track sync results
    const results = {
      created: 0,
      updated: 0,
      failed: 0,
      skipped: 0,
      dealers: []
    };
    
    // Process each dealer from Tally
    for (const dealerData of dealers) {
      try {
        // Skip if no phone number (we can't match or create without a phone)
        if (!dealerData.phoneNumber) {
          results.skipped++;
          continue;
        }
        
        // Check if dealer with this name or phone already exists
        const existingDealer = existingDealers.find(
          dealer => 
            dealer.companyName.toLowerCase() === dealerData.companyName.toLowerCase() ||
            dealer.phoneNumber === dealerData.phoneNumber
        );
        
        let dealer;
        
        // If dealer exists, update it
        if (existingDealer) {
          // Prepare update data
          const updateData = {
            phoneNumber: dealerData.phoneNumber,
            amount: dealerData.amount
          };
          
          // If there are new bills, add them
          if (dealerData.outstandingBills && dealerData.outstandingBills.length > 0) {
            // Get existing bill numbers
            const existingBillNumbers = new Set(
              (existingDealer.outstandingBills || []).map(bill => bill.billNumber)
            );
            
            // Filter out bills that already exist
            const newBills = dealerData.outstandingBills.filter(
              bill => !existingBillNumbers.has(bill.billNumber)
            );
            
            // If there are new bills, update the outstandingBills
            if (newBills.length > 0) {
              updateData.outstandingBills = [
                ...(existingDealer.outstandingBills || []),
                ...newBills
              ];
            }
          }
          
          // Update the dealer
          dealer = await updateDealer(
            existingDealer._id,
            updateData,
            userId
          );
          
          results.updated++;
        } 
        // Otherwise create a new dealer
        else {
          dealer = await createDealer(
            { 
              companyName: dealerData.companyName, 
              phoneNumber: dealerData.phoneNumber, 
              amount: dealerData.amount,
              outstandingBills: dealerData.outstandingBills || []
            }, 
            userId
          );
          
          results.created++;
        }
        
        // Add to results
        results.dealers.push({
          id: dealer._id,
          name: dealer.companyName,
          phone: dealer.phoneNumber,
          amount: dealer.amount,
          outstandingBills: dealer.outstandingBills || [],
          isNew: !existingDealer
        });
      } catch (error) {
        console.error(`Error processing dealer ${dealerData.companyName}:`, error);
        results.failed++;
      }
    }
    
    // Create a detailed success message
    let successMessage = `Processed ${dealers.length} dealers from Tally: ${results.created} created, ${results.updated} updated`;
    if (results.failed > 0) {
      successMessage += `, ${results.failed} failed`;
    }
    if (results.skipped > 0) {
      successMessage += `, ${results.skipped} skipped (no phone number)`;
    }
    
    return successResponse({ 
      success: true,
      message: successMessage,
      company: companyName,
      results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error syncing dealers from Tally:', error);
    return errorResponse(error.message || 'Failed to sync dealers from Tally', 500);
  }
}
