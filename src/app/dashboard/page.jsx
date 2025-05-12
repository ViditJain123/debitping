import { currentUser } from '@clerk/nextjs/server';
import Link from 'next/link';
import { FaArrowLeft, FaWhatsapp, FaFileInvoiceDollar, FaUserPlus, FaBell } from 'react-icons/fa';
import { RiSettings4Fill, RiDashboardLine } from 'react-icons/ri';
import FileUploaderWrapper from './FileUploaderWrapper';

export default async function DashboardPage() {
  // Get the current user - the middleware should already protect this route
  // so we should always have a user here
  const user = await currentUser();
  
  // Use a fallback user object if for some reason user is not available
  // This prevents the UI from breaking if there are auth issues
  const userData = user || {
    firstName: 'User',
    username: 'User',
    emailAddresses: [{ emailAddress: 'example@email.com' }],
    imageUrl: null
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex">
        {/* Sidebar */}
        <div className="hidden md:flex flex-col w-64 bg-white dark:bg-gray-800 shadow-md p-4 min-h-screen">
          <div className="mb-8 mt-4">
            <h2 className="text-xl font-bold text-primary flex items-center gap-2">
              <RiDashboardLine /> DebitPing
            </h2>
          </div>
          
          <nav className="flex-1">
            <div className="mb-6">
              <h3 className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Main</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/dashboard" className="flex items-center px-4 py-2 text-gray-800 dark:text-white bg-gray-100 dark:bg-gray-700 rounded-md">
                    <RiDashboardLine className="mr-3" /> Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/contacts" className="flex items-center px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
                    <FaUserPlus className="mr-3" /> Contacts
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Settings</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/dashboard/settings" className="flex items-center px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
                    <RiSettings4Fill className="mr-3" /> Settings
                  </Link>
                </li>
              </ul>
            </div>
          </nav>
          
          <div className="mt-auto pt-6">
            <div className="flex items-center gap-3 p-3 border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="w-10 h-10 rounded-full overflow-hidden">
                {userData.imageUrl ? (
                  <img 
                    src={userData.imageUrl} 
                    alt={userData.firstName || 'User'} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                    <span className="text-sm font-bold text-gray-600 dark:text-gray-300">
                      {(userData.firstName?.[0] || userData.username?.[0] || 'U').toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <div className="text-sm">
                <p className="font-medium">{userData.firstName || userData.username || 'User'}</p>
                <p className="text-xs text-gray-500 truncate" title={userData.emailAddresses?.[0]?.emailAddress || ''}>
                  {userData.emailAddresses?.[0]?.emailAddress || ''}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main content */}
        <div className="flex-1 p-4 lg:p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-3">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Dashboard
            </h1>
            <div>
              <Link href="/" className="flex items-center px-4 py-2 text-sm text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                <FaArrowLeft className="mr-2" />
                Back to Home
              </Link>
            </div>
          </div>
          
          <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-3">Upload Your Debit Data</h2>
            <FileUploaderWrapper />
          </div>
            
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-lg">Pending Payments</h3>
                <div className="p-2 bg-amber-100 text-amber-600 rounded-full">
                  <FaFileInvoiceDollar />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">$0.00</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">From 0 invoices</p>
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                <Link href="/dashboard/invoices" className="text-sm text-primary hover:underline">View all invoices</Link>
              </div>
            </div>
              
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-lg">Messages Sent</h3>
                <div className="p-2 bg-green-100 text-green-600 rounded-full">
                  <FaWhatsapp />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">0</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Last 30 days</p>
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                <Link href="/dashboard/messages" className="text-sm text-primary hover:underline">View message history</Link>
              </div>
            </div>
              
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-lg">Successful Payments</h3>
                <div className="p-2 bg-blue-100 text-blue-600 rounded-full">
                  <FaFileInvoiceDollar />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">$0.00</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total collected</p>
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                <Link href="/dashboard/analytics" className="text-sm text-primary hover:underline">View analytics</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}