import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../utils/db';
import Message from '../../../../schema/message';

export async function POST(request) {
  try {
    // Parse the incoming webhook data from Twilio
    const data = await request.formData();
    
    const messageId = data.get('MessageSid');
    const status = data.get('MessageStatus');
    
    if (!messageId || !status) {
      return NextResponse.json(
        { error: 'Missing required webhook data' },
        { status: 400 }
      );
    }
    
    // Update the message status in our database
    await connectToDatabase();
    
    const updatedMessage = await Message.findOneAndUpdate(
      { twilioMessageId: messageId },
      { status: status.toLowerCase() },
      { new: true }
    );
    
    if (!updatedMessage) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }
    
    console.log(`Updated message ${messageId} status to ${status}`);
    
    return NextResponse.json({
      success: true,
      status
    });
  } catch (error) {
    console.error('Error processing Twilio webhook:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process webhook' },
      { status: 500 }
    );
  }
}
