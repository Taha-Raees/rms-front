'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, TrendingUp, Activity, DollarSign } from 'lucide-react';
import { MetricCard } from '@/components/ui/metric-card';

type AnalyticsView = 'overview';

interface MobileAnalyticsManagerProps {
  initialView?: AnalyticsView;
}

export function MobileAnalyticsManager({
  initialView = 'overview'
}: MobileAnalyticsManagerProps) {
  const [currentView, setCurrentView] = useState<AnalyticsView>(initialView);

  if (currentView === 'overview') {
    return (
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="text-center py-4">
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Sales performance and insights
          </p>
        </div>

        {/* Metrics Cards */}
        <div className="space-y-4">
          <MetricCard
            title="Today's Revenue"
            value={`PKR ${Math.floor(Math.random() * 50000)}`}
            description="Orders processed today"
            icon={DollarSign}
          />
          <MetricCard
            title="Weekly Growth"
            value={`${Math.floor(Math.random() * 25)}%`}
            description="Compared to last week"
            icon={TrendingUp}
          />
          <MetricCard
            title="Active Orders"
            value={Math.floor(Math.random() * 10).toString()}
            description="Currently in progress"
            icon={Activity}
          />
          <MetricCard
            title="Best Seller"
            value="Sample Product"
            description="Most popular item"
            icon={BarChart}
          />
        </div>

        {/* Charts Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Revenue Trends</CardTitle>
            <CardDescription>Daily sales over the past week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-32 bg-muted/50 rounded flex items-center justify-center">
              <BarChart className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Products</CardTitle>
            <CardDescription>Best performing items</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-8">
              No data available
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
