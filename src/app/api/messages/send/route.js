import { NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { sendWhatsAppMessage, createOutstandingPaymentMessage, logMessageSent } from '../../../../utils/twilio';
import { getUserById } from '../../../../utils/user';
import { getDealerById } from '../../../../utils/dealer';

export async function POST(request) {
  try {
    // Get the user's Clerk ID from the auth session
    const { userId } = getAuth(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get message data from request body
    const { dealerIds, customMessage } = await request.json();
    
    if (!dealerIds || !Array.isArray(dealerIds) || dealerIds.length === 0) {
      return NextResponse.json(
        { error: 'At least one dealer ID is required' },
        { status: 400 }
      );
    }
    
    // Get the distributor's name to use in the message
    const distributor = await getUserById(userId);
    const distributorName = distributor?.name || distributor?.firstName || "Your distributor";
    
    // Send messages to each dealer
    const results = [];
    let successCount = 0;
    let failureCount = 0;
    
    for (const dealerId of dealerIds) {
      try {
        // Get the dealer details
        const dealer = await getDealerById(dealerId, userId);
        
        if (!dealer) {
          results.push({
            dealerId,
            success: false,
            error: 'Dealer not found'
          });
          failureCount++;
          continue;
        }
        
        // Create the message
        const message = customMessage || createOutstandingPaymentMessage(
          dealer.companyName,
          dealer.amount || 0,
          distributorName
        );
        
        // Send the WhatsApp message
        const messageSent = await sendWhatsAppMessage(dealer.phoneNumber, message);
        
        // Log the message in the database
        await logMessageSent(dealerId, message, messageSent.sid, userId);
        
        results.push({
          dealerId,
          dealerName: dealer.companyName,
          success: true,
          messageId: messageSent.sid
        });
        
        successCount++;
      } catch (error) {
        console.error(`Error sending message to dealer ${dealerId}:`, error);
        
        results.push({
          dealerId,
          success: false,
          error: error.message || 'Failed to send message'
        });
        
        failureCount++;
      }
    }
    
    return NextResponse.json({
      success: true,
      totalSent: successCount,
      totalFailed: failureCount,
      results
    });
  } catch (error) {
    console.error('Error in POST /api/messages:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send messages' },
      { status: 500 }
    );
  }
}
