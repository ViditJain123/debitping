'use client';

import { useState, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function NavigationLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleRouteChangeStart = () => {
      setIsLoading(true);
    };

    const handleRouteChangeComplete = () => {
      setIsLoading(true);
      // Add a small delay to ensure smooth transition
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

  // This effect will trigger when pathname or search params change
  useEffect(() => {
    setIsLoading(true);
    
    // Hide loader after a short delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  if (!isLoading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-1 bg-gray-200 dark:bg-gray-800">
      <div className="h-full bg-gradient-to-r from-primary to-secondary animate-loading-bar"></div>
    </div>
  );
}
