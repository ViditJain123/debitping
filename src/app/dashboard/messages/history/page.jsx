import { currentUser } from '@clerk/nextjs/server';
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';
import { FiSend } from 'react-icons/fi';
import MessageHistory from '../MessageHistory';
import { Suspense } from 'react';

export default async function MessageHistoryPage() {
  // Get the current user - the middleware should already protect this route
  const user = await currentUser();
  
  // Use a fallback user object if for some reason user is not available
  const userData = user || {
    firstName: 'User',
    username: 'User',
    emailAddresses: [{ emailAddress: 'example@email.com' }],
    imageUrl: null
  };

  return (
    <div className="p-4 lg:p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Message History
          </h1>
          <div className="flex items-center mt-2 text-sm text-gray-500 dark:text-gray-400">
            <Link href="/dashboard" className="hover:text-primary">Dashboard</Link>
            <span className="mx-2">›</span>
            <Link href="/dashboard/messages" className="hover:text-primary">Messages</Link>
            <span className="mx-2">›</span>
            <span className="text-gray-700 dark:text-gray-300">History</span>
          </div>
        </div>
        <div className="flex space-x-3">
          <Link href="/dashboard/messages" className="flex items-center px-4 py-2 text-sm text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
            <FiSend className="mr-2" />
            Send Messages
          </Link>
          <Link href="/dashboard" className="flex items-center px-4 py-2 text-sm text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
            <FaArrowLeft className="mr-2" />
            Back to Dashboard
          </Link>
        </div>
      </div>
      
      <Suspense fallback={<div className="p-4">Loading message history...</div>}>
        <MessageHistory />
      </Suspense>
    </div>
  );
}
