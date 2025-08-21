'use client';

import React from 'react';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

interface BreadcrumbItemConfig {
  title: string;
  href?: string;
}

interface AdminBreadcrumbsProps {
  items?: BreadcrumbItemConfig[];
}

export function AdminBreadcrumbs({ items }: AdminBreadcrumbsProps) {
  const pathname = usePathname();
  
  // Default breadcrumb items based on current path
  const defaultItems: BreadcrumbItemConfig[] = [
    { title: 'Dashboard', href: '/admin-dashboard' }
  ];

  // Add current page based on pathname
  const currentPage = pathname.split('/').pop() || '';
  const currentPageTitle = currentPage
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  if (currentPage && currentPage !== 'admin-dashboard') {
    defaultItems.push({ title: currentPageTitle });
  }

  const breadcrumbItems = items || defaultItems;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/admin-dashboard">Home</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        {breadcrumbItems.map((item, index) => (
          <React.Fragment key={index}>
            <BreadcrumbItem>
              {item.href ? (
                <BreadcrumbLink asChild>
                  <Link href={item.href}>{item.title}</Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{item.title}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
            {index < breadcrumbItems.length - 1 && <BreadcrumbSeparator />}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
