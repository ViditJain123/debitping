import { currentUser } from '@clerk/nextjs/server';
import Link from 'next/link';
import { 
  FaUserPlus, 
  FaWhatsapp, 
  FaFileInvoiceDollar, 
  FaBell 
} from 'react-icons/fa';
import { RiSettings4Fill, RiDashboardLine } from 'react-icons/ri';

export default async function DealersLayout({ children }) {
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
                  <Link href="/dashboard" className="flex items-center px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
                    <RiDashboardLine className="mr-3" /> Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/dealers" className="flex items-center px-4 py-2 text-gray-800 dark:text-white bg-gray-100 dark:bg-gray-700 rounded-md">
                    <FaUserPlus className="mr-3" /> Dealers
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
        <div className="flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}
