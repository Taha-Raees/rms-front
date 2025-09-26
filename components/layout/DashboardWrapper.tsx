'use client';

import { usePathname } from 'next/navigation';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { MobileLayout } from '@/components/layouts/MobileLayout';
import { Toaster } from '@/components/ui/toaster';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { useDeviceAdaptive } from '@/hooks/use-device-adaptive';
import { Bell, User, LogOut, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import FloatingChat from '@/components/chat/FloatingChat';

interface DashboardWrapperProps {
  children: React.ReactNode;
}

export function DashboardWrapper({ children }: DashboardWrapperProps) {
  const pathname = usePathname();
  const { shouldUseMobileView } = useDeviceAdaptive();
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    if (confirm('Are you sure you want to logout?')) {
      await logout();
    }
  };

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

  // Desktop layout
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b px-6 py-3">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div className="flex-1">
                <Breadcrumbs />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  className="transition-colors duration-200"
                >
                  {theme === 'dark' ? (
                    <Sun className="h-5 w-5 text-yellow-400" />
                  ) : (
                    <Moon className="h-5 w-5" />
                  )}
                </Button>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                  >
                    3
                  </Badge>
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Bell className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600" onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>
          <main className="flex-1 p-6 bg-muted/10">
            {children}
          </main>
        </div>
      </div>
      <Toaster />
      <FloatingChat />
    </SidebarProvider>
  );
}
