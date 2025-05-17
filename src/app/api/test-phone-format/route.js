import { NextResponse } from 'next/server';
import { formatPhoneNumberForWhatsApp, isValidWhatsAppNumber, sendWhatsAppMessage } from '../../../utils/twilio';

/**
 * Test endpoint to validate phone number formatting and Twilio integration
 */
export async function GET(request) {
  try {
    // Get the phone number from URL parameters
    const { searchParams } = new URL(request.url);
    const phoneNumber = searchParams.get('phone');
    const testSend = searchParams.get('send') === 'true';

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    // Apply the phone number formatting and validation
    const isValid = isValidWhatsAppNumber(phoneNumber);
    const formattedNumber = formatPhoneNumberForWhatsApp(phoneNumber);
    
    // Build response data
    const responseData = {
      original: phoneNumber,
      isValid,
      formatted: formattedNumber,
    };
    
    // Send a test message if requested
    if (testSend && isValid) {
      try {
        const testMessage = "This is a test WhatsApp message from your debt collection application. If you received this, your Twilio integration is working properly.";
        const messageResult = await sendWhatsAppMessage(phoneNumber, testMessage);
        
        responseData.messageSent = true;
        responseData.messageId = messageResult.sid;
        responseData.messageStatus = messageResult.status;
        responseData.message = 'Test message sent successfully';
      } catch (sendError) {
        responseData.messageSent = false;
        responseData.error = sendError.message;
        responseData.message = 'Error sending test message';
      }
    } else {
      responseData.message = 'Phone number validation test only (no message sent)';
    }

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error testing phone number format:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to test phone number' },
      { status: 500 }
    );
  }
}
