import { NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';

/**
 * API endpoint to check Twilio account status and configuration
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
    
    // Collect status information
    const status = {
      configured: !!(accountSid && authToken && fromNumber),
      twilioAccountSid: accountSid ? `${accountSid.substring(0, 6)}...${accountSid.substring(accountSid.length - 4)}` : null,
      twilioNumberConfigured: !!fromNumber,
      environment: process.env.NODE_ENV || 'development',
      whatsappEnabled: true // WhatsApp is enabled if Twilio account has WhatsApp capability
    };
    
    if (status.configured) {
      try {
        // Initialize Twilio client and check account
        const twilio = require('twilio')(accountSid, authToken);
        const account = await twilio.api.accounts(accountSid).fetch();
        
        status.accountStatus = account.status;
        status.accountType = account.type;
        status.friendlyName = account.friendlyName;
        
        // Check if the WhatsApp number is properly formatted
        if (fromNumber) {
          if (!fromNumber.startsWith('whatsapp:')) {
            status.warning = "The WhatsApp number in your environment variables should be prefixed with 'whatsapp:'";
          }
          
          // Extract just the number part for display
          const numberPart = fromNumber.startsWith('whatsapp:') ? fromNumber.substring(9) : fromNumber;
          status.fromNumberDisplay = numberPart;
        }
        
      } catch (twilioError) {
        status.error = twilioError.message || 'Failed to connect to Twilio API';
        status.accountStatus = 'error';
      }
    }
    
    return NextResponse.json(status);
  } catch (error) {
    console.error('Error checking Twilio status:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check Twilio status' },
      { status: 500 }
    );
  }
}
