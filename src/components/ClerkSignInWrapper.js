'use client';

import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

/**
 * Component that synchronizes Clerk user data with our database
 * after successful sign-in
 */
export default function ClerkSignInWrapper({ children }) {
  const { isSignedIn, user, isLoaded } = useUser();
  const router = useRouter();

  // Save user data to our database when user signs in
  useEffect(() => {
    const saveUserToDb = async () => {
      if (isSignedIn && user && isLoaded) {
        try {
          // Call our API endpoint to save user data
          const response = await fetch('/api/users', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) {
            console.error('Failed to save user data to database');
          }
        } catch (error) {
          console.error('Error saving user data:', error);
        }
      }
    };

    saveUserToDb();
  }, [isSignedIn, user, isLoaded]);

  return children;
}
