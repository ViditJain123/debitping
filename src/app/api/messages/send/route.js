import { NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { sendWhatsAppMessage as sendTwilioWhatsAppMessage, createOutstandingPaymentMessage, logMessageSent } from '../../../../utils/twilio';
import metaWhatsAppService from '../../../../utils/meta-whatsapp';
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
    const { dealerIds, customMessage, provider = 'twilio' } = await request.json();
    
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
        
        // Send the WhatsApp message based on selected provider
        let messageSent;
        
        if (provider === 'meta') {
          // Send via Meta WhatsApp Business Platform
          messageSent = await metaWhatsAppService.sendTextMessage(dealer.phoneNumber, message);
          
          // Log the message in the database
          await logMessageInDatabase(
            dealerId, 
            message, 
            messageSent.messages[0].id, 
            userId,
            'meta'
          );
          
          results.push({
            dealerId,
            dealerName: dealer.companyName,
            success: true,
            messageId: messageSent.messages[0].id,
            provider: 'meta'
          });
        } else {
          // Default: Send via Twilio
          messageSent = await sendTwilioWhatsAppMessage(dealer.phoneNumber, message);
          
          // Log the message in the database
          await logMessageSent(
            dealerId, 
            message, 
            messageSent.sid, 
            userId
          );
          
          results.push({
            dealerId,
            dealerName: dealer.companyName,
            success: true,
            messageId: messageSent.sid,
            provider: 'twilio'
          });
        }
        
        successCount++;
      } catch (error) {
        console.error(`Error sending message to dealer ${dealerId}:`, error);
        
        results.push({
          dealerId,
          success: false,
          error: error.message || 'Failed to send message',
          provider: provider
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

/**
 * Log a sent message to the database
 * @param {string} dealerId - The dealer ID
 * @param {string} messageContent - The content of the message
 * @param {string} messageId - The message ID from the provider
 * @param {string} userId - The user ID who sent the message
 * @param {string} provider - The message provider (twilio or meta)
 */
async function logMessageInDatabase(dealerId, messageContent, messageId, userId, provider = 'twilio') {
  try {
    // Import here to avoid circular dependencies
    const { db } = await import('../../../../utils/db');
    
    await db.message.create({
      data: {
        content: messageContent,
        providerId: messageId,
        provider: provider,
        userId: userId,
        dealerId: dealerId,
        status: 'sent',
        sentAt: new Date(),
      },
    });
  } catch (error) {
    console.error(`Error logging ${provider} message:`, error);
    // Don't throw error to avoid breaking the message flow
  }
}
