'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  BarChart3, 
  Settings, 
  Users, 
  Receipt, 
  AlertTriangle,
  Home,
  Building,
  CreditCard,
  DollarSign
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/contexts/AppContext';

interface NavigationItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  description?: string;
}

const storeNavigationItems: NavigationItem[] = [
  {
    title: 'Dashboard',
    url: '/',
    icon: LayoutDashboard,
  },
  {
    title: 'Point of Sale',
    url: '/pos',
    icon: ShoppingCart,
    badge: 'New',
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
    badge: 'Live',
  },
];

const storeManagementItems: NavigationItem[] = [
  {
    title: 'Settings',
    url: '/settings',
    icon: Settings,
  },
];

const adminNavigationItems: NavigationItem[] = [
  {
    title: 'Dashboard',
    url: '/admin-dashboard',
    icon: Home,
    description: 'System overview and statistics'
  },
  {
    title: 'Stores',
    url: '/admin-dashboard/stores',
    icon: Building,
    description: 'Manage stores'
  },
  {
    title: 'Subscription Packages',
    url: '/admin-dashboard/packages',
    icon: CreditCard,
    description: 'Manage subscription packages'
  },
  {
    title: 'Revenue Analytics',
    url: '/admin-dashboard/analytics',
    icon: BarChart3,
    description: 'Revenue and performance analytics'
  },
  {
    title: 'System Users',
    url: '/admin-dashboard/users',
    icon: Users,
    description: 'Manage system administrators'
  },
  {
    title: 'System Settings',
    url: '/admin-dashboard/settings',
    icon: Settings,
    description: 'Configure system settings'
  }
];

interface AppSidebarProps {
  isAdmin?: boolean;
  adminUser?: { email: string; role: string } | null;
}

export function AppSidebar({ isAdmin = false, adminUser = null }: AppSidebarProps) {
  const pathname = usePathname();
  const { state } = useApp();
  const { products, store } = state;

  // Calculate low stock items (for store mode)
  const lowStockCount = products.filter(p => p.stock <= p.lowStockThreshold).length;

  const navigationItems = isAdmin ? adminNavigationItems : storeNavigationItems;
  const managementItems = isAdmin ? [] : storeManagementItems;

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            {isAdmin ? (
              <Building className="h-4 w-4 text-primary-foreground" />
            ) : (
              <span className="text-primary-foreground font-bold text-sm">
                {store?.name.charAt(0) || 'RS'}
              </span>
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">
              {isAdmin ? 'System Admin' : (store?.name || 'Retail System')}
            </span>
            <span className="text-xs text-muted-foreground">
              {isAdmin ? 'Retail Management' : 'v1.0.0'}
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{isAdmin ? 'Navigation' : 'Main Navigation'}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.url;
                
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.url}>
                        <Icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {!isAdmin && managementItems.length > 0 && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel>Management</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {managementItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.url;
                    
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild isActive={isActive}>
                          <Link href={item.url}>
                            <Icon className="h-4 w-4" />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}

        {isAdmin && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel>Quick Stats</SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="space-y-2 px-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Building className="h-4 w-4 text-blue-600" />
                      <span className="text-sm">Total Stores</span>
                    </div>
                    <Badge variant="outline">0</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Active Users</span>
                    </div>
                    <Badge variant="outline">0</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-purple-600" />
                      <span className="text-sm">Monthly Revenue</span>
                    </div>
                    <Badge variant="outline">PKR 0</Badge>
                  </div>
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}

        {!isAdmin && lowStockCount > 0 && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel className="text-yellow-600">
                <AlertTriangle className="h-4 w-4 mr-1" />
                Alerts
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="px-2 py-2 text-sm text-muted-foreground">
                  {lowStockCount} item{lowStockCount > 1 ? 's' : ''} running low on stock
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>

      <SidebarFooter>
        <div className="px-2 py-2 text-xs text-muted-foreground">
          © 2024 Retail Management System
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
