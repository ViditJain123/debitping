'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaArrowLeft, FaWhatsapp, FaFileInvoiceDollar, FaUserPlus, FaCalendarCheck } from 'react-icons/fa';
import { RiSettings4Fill, RiDashboardLine } from 'react-icons/ri';
import { FiZap } from 'react-icons/fi';

export default function DashboardLayout({ children, title }) {
  const pathname = usePathname();
  
  const isActive = (path) => {
    return pathname === path;
  };

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-3">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {title}
        </h1>
        <div>
          <Link href="/dashboard" className="flex items-center px-4 py-2 text-sm text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
            <FaArrowLeft className="mr-2" />
            Back to Dashboard
          </Link>
        </div>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-5">
        <div className="lg:w-64 mb-4">
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-lg shadow-sm p-3 border border-gray-100/50 dark:border-gray-700/50 sticky top-4">
            <h3 className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3 px-3">
              Navigation
            </h3>
            <ul className="space-y-1">
              <li>
                <Link 
                  href="/dashboard" 
                  className={`flex items-center px-3 py-2 rounded-md transition-colors ${
                    isActive('/dashboard') 
                      ? 'bg-primary/10 text-primary' 
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <RiDashboardLine className="mr-3" /> Dashboard
                </Link>
              </li>
              <li>
                <Link 
                  href="/dashboard/dealers" 
                  className={`flex items-center px-3 py-2 rounded-md transition-colors ${
                    pathname.includes('/dashboard/dealers') 
                      ? 'bg-primary/10 text-primary' 
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <FaUserPlus className="mr-3" /> Dealers
                </Link>
              </li>
              <li>
                <Link 
                  href="/dashboard/messages" 
                  className={`flex items-center px-3 py-2 rounded-md transition-colors ${
                    pathname.includes('/dashboard/messages') 
                      ? 'bg-primary/10 text-primary' 
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <FaWhatsapp className="mr-3" /> Send Messages
                </Link>
              </li>
              <li>
                <Link 
                  href="/dashboard/settings" 
                  className={`flex items-center px-3 py-2 rounded-md transition-colors ${
                    pathname.includes('/dashboard/settings') && !pathname.includes('/twilio-test')
                      ? 'bg-primary/10 text-primary' 
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <RiSettings4Fill className="mr-3" /> Settings
                </Link>
              </li>
              <li>
                <Link 
                  href="/dashboard/settings/twilio-test" 
                  className={`flex items-center px-3 py-2 rounded-md transition-colors ${
                    pathname.includes('/dashboard/settings/twilio-test') 
                      ? 'bg-primary/10 text-primary' 
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <FiZap className="mr-3" /> Test Twilio
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}
