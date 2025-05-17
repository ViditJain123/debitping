import { NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';

/**
 * API endpoint to verify Twilio credentials
 */
export async function POST(request) {
  try {
    // Check if user is authenticated
    const { userId } = getAuth(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get credentials from request body
    const { accountSid, authToken, phoneNumber } = await request.json();
    
    // Validate input
    if (!accountSid || !authToken) {
      return NextResponse.json(
        { error: 'Account SID and Auth Token are required' },
        { status: 400 }
      );
    }
    
    try {
      // Initialize Twilio client with provided credentials
      const twilio = require('twilio')(accountSid, authToken);
      
      // Try to fetch account information to verify the credentials
      const account = await twilio.api.accounts(accountSid).fetch();
      
      // Check phone number format if provided
      let phoneNumberWarning = null;
      if (phoneNumber) {
        // If phoneNumber doesn't have whatsapp: prefix for WhatsApp
        if (!phoneNumber.startsWith('whatsapp:')) {
          phoneNumberWarning = "WhatsApp phone numbers should be prefixed with 'whatsapp:'";
        }
      }
      
      // Return the verification result
      return NextResponse.json({
        verified: true,
        accountStatus: account.status,
        accountType: account.type,
        friendlyName: account.friendlyName,
        phoneNumberWarning
      });
      
    } catch (twilioError) {
      // Handle invalid credentials
      console.error('Twilio verification error:', twilioError);
      return NextResponse.json(
        { 
          verified: false, 
          error: twilioError.message || 'Invalid Twilio credentials'
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error verifying Twilio credentials:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to verify credentials' },
      { status: 500 }
    );
  }
}
