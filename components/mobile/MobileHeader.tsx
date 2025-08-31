'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { Menu, ArrowLeft, Home, ShoppingCart, Package, BarChart3, Settings, Users, Receipt } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface MobileHeaderProps {
  title: string;
  showBackButton?: boolean;
  className?: string;
}

const navigationItems = [
  {
    title: 'Dashboard',
    url: '/',
    icon: Home,
  },
  {
    title: 'Point of Sale',
    url: '/pos',
    icon: ShoppingCart,
  },
  {
    title: 'Inventory',
    url: '/inventory',
    icon: Package,
  },
  {
    title: 'Orders',
    url: '/orders',
    icon: Receipt,
  },
  {
    title: 'Analytics',
    url: '/analytics',
    icon: BarChart3,
  },
  {
    title: 'Customer Display',
    url: '/customer-display',
    icon: Users,
  },
  {
    title: 'Settings',
    url: '/settings',
    icon: Settings,
  },
];

export function MobileHeader({ title, showBackButton = false, className }: MobileHeaderProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { state, logout } = useAuth();

  const adminUser = state.user ? {
    email: state.user.email,
    role: state.user.role
  } : null;

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Logout Error",
        description: "There was an error logging out.",
        variant: "destructive",
      });
    }
  };

  const handleNavigation = (url: string) => {
    router.push(url);
  };

  return (
    <header className={cn(
      "sticky top-0 z-40 w-full bg-background border-b border-border px-4 py-3",
      className
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {showBackButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="p-1 h-8 w-8"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}

          {/* Mobile logo/brand */}
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">RM</span>
            </div>
            <span className="text-sm font-semibold truncate">
              {title}
            </span>
          </div>
        </div>

        {/* Menu sheet for mobile navigation */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" className="p-1 h-8 w-8">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            {/* Accessibility: SheetTitle required by Radix UI */}
            <SheetTitle className="sr-only">Retail Menu</SheetTitle>

            <div className="flex flex-col space-y-4 mt-6">
              {/* User Info */}
              {adminUser && (
                <div className="flex items-center space-x-3 px-1 py-2">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <div className="h-6 w-6 rounded bg-primary flex items-center justify-center">
                      <span className="text-primary-foreground text-xs font-bold">
                        {adminUser.email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-sm font-medium truncate">{adminUser.email}</span>
                    <span className="text-xs text-muted-foreground capitalize">
                      {adminUser.role?.toLowerCase() || 'user'}
                    </span>
                  </div>
                </div>
              )}

              {/* Navigation Items */}
              <div className="px-1">
                <h3 className="text-sm font-medium mb-3">Navigation</h3>
                <div className="space-y-1">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Button
                        key={item.url}
                        variant="ghost"
                        className="w-full justify-start h-10"
                        onClick={() => handleNavigation(item.url)}
                      >
                        <Icon className="h-4 w-4 mr-3" />
                        <span className="text-sm">{item.title}</span>
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="px-1">
                <h3 className="text-sm font-medium mb-3">Quick Actions</h3>
                <div className="space-y-1">
                  <Button
                    variant="ghost"
                    className="w-full justify-start h-10 text-destructive hover:text-destructive"
                    onClick={handleLogout}
                  >
                    <svg className="h-4 w-4 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span className="text-sm">Logout</span>
                  </Button>
                </div>
              </div>

              {/* System Info */}
              <div className="px-1 pt-4 border-t">
                <div className="text-xs text-muted-foreground">
                  Retail Management v1.0.0
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
