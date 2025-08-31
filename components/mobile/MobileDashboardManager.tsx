'use client';

import React, { useState } from 'react';
import { MobileLayout } from '../layouts/MobileLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MetricCard } from '@/components/ui/metric-card';
import { Package, AlertTriangle, ShoppingCart, Users, BarChart3, Activity } from 'lucide-react';

type DashboardView = 'overview';

interface MobileDashboardManagerProps {
  initialView?: DashboardView;
}

export function MobileDashboardManager({
  initialView = 'overview'
}: MobileDashboardManagerProps) {
  const [currentView, setCurrentView] = useState<DashboardView>(initialView);

  if (currentView === 'overview') {
    return (
      <div className="p-4 space-y-6">
        {/* Welcome Header */}
        <div className="text-center py-4">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Welcome to your retail management system
          </p>
        </div>

        {/* Quick Stats */}
        <div className="space-y-4">
          <MetricCard
            title="Today's Sales"
            value={`PKR ${`${Math.floor(Math.random() * 100000)}`}`}
            description="Sales from today"
            icon={ShoppingCart}
          />
          <MetricCard
            title="Active Orders"
            value={'0'}
            description="Currently processing"
            icon={Activity}
          />
          <MetricCard
            title="Low Stock Items"
            value={'0'}
            description="Need restocking"
            icon={AlertTriangle}
          />
          <MetricCard
            title="Inventory Value"
            value={`PKR ${`${Math.floor(Math.random() * 500000)}`}`}
            description="Total inventory worth"
            icon={Package}
          />
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
            <CardDescription>Last few operations</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-8">
              No recent activity
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
