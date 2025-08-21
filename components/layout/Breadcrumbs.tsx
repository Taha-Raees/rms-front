'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home, Plus, Calendar, Download, Filter, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbAction {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
  href?: string;
  variant?: 'default' | 'outline' | 'secondary';
}

const pathLabels: Record<string, string> = {
  '': 'Dashboard',
  'pos': 'Point of Sale',
  'inventory': 'Inventory',
  'orders': 'Orders',
  'analytics': 'Analytics',
  'customers': 'Customers',
  'customer-display': 'Customer Display',
  'settings': 'Settings',
};

const pathActions: Record<string, BreadcrumbAction[]> = {
  'inventory': [
    { label: 'Add Product', icon: Plus, variant: 'default' },
  ],
  'orders': [
    { label: 'Date Range', icon: Calendar, variant: 'outline' },
    { label: 'Filters', icon: Filter, variant: 'outline' },
  ],
  'analytics': [
    { label: 'Export', icon: Download, variant: 'outline' },
    { label: 'Settings', icon: Settings, variant: 'outline' },
  ],
  'customers': [
    { label: 'Add Customer', icon: Plus, variant: 'default' },
  ],
};

interface BreadcrumbsProps {
  actions?: BreadcrumbAction[];
}

export function Breadcrumbs({ actions }: BreadcrumbsProps) {
  const pathname = usePathname();
  
  const pathSegments = pathname.split('/').filter(Boolean);
  
  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', href: '/' },
  ];

  let currentPath = '';
  pathSegments.forEach((segment) => {
    currentPath += `/${segment}`;
    const label = pathLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
    breadcrumbs.push({
      label,
      href: currentPath,
    });
  });

  // Get actions for current path
  const currentPageKey = pathSegments[pathSegments.length - 1] || '';
  const pageActions = actions || pathActions[currentPageKey] || [];

  return (
    <div className="flex items-center justify-between mb-6">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-1 text-sm text-muted-foreground">
        {breadcrumbs.map((breadcrumb, index) => (
          <React.Fragment key={breadcrumb.href || breadcrumb.label}>
            {index > 0 && <ChevronRight className="h-4 w-4" />}
            {index === 0 ? (
              <Link
                href={breadcrumb.href!}
                className="flex items-center hover:text-foreground transition-colors"
              >
                <Home className="h-4 w-4" />
              </Link>
            ) : index === breadcrumbs.length - 1 ? (
              <span className="text-foreground font-medium">{breadcrumb.label}</span>
            ) : (
              <Link
                href={breadcrumb.href!}
                className="hover:text-foreground transition-colors"
              >
                {breadcrumb.label}
              </Link>
            )}
          </React.Fragment>
        ))}
      </nav>

      {/* Action Buttons */}
      {pageActions.length > 0 && (
        <div className="flex items-center gap-2">
          {pageActions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant || 'outline'}
              size="sm"
              onClick={action.onClick}
              asChild={!!action.href}
            >
              {action.href ? (
                <Link href={action.href}>
                  <action.icon className="h-4 w-4 mr-2" />
                  {action.label}
                </Link>
              ) : (
                <>
                  <action.icon className="h-4 w-4 mr-2" />
                  {action.label}
                </>
              )}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}

export default Breadcrumbs;
