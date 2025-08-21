'use client';

import { usePathname } from 'next/navigation';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { Header } from '@/components/layout/Header';
import { Toaster } from '@/components/ui/toaster';

interface DashboardWrapperProps {
  children: React.ReactNode;
}

export function DashboardWrapper({ children }: DashboardWrapperProps) {
  const pathname = usePathname();
  
  // Pages that should not have the dashboard layout
  const publicPages = ['/login', '/admin-login'];
  const isAdminPage = pathname.startsWith('/admin-dashboard');
  const isPublicPage = publicPages.includes(pathname) || isAdminPage;

  if (isPublicPage) {
    return (
      <>
        {children}
        <Toaster />
      </>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 p-6 bg-muted/10">
            {children}
          </main>
        </div>
      </div>
      <Toaster />
    </SidebarProvider>
  );
}
