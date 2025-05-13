import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { upsertUser, getUserByClerkId } from '../../../utils/user';

/**
 * GET handler to fetch the current user's database record
 */
export async function GET() {
  try {
    // Get authenticated user from Clerk
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get user from our database
    let dbUser = await getUserByClerkId(user.id);
    
    // If user doesn't exist in our database yet, create them
    if (!dbUser) {
      console.log('User not found in database, creating new user');
      try {
        // Create the user using the Clerk user data
        dbUser = await upsertUser(user);
        console.log('New user created:', dbUser);
      } catch (createError) {
        console.error('Error creating new user:', createError);
        return NextResponse.json({ error: 'Failed to create user record' }, { status: 500 });
      }
    }
    
    return NextResponse.json({ user: dbUser });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * POST handler to store or update user data
 * This can be called when a user signs in or when their profile is updated
 */
export async function POST() {
  try {
    // Get authenticated user from Clerk
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Create or update user in our database
    const user = await upsertUser(clerkUser);
    
    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error creating/updating user:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}