'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';

/**
 * Component to display database user information
 */
export default function UserProfile() {
  const { user } = useUser();
  const [dbUser, setDbUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDbUser = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const response = await fetch('/api/users');
        
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        
        const data = await response.json();
        setDbUser(data.user);
      } catch (err) {
        console.error('Error fetching database user:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDbUser();
  }, [user]);

  if (loading) {
    return <div className="p-4 border rounded-md">Loading user data...</div>;
  }

  if (error) {
    return (
      <div className="p-4 border rounded-md bg-red-50 text-red-500">
        Error: {error}
      </div>
    );
  }

  if (!dbUser) {
    return (
      <div className="p-4 border rounded-md bg-yellow-50">
        No database record found for this user.
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-md">
      <h3 className="text-lg font-semibold mb-2">User Database Record</h3>
      <div className="grid grid-cols-2 gap-2">
        <div className="text-gray-600">Clerk ID:</div>
        <div>{dbUser.clerkId}</div>
        
        <div className="text-gray-600">Name:</div>
        <div>{dbUser.firstName} {dbUser.lastName}</div>
        
        <div className="text-gray-600">Email:</div>
        <div>{dbUser.email}</div>
        
        <div className="text-gray-600">Last Sign In:</div>
        <div>{new Date(dbUser.lastSignIn).toLocaleString()}</div>
        
        <div className="text-gray-600">Created At:</div>
        <div>{new Date(dbUser.createdAt).toLocaleString()}</div>
      </div>
    </div>
  );
}
