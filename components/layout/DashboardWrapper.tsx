'use client';

import { usePathname } from 'next/navigation';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { Header } from '@/components/layout/Header';
import { MobileLayout } from '@/components/layouts/MobileLayout';
import { Toaster } from '@/components/ui/toaster';
import { useDeviceAdaptive } from '@/hooks/use-device-adaptive';

interface DashboardWrapperProps {
  children: React.ReactNode;
}

export function DashboardWrapper({ children }: DashboardWrapperProps) {
  const pathname = usePathname();
  const { shouldUseMobileView } = useDeviceAdaptive();

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

  // Mobile experience
  if (shouldUseMobileView) {
    const getPageTitle = () => {
      if (pathname === '/') return 'Dashboard';
      if (pathname === '/pos') return 'Point of Sale';
      if (pathname === '/inventory') return 'Inventory';
      if (pathname === '/orders') return 'Orders';
      if (pathname === '/analytics') return 'Analytics';
      if (pathname === '/customer-display') return 'Customer Display';
      if (pathname === '/settings') return 'Settings';
      return 'Retail System';
    };

    return (
      <MobileLayout
        title={getPageTitle()}
        showCartInBottom={pathname === '/pos'}
      >
        {children}
        <Toaster />
      </MobileLayout>
    );
  }

  // Desktop layout (unchanged)
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
