'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function LoadingProvider({ children }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleRouteChangeStart = () => {
      setIsLoading(true);
    };

    const handleRouteChangeComplete = () => {
      setTimeout(() => {
        setIsLoading(false);
      }, 300);
    };

    window.addEventListener('navigationstart', handleRouteChangeStart);
    window.addEventListener('navigatesuccess', handleRouteChangeComplete);
    window.addEventListener('navigateerror', handleRouteChangeComplete);

    return () => {
      window.removeEventListener('navigationstart', handleRouteChangeStart);
      window.removeEventListener('navigatesuccess', handleRouteChangeComplete);
      window.removeEventListener('navigateerror', handleRouteChangeComplete);
    };
  }, []);

  // This effect handles initial page loads and client-side navigation
  useEffect(() => {
    setIsLoading(true);
    
    // Hide loader after a short delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  return (
    <>
      {isLoading && (
        <div className="fixed top-0 left-0 right-0 z-[9999] h-1 bg-gray-200 dark:bg-gray-800">
          <div className="h-full bg-gradient-to-r from-primary to-secondary animate-loading-bar"></div>
        </div>
      )}
      {children}
    </>
  );
}
