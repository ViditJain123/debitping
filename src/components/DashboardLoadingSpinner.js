'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function DashboardLoadingSpinner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleStart = () => setIsLoading(true);
    const handleComplete = () => {
      // Add a slight delay to make the loading state noticeable
      setTimeout(() => setIsLoading(false), 300);
    };

    window.addEventListener('navigationstart', handleStart);
    window.addEventListener('navigatesuccess', handleComplete);
    window.addEventListener('navigateerror', handleComplete);

    return () => {
      window.removeEventListener('navigationstart', handleStart);
      window.removeEventListener('navigatesuccess', handleComplete);
      window.removeEventListener('navigateerror', handleComplete);
    };
  }, []);

  // Handle URL changes for page transitions
  useEffect(() => {
    setIsLoading(true);

    // Add a slight delay to make the loading state noticeable
    const timer = setTimeout(() => setIsLoading(false), 500);

    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative w-16 h-16">
          <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-t-primary border-l-primary border-gray-200 dark:border-gray-700 animate-spin"></div>
        </div>
        <p className="text-gray-700 dark:text-gray-300 font-medium">Loading...</p>
      </div>
    </div>
  );
}
