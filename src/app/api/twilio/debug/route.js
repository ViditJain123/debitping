import { NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';

/**
 * API endpoint for debugging Twilio configuration
 * This is for administrative use only to help diagnose connection issues
 */
export async function GET(request) {
  try {
    // Check if user is authenticated
    const { userId } = getAuth(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get Twilio credentials from environment variables
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER;

    console.log('Twilio credentials:', {
      accountSid: accountSid ? `${accountSid.substring(0, 4)}...${accountSid.substring(accountSid.length - 4)}` : 'Not set',
      authToken: !!authToken,
      fromNumber: fromNumber || 'Not set',
    });
    
    // Check if the credentials are set
    const credentialsStatus = {
      accountSid: accountSid ? `${accountSid.substring(0, 4)}...${accountSid.substring(accountSid.length - 4)}` : 'Not set',
      authTokenSet: !!authToken,
      fromNumber: fromNumber || 'Not set',
    };
    
    // Check if the WhatsApp number is properly formatted
    if (fromNumber) {
      if (!fromNumber.startsWith('whatsapp:')) {
        credentialsStatus.warning = "The WhatsApp number should be prefixed with 'whatsapp:'";
        credentialsStatus.correctFromNumber = `whatsapp:${fromNumber.startsWith('+') ? fromNumber : '+' + fromNumber}`;
      } else {
        credentialsStatus.correctFromNumber = fromNumber;
      }
    }

    // Try to initialize Twilio client to test credentials
    try {
      if (accountSid && authToken) {
        const twilio = require('twilio')(accountSid, authToken);
        try {
          // Try to fetch account info
          const accountInfo = await twilio.api.accounts(accountSid).fetch();
          credentialsStatus.accountStatus = accountInfo.status;
          credentialsStatus.accountName = accountInfo.friendlyName;
          credentialsStatus.authSuccess = true;
          credentialsStatus.message = 'Twilio credentials are valid';
        } catch (twilioApiError) {
          credentialsStatus.authSuccess = false;
          credentialsStatus.errorCode = twilioApiError.code;
          credentialsStatus.errorMessage = twilioApiError.message;
          credentialsStatus.message = 'Failed to authenticate with Twilio';
        }
      } else {
        credentialsStatus.authSuccess = false;
        credentialsStatus.message = 'Missing Twilio credentials';
      }
    } catch (initError) {
      credentialsStatus.authSuccess = false;
      credentialsStatus.errorMessage = initError.message;
      credentialsStatus.message = 'Error initializing Twilio client';
    }

    // Return the credentials status
    return NextResponse.json({
      credentialsStatus,
      environment: process.env.NODE_ENV,
    });
    
  } catch (error) {
    console.error('Error debugging Twilio credentials:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to debug Twilio credentials' },
      { status: 500 }
    );
  }
}
