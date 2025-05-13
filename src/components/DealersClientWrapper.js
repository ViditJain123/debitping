"use client";

import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function DealersClientWrapper({ children }) {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleStart = () => setLoading(true);
    const handleComplete = () => {
      setTimeout(() => setLoading(false), 500);
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

  // This effect will run when pathname changes
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <>
      {loading && (
        <div className="fixed top-0 left-0 right-0 z-[9999] h-1 bg-gray-200 dark:bg-gray-800">
          <div className="h-full bg-gradient-to-r from-primary to-secondary animate-loading-bar"></div>
        </div>
      )}
      {children}
    </>
  );
}
