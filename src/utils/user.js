import { connectToDatabase } from './db';
import User from '../schema/user';

/**
 * Creates or updates a user in the database based on Clerk user data
 * @param {Object} clerkUser - User data from Clerk
 * @returns {Object} - The created or updated user
 */
export async function upsertUser(clerkUser) {
  if (!clerkUser) {
    throw new Error('No user data provided');
  }

  try {
    // Connect to database
    await connectToDatabase();

    // Ensure we have a valid email address
    const emailAddress = clerkUser.emailAddresses && 
      clerkUser.emailAddresses[0]?.emailAddress;
      
    if (!emailAddress) {
      throw new Error('User must have an email address');
    }

    // Check if user exists
    const existingUser = await User.findOne({ clerkId: clerkUser.id });

    if (existingUser) {
      // Update existing user
      console.log(`Updating existing user: ${clerkUser.id}`);
      existingUser.email = emailAddress;
      existingUser.firstName = clerkUser.firstName || existingUser.firstName;
      existingUser.lastName = clerkUser.lastName || existingUser.lastName;
      existingUser.profileImageUrl = clerkUser.imageUrl || existingUser.profileImageUrl;
      existingUser.lastSignIn = new Date();
      
      await existingUser.save();
      console.log(`User updated successfully: ${existingUser.email}`);
      return existingUser;
    } else {
      // Create new user
      console.log(`Creating new user: ${clerkUser.id}`);
      const newUser = new User({
        clerkId: clerkUser.id,
        email: emailAddress,
        firstName: clerkUser.firstName || '',
        lastName: clerkUser.lastName || '',
        profileImageUrl: clerkUser.imageUrl,
        lastSignIn: new Date(),
      });
      
      await newUser.save();
      console.log(`New user created successfully: ${newUser.email}`);
      return newUser;
    }
  } catch (error) {
    console.error('Error upserting user:', error.message);
    console.error(error.stack);
    throw new Error(`Failed to upsert user: ${error.message}`);
  }
}

/**
 * Get a user by their Clerk ID
 * @param {string} clerkId - The Clerk user ID
 * @returns {Object|null} - The user or null if not found
 */
export async function getUserByClerkId(clerkId) {
  if (!clerkId) {
    return null;
  }
  
  try {
    await connectToDatabase();
    return await User.findOne({ clerkId });
  } catch (error) {
    console.error('Error getting user by Clerk ID:', error);
    return null;
  }
}

/**
 * Get a user by their email
 * @param {string} email - The user's email
 * @returns {Object|null} - The user or null if not found
 */
export async function getUserByEmail(email) {
  if (!email) {
    return null;
  }
  
  try {
    await connectToDatabase();
    return await User.findOne({ email });
  } catch (error) {
    console.error('Error getting user by email:', error);
    return null;
  }
}