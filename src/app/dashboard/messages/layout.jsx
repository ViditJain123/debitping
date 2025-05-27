import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import {
  FaUserPlus,
  FaWhatsapp,
  FaFileInvoiceDollar,
  FaBell,
} from "react-icons/fa";
import { FiSend, FiMessageSquare } from "react-icons/fi";
import { RiSettings4Fill, RiDashboardLine } from "react-icons/ri";
import DealersClientWrapper from "../../../components/DealersClientWrapper";

export default async function MessagesLayout({ children }) {
  // Get the current user - the middleware should already protect this route
  const user = await currentUser();

  // Use a fallback user object if for some reason user is not available
  const userData = user || {
    firstName: "User",
    username: "User",
    emailAddresses: [{ emailAddress: "example@email.com" }],
    imageUrl: null,
  };

  return (
    <DealersClientWrapper>
      <div className="min-h-screen bg-gradient-to-br from-gray-50/80 to-gray-100/80 dark:from-gray-900/80 dark:to-gray-800/80 backdrop-blur-sm overflow-hidden">
        <div className="flex h-screen">
          {/* Sidebar - fixed position with glass effect */}
          <div className="hidden md:flex flex-col w-64 bg-white/70 dark:bg-gray-800/70 shadow-md p-4 h-screen fixed backdrop-blur-lg border-r border-gray-100/50 dark:border-gray-700/50 overflow-hidden">
            <div className="mb-8 mt-4">
              <h2 className="text-xl font-bold text-primary flex items-center gap-2">
                <RiDashboardLine /> DebitPing
              </h2>
            </div>

            <nav className="flex-1">
              <div className="mb-6">
                <h3 className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                  Main
                </h3>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="/dashboard"
                      className="flex items-center px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                    >
                      <RiDashboardLine className="mr-3" /> Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/dashboard/dealers"
                      className="flex items-center px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                    >
                      <FaUserPlus className="mr-3" /> Dealers
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/dashboard/messages"
                      className={`flex items-center px-4 py-2 text-gray-800 dark:text-white ${
                        typeof window !== 'undefined' && 
                        window.location.pathname === '/dashboard/messages' ? 
                        'bg-gray-100 dark:bg-gray-700' : 
                        'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      } rounded-md`}
                    >
                      <FaWhatsapp className="mr-3" /> Send Messages
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/dashboard/messages/history"
                      className={`flex items-center px-4 py-2 text-gray-800 dark:text-white ${
                        typeof window !== 'undefined' && 
                        window.location.pathname === '/dashboard/messages/history' ? 
                        'bg-gray-100 dark:bg-gray-700' : 
                        'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      } rounded-md`}
                    >
                      <FiMessageSquare className="mr-3" /> Message History
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                  Settings
                </h3>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="/dashboard/settings"
                      className="flex items-center px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                    >
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
                      alt={userData.firstName || "User"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                      <span className="text-sm font-bold text-gray-600 dark:text-gray-300">
                        {(
                          userData.firstName?.[0] ||
                          userData.username?.[0] ||
                          "U"
                        ).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="text-sm">
                  <p className="font-medium">
                    {userData.firstName || userData.username || "User"}
                  </p>
                  <p
                    className="text-xs text-gray-500 truncate"
                    title={userData.emailAddresses?.[0]?.emailAddress || ""}
                  >
                    {userData.emailAddresses?.[0]?.emailAddress || ""}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main content - with left margin to account for fixed sidebar */}
          <div className="flex-1 md:ml-64 p-4 lg:p-6 overflow-y-auto">{children}</div>
        </div>
      </div>
    </DealersClientWrapper>
  );
}
