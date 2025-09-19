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

// Create context for breadcrumb actions
export const BreadcrumbActionsContext = React.createContext<{
  actions: Record<string, BreadcrumbAction[]>;
  setActions: (page: string, actions: BreadcrumbAction[]) => void;
}>({
  actions: {},
  setActions: () => {},
});

export const useBreadcrumbActions = () => {
  const context = React.useContext(BreadcrumbActionsContext);
  if (!context) {
    throw new Error('useBreadcrumbActions must be used within a BreadcrumbActionsProvider');
  }
  return context;
};

export const useSetBreadcrumbActions = (page: string, actions: BreadcrumbAction[]) => {
  const { setActions } = useBreadcrumbActions();

  React.useEffect(() => {
    setActions(page, actions);
    return () => setActions(page, []); // Cleanup on unmount
  }, [page, actions, setActions]);
};

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

const getDefaultActions = (currentPageKey: string): BreadcrumbAction[] => {
  switch (currentPageKey) {
    case 'orders':
      return [
        { label: 'Date Range', icon: Calendar, variant: 'outline' as const },
        { label: 'Filters', icon: Filter, variant: 'outline' as const },
      ];
    case 'analytics':
      return [
        { label: 'Export', icon: Download, variant: 'outline' as const },
        { label: 'Settings', icon: Settings, variant: 'outline' as const },
      ];
    case 'customers':
      return [
        { label: 'Add Customer', icon: Plus, variant: 'default' as const },
      ];
    default:
      return [];
  }
};

export const BreadcrumbActionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [actions, setActionsState] = React.useState<Record<string, BreadcrumbAction[]>>({});

  const setActions = React.useCallback((page: string, actions: BreadcrumbAction[]) => {
    setActionsState(prev => ({ ...prev, [page]: actions }));
  }, []);

  return (
    <BreadcrumbActionsContext.Provider value={{ actions, setActions }}>
      {children}
    </BreadcrumbActionsContext.Provider>
  );
};

export function Breadcrumbs() {
  const pathname = usePathname();
  const { actions: customActions } = useBreadcrumbActions();

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

  // Get actions for current path from context or defaults
  const currentPageKey = pathSegments[pathSegments.length - 1] || '';
  const customPageActions = customActions ? customActions[currentPageKey] : undefined;
  const pageActions = customPageActions || getDefaultActions(currentPageKey);

  return (
    <div className="flex items-center justify-between">
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
          {pageActions.map((action: BreadcrumbAction, index: number) => (
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
