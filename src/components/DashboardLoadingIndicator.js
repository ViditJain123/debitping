"use client";

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DashboardLoadingIndicator() {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleStart = () => {
      setIsLoading(true);
    };

    const handleComplete = () => {
      setTimeout(() => {
        setIsLoading(false);
      }, 300);
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

  // Reset loading state when pathname changes
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [pathname]);

  if (!isLoading) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-[9999] bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm">
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 rounded-full border-4 border-gray-300 dark:border-gray-600 border-t-primary dark:border-t-primary animate-spin"></div>
        <p className="mt-4 text-gray-700 dark:text-gray-300 font-medium">Loading...</p>
      </div>
    </div>
  );
}
