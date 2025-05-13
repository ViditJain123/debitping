'use client';

import Link from 'next/link';
import { Suspense } from 'react';

export default function NotFound() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8 text-center">
          <h1 className="text-4xl font-bold">404 - Page Not Found</h1>
          <p className="mt-4 text-lg">Sorry, the page you're looking for doesn't exist.</p>
          <div className="mt-8">
            <Link 
              href="/" 
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
            >
              Go back home
            </Link>
          </div>
        </div>
      </div>
    </Suspense>
  );
}
