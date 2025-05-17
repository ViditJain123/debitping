import { NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { updateDealerLastMessage, updateDistributorLastMessage } from '../../../utils/dealer';
import { getUserByClerkId } from '../../../utils/user';

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
    const { dealerId, message, type } = await request.json();
    
    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // If it's a message received from a dealer
    if (type === 'received' && dealerId) {
      const dealer = await updateDealerLastMessage(dealerId, message);
      return NextResponse.json({ dealer });
    }
    
    // If it's a message sent by the distributor
    if (type === 'sent') {
      const distributor = await updateDistributorLastMessage(userId, message);
      return NextResponse.json({ distributor });
    }
    
    return NextResponse.json(
      { error: 'Invalid message type or missing dealer ID for received messages' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in POST /api/messages:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    // Get the user's Clerk ID from the auth session
    const { userId } = getAuth(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get the distributor with populated dealers
    const distributor = await getUserByClerkId(userId);
    
    if (!distributor) {
      return NextResponse.json(
        { error: 'Distributor not found' },
        { status: 404 }
      );
    }
    
    // Check if we have a specific dealer ID
    const url = new URL(request.url);
    const dealerId = url.searchParams.get('dealerId');
    const getHistory = url.searchParams.get('history') === 'true';
    
    // If the history parameter is present, fetch message history from the Message collection
    if (getHistory) {
      try {
        const { connectToDatabase } = require('../../../utils/db');
        const Message = require('../../../schema/message').default;
        
        await connectToDatabase();
        
        // Build the query
        const query = { distributorClerkId: userId };
        if (dealerId) {
          query.dealerId = dealerId;
        }
        
        const limit = parseInt(url.searchParams.get('limit') || '50', 10);
        
        // Get all messages for this distributor, ordered by most recent first
        const messages = await Message.find(query)
          .sort({ sentAt: -1 })
          .limit(limit)
          .populate('dealerId', 'companyName phoneNumber');
        
        // Format the response
        const formattedMessages = messages.map(message => ({
          id: message._id,
          dealerId: message.dealerId?._id || message.dealerId,
          dealerName: message.dealerId?.companyName || 'Unknown',
          phoneNumber: message.dealerId?.phoneNumber || 'Unknown',
          message: message.messageContent,
          status: message.status,
          sentAt: message.sentAt
        }));
        
        return NextResponse.json({ 
          messages: formattedMessages,
          count: formattedMessages.length
        });
      } catch (error) {
        console.error('Error fetching message history:', error);
        // Continue to return the basic response on error
      }
    }
    
    // Default response with last message info
    let response = {
      lastMessageSent: distributor.lastMessageSent,
      lastMessageSentAt: distributor.lastMessageSentAt,
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in GET /api/messages:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
