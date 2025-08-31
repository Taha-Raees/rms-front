'use client';

import React from 'react';
import { MobileHeader } from '../mobile/MobileHeader';
import { cn } from '@/lib/utils';

interface MobileLayoutProps {
  children: React.ReactNode;
  title: string;
  showBackButton?: boolean;
  className?: string;
  headerClassName?: string;
  showCartInBottom?: boolean;
}

export function MobileLayout({
  children,
  title,
  showBackButton = false,
  className,
  headerClassName,
  showCartInBottom = false
}: MobileLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Mobile Header - fixed at top */}
      <MobileHeader
        title={title}
        showBackButton={showBackButton}
        className={headerClassName}
      />

      {/* Main Content - scrollable with bottom space for cart */}
      <main className={cn(
        "flex-1 overflow-auto bg-background",
        showCartInBottom ? "pb-20" : "pb-4",
        className
      )}>
        {children}
      </main>
    </div>
  );
}

// Alternative layout for full-screen content (no bottom padding needed)
export function MobileFullScreenLayout({
  children,
  title,
  showBackButton = false,
  className,
  headerClassName
}: Omit<MobileLayoutProps, 'showCartInBottom'>) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Mobile Header - fixed at top */}
      <MobileHeader
        title={title}
        showBackButton={showBackButton}
        className={headerClassName}
      />

      {/* Full screen content - no bottom padding needed */}
      <main className={cn(
        "flex-1 overflow-auto bg-background pb-4",
        className
      )}>
        {children}
      </main>
    </div>
  );
}
