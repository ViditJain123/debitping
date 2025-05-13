import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { upsertUser } from '../../../../utils/user';
import User from '../../../../schema/user';
import { connectToDatabase } from '../../../../utils/db';

// This is the Clerk webhook handler
// It processes user-related events from Clerk and updates our database accordingly

export async function POST(req) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  
  if (!WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    );
  }

  // Get the webhook signature from the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are no signature headers, this isn't a valid request
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json(
      { error: 'Missing svix headers' },
      { status: 400 }
    );
  }

  // Get the body of the webhook request
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your webhook secret
  const webhook = new Webhook(WEBHOOK_SECRET);
  let event;

  try {
    // Verify the webhook signature
    event = webhook.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    });
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return NextResponse.json(
      { error: 'Error verifying webhook' },
      { status: 400 }
    );
  }

  const eventType = event.type;
  const data = event.data;

  await connectToDatabase();
  
  try {
    switch (eventType) {
      case 'user.created':
      case 'user.updated':
        // Format the Clerk user data for our upsertUser function
        const clerkUser = {
          id: data.id,
          emailAddresses: data.email_addresses.map(email => ({
            emailAddress: email.email_address
          })),
          firstName: data.first_name,
          lastName: data.last_name,
          imageUrl: data.image_url
        };
        
        await upsertUser(clerkUser);
        break;
      
      case 'user.deleted':
        // Delete the user from our database
        await User.findOneAndDelete({ clerkId: data.id });
        break;
      
      default:
        // Ignore other event types
        break;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Error processing webhook' },
      { status: 500 }
    );
  }
}
