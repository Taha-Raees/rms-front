'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Building, 
  Users, 
  Package, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  Plus,
  Settings,
  CreditCard,
  Store
} from 'lucide-react';
import { MetricCard } from '@/components/ui/metric-card';
import { AdminBreadcrumbs } from '@/components/layout/AdminBreadcrumbs';
import { adminApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function AdminDashboardPage() {
  const { toast } = useToast();
  const [stats, setStats] = useState({
    totalStores: 0,
    totalActiveSubscriptions: 0,
    totalRevenue: 0,
    totalUsers: 0,
    subscriptionDistribution: [] as any[],
    recentStores: [] as any[]
  });

  const [loading, setLoading] = useState(true);

  // Fetch dashboard data from API
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch admin dashboard data
      const dashboardResult = await adminApi.getDashboardData();
      
      if (dashboardResult.success && dashboardResult.data) {
        const data = dashboardResult.data;
        setStats({
          totalStores: data.totalStores || 0,
          totalActiveSubscriptions: data.totalActiveSubscriptions || 0,
          totalRevenue: data.totalRevenue || 0,
          totalUsers: data.totalUsers || 0,
          subscriptionDistribution: data.subscriptionDistribution || [],
          recentStores: data.recentStores || []
        });
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      toast({
        title: "Error",
        description: "Failed to fetch dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminBreadcrumbs />
      <div>
        <h1 className="text-3xl font-bold text-gray-900">System Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to the system administration dashboard</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Stores"
          value={stats.totalStores.toString()}
          icon={Building}
          description="Active customer accounts"
        />
        <MetricCard
          title="Active Subscriptions"
          value={stats.totalActiveSubscriptions.toString()}
          icon={CreditCard}
          description="Paying customers"
        />
        <MetricCard
          title="Total Users"
          value={stats.totalUsers.toString()}
          icon={Users}
          description="System users"
        />
        <MetricCard
          title="Monthly Revenue"
          value={formatCurrency(stats.totalRevenue)}
          icon={DollarSign}
          description="Recurring revenue"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subscription Distribution */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Subscription Distribution</CardTitle>
            <CardDescription>Revenue by package tiers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.subscriptionDistribution.length > 0 ? (
                stats.subscriptionDistribution.map((item: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-md">
                    <div>
                      <div className="font-medium">{item.package}</div>
                      <div className="text-sm text-muted-foreground">
                        {item.count} {item.count === 1 ? 'store' : 'stores'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(item.revenue)}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatCurrency(item.revenue / item.count)}/store avg
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">No subscription data available</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Current system health</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm font-medium">Database</span>
                </div>
                <Badge variant="secondary">Online</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm font-medium">API Server</span>
                </div>
                <Badge variant="secondary">Online</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm font-medium">Authentication</span>
                </div>
                <Badge variant="secondary">Online</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                  <span className="text-sm font-medium">Backup</span>
                </div>
                <Badge variant="outline">Pending</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Stores */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Stores</CardTitle>
            <CardDescription>Newly created stores</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentStores.length > 0 ? (
                stats.recentStores.map((store: any) => (
                  <div key={store.id} className="flex items-center justify-between p-3 border rounded-md">
                    <div>
                      <div className="font-medium">{store.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Owner: {store.owner?.name || store.owner?.email}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">
                        {new Date(store.createdAt).toLocaleDateString()}
                      </div>
                      <Badge variant="outline" className="mt-1">
                        {store.subscriptionStatus || 'active'}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">No recent stores</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3">
              <button 
                className="p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors"
                onClick={() => window.location.href = '/admin-dashboard/stores'}
              >
                <div className="flex items-center space-x-2">
                  <Plus className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">Create Store</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">Add a new customer store</p>
              </button>
              <button 
                className="p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors"
                onClick={() => window.location.href = '/admin-dashboard/users'}
              >
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-green-600" />
                  <span className="font-medium">Manage Users</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">Create and manage system users</p>
              </button>
              <button 
                className="p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors"
                onClick={() => window.location.href = '/admin-dashboard/packages'}
              >
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5 text-purple-600" />
                  <span className="font-medium">Manage Packages</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">Configure subscription packages</p>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
