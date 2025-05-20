"use client";

import { usePathname } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import DashboardLoadingSpinner from './DashboardLoadingSpinner';
import ExtensionCheckDialog from './ExtensionCheckDialog';
import ManualExtensionReset from './ManualExtensionReset';

export default function DashboardClientWrapper({ children }) {
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
      <Suspense fallback={<div>Loading dashboard...</div>}>
        <DashboardLoadingSpinner />
      </Suspense>
      <ExtensionCheckDialog />
      <ManualExtensionReset />
      {children}
    </>
  );
}
