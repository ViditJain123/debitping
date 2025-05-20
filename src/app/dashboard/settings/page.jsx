import { currentUser } from '@clerk/nextjs/server';
import Link from 'next/link';
import UserProfile from '../../../components/UserProfile';
import DashboardLayout from '../../../components/DashboardLayout';

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
    <DashboardLayout title="Settings">
      <div className="space-y-6">
      
      <div className="mb-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-lg shadow-sm p-4 border border-gray-100/50 dark:border-gray-700/50">
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-xl font-semibold">Your User Profile</h2>
        </div>
        <UserProfile />
      </div>
      
      {/* Twilio Integration Settings */}
      <div className="mb-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-lg shadow-sm p-4 border border-gray-100/50 dark:border-gray-700/50">
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-xl font-semibold">WhatsApp Integrations</h2>
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Twilio Integration</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Your Twilio WhatsApp integration settings are configured through environment variables. You can use the
            testing tool to verify your settings and send test messages.
          </p>
          
          <Link 
            href="/dashboard/settings/twilio-test" 
            className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
          >
            Test Twilio WhatsApp Integration
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-2">Meta WhatsApp Business Platform</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Set up a direct integration with the Meta WhatsApp Business Platform. This allows you to send messages directly 
            without using Twilio as an intermediary.
          </p>
          
          <Link 
            href="/dashboard/settings/meta-whatsapp" 
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Set Up Meta WhatsApp Integration
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
      </div>
    </DashboardLayout>
  );
}
