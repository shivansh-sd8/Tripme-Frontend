"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/core/store/auth-context';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireHost?: boolean;
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  requireHost = false,
  redirectTo = '/auth/login',
}) => {
  const { user, isLoading, isAuthenticated, refreshUser } = useAuth();
  const router = useRouter();
  
  // Check if user is a host
  const isHost = user?.role === 'host';

  // Handle SSR - show loading until client-side hydration is complete
  if (typeof window === 'undefined') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-indigo-50 to-violet-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }



  React.useEffect(() => {
    if (!isLoading) {
      if (requireAuth && !isAuthenticated) {
        router.push(redirectTo);
        return;
      }

      if (requireHost && !isHost) {
        // Try to refresh user data once to see if role was updated
        const checkAndRefresh = async () => {
          try {
            await refreshUser(true); // Force refresh to check for role updates
            // Check again after refresh
            if (user?.role === 'host') {
              return; // User is now a host, allow access
            }
          } catch (error) {
            console.error('Error refreshing user data:', error);
          }
          // If refresh didn't work, redirect to unauthorized
          router.push('/unauthorized');
        };
        checkAndRefresh();
        return;
      }
    }
  }, [isLoading, isAuthenticated, isHost, requireAuth, requireHost, redirectTo, router]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-indigo-50 to-violet-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render children if not authenticated (will redirect)
  if (requireAuth && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-indigo-50 to-violet-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // Don't render children if host access required but user is not a host
  if (requireHost && !isHost) {
    return null;
  }
  return <>{children}</>;
};

export default ProtectedRoute; 