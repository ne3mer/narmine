'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAdmin, isAuthenticated, getUserFromStorage } from '@/lib/auth';

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminAccess = () => {
      // Wait for client-side hydration
      if (typeof window === 'undefined') {
        setLoading(true);
        return;
      }

      const authenticated = isAuthenticated();
      const admin = isAdmin();

      if (!authenticated) {
        // Not logged in - redirect to login
        router.push('/login?redirect=/admin');
        setIsAuthorized(false);
        setLoading(false);
        return;
      }

      if (!admin) {
        // Logged in but not admin - redirect to account
        router.push('/account');
        setIsAuthorized(false);
        setLoading(false);
        return;
      }

      // User is admin - allow access
      setIsAuthorized(true);
      setLoading(false);
    };

    // Small delay to ensure localStorage is accessible
    const timer = setTimeout(checkAdminAccess, 100);
    return () => clearTimeout(timer);
  }, [router]);

  if (loading || isAuthorized === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-500"></div>
          <p className="mt-4 text-sm text-slate-500">در حال بررسی دسترسی...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null; // Redirect is happening
  }

  return <>{children}</>;
}

