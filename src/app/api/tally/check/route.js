// API endpoint to check Tally availability
import { NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import tallyService from '../../../../utils/tally-service';
import { errorResponse, successResponse } from '../../../../utils/api-helpers';

export async function GET(request) {
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
      // Fetch companies list
    let companies = [];
    try {
      companies = await tallyService.getCompanies();
      console.log('Companies fetched successfully:', companies);
    } catch (companyError) {
      console.error('Error fetching company list:', companyError);
      // Still return success if Tally is available but company list couldn't be fetched
      return successResponse({
        available: true,
        message: 'Tally is available but could not fetch companies: ' + companyError.message,
        endpoint: tallyService.baseUrl,
        companies: [],
        error: companyError.message
      });
    }
    
    return successResponse({
      available: true,
      message: 'Tally is available and ready',
      endpoint: tallyService.baseUrl,
      companies: companies
    });  } catch (error) {
    console.error('Tally availability check error:', error);
    
    // Provide more detailed error information for debugging
    let errorDetails = '';
    if (error.stack) {
      console.error('Error stack:', error.stack);
      errorDetails = ' (Check server logs for details)';
    }
    
    // Handle HTML responses that might be misinterpreted
    if (error.message && error.message.includes('Unexpected token')) {
      errorDetails = ' - Received non-JSON response. The CORS Bridge extension might not be working correctly.';
    }
    
    return errorResponse(
      (error.message || 'Failed to check Tally availability') + errorDetails, 
      500
    );
  }
}
