'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { AdminHeader } from '@/components/layout/AdminHeader';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [adminUser, setAdminUser] = useState<{ email: string; role: string } | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      // Skip auth check if already on login page or if already authenticated
      if (pathname === '/admin-login' || isAuthenticated) {
        setIsLoading(false);
        return;
      }

      try {
        console.log('Checking authentication...');
        
        // Validate JWT token by making an API call using the new auth API
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'}/auth/admin-login/verify`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Invalid token - Status: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.success) {
          setAdminUser({
            email: result.user.email,
            role: result.user.role
          });
          setIsAuthenticated(true);
          console.log('Authentication successful');
        } else {
          throw new Error('Invalid token');
        }
      } catch (error) {
        console.error('Auth validation error:', error);
        // Clear any existing tokens
        if (typeof document !== 'undefined') {
          document.cookie = 'admin-token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
        }
        // Only redirect if not already on login page
        if (pathname !== '/admin-login') {
          console.log('Redirecting to login page');
          router.push('/admin-login');
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router, pathname, isAuthenticated]);

  const handleLogout = async () => {
    try {
      // Call the logout API endpoint
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'}/auth/admin-login/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        router.push('/admin-login');
        toast({
          title: "Logged Out",
          description: "You have been successfully logged out.",
        });
      } else {
        throw new Error('Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback: clear cookies and redirect
      if (typeof document !== 'undefined') {
        document.cookie = 'admin-token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
      }
      router.push('/admin-login');
      toast({
        title: "Logged Out",
        description: "You have been logged out.",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full flex-col">
        <div className="flex flex-1 overflow-hidden">
          <AppSidebar isAdmin adminUser={adminUser} />
          <div className="flex-1 flex flex-col">
            <AdminHeader adminUser={adminUser} onLogout={handleLogout} />
            <main className="flex-1 overflow-auto p-6 bg-muted/10">
              {children}
            </main>
          </div>
        </div>
      </div>
      <Toaster />
    </SidebarProvider>
  );
}
