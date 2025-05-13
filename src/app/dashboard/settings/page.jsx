import { currentUser } from '@clerk/nextjs/server';
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';
import UserProfile from '../../../components/UserProfile';

export default async function SettingsPage() {
  // Get the current user
  const user = await currentUser();
  
  // Use a fallback user object if for some reason user is not available
  const userData = user || {
    firstName: 'User',
    username: 'User',
    emailAddresses: [{ emailAddress: 'example@email.com' }],
    imageUrl: null
  };

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-3">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Settings
        </h1>
        <div>
          <Link href="/dashboard" className="flex items-center px-4 py-2 text-sm text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
            <FaArrowLeft className="mr-2" />
            Back to Dashboard
          </Link>
        </div>
      </div>
      
      <div className="mb-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-lg shadow-sm p-4 border border-gray-100/50 dark:border-gray-700/50">
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-xl font-semibold">Your User Profile</h2>
        </div>
        <UserProfile />
      </div>
      
      {/* Additional settings sections can be added here */}
    </div>
  );
}
