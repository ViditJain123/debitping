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
    
    return successResponse({
      available: true,
      message: 'Tally is available and ready',
      endpoint: tallyService.baseUrl
    });
  } catch (error) {
    console.error('Tally availability check error:', error);
    return errorResponse(error.message || 'Failed to check Tally availability', 500);
  }
}
