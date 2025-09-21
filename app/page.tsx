'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Package, Users, CreditCard, TrendingUp, TrendingDown, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

import { MetricCard } from '@/components/ui/metric-card';
import { useToast } from '@/hooks/use-toast';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { ordersApi, productsApi, inventoryApi, analyticsApi } from '@/lib/api';
import { Order, Product } from '@/lib/types';

export default function DashboardPage() {
  const router = useRouter();
  const { state: authState } = useAuth();
  const { toast } = useToast();
  const { state } = useApp();
  const { store } = state;

  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [topSellingProducts, setTopSellingProducts] = useState<Product[]>([]);
  const [inventoryAlerts, setInventoryAlerts] = useState<Product[]>([]);
  const [dashboardMetrics, setDashboardMetrics] = useState({
    totalSales: 0,
    totalOrders: 0,
    avgOrderValue: '0.00',
    salesTrend: '+0%',
    salesTrendPositive: true
  });
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get storeId from auth context
      const storeId = authState.store?.id;
      
      // Fetch data from APIs
      const [analyticsResult, ordersResult, inventoryResult] = await Promise.all([
        analyticsApi.getDashboardData(),
        ordersApi.getAll(),
        inventoryApi.getAlerts(),
      ]);

      if (analyticsResult.success && analyticsResult.data) {
        const data = analyticsResult.data;
        // Use analytics data for metrics
        setDashboardMetrics({
          totalSales: data.totalRevenue || 0,
          totalOrders: data.totalOrders || 0,
          avgOrderValue: data.totalOrders > 0 ? ((data.totalRevenue || 0) / data.totalOrders).toFixed(2) : '0.00',
          salesTrend: '+0%',
          salesTrendPositive: true
        });
        
        // Use analytics data for top selling products
        if (data.topSellingProducts) {
          setTopSellingProducts(data.topSellingProducts);
        }
      }
      
      if (ordersResult.success && ordersResult.data) {
        setRecentOrders(ordersResult.data.slice(0, 5)); // Get top 5 recent orders
      }
      
      if (inventoryResult.success && inventoryResult.data) {
        setInventoryAlerts(inventoryResult.data.filter((p) => p.stock <= p.lowStockThreshold));
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authState.isAuthenticated && !authState.isLoading) {
      router.push('/login');
    }
  }, [authState.isAuthenticated, authState.isLoading, router]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Show loading state while checking auth
  if (authState.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Show nothing if not authenticated (redirect will happen)
  if (!authState.isAuthenticated) {
    return null;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      <p className="text-muted-foreground">Welcome back, {store?.name || 'Admin'}! Here's an overview of your store's performance.</p>

      {/* Metric Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Sales"
          value={`${store?.currencySymbol || 'PKR'} ${dashboardMetrics.totalSales.toLocaleString()}`}
          description="Overall revenue generated"
          icon={DollarSign}
          trend={{ value: dashboardMetrics.salesTrend, isPositive: dashboardMetrics.salesTrendPositive }}
        />
        <MetricCard
          title="Orders Completed"
          value={dashboardMetrics.totalOrders}
          description="Total successful transactions"
          icon={CheckCircle}
          trend={{ value: '+5%', isPositive: true }}
        />
        <MetricCard
          title="Average Order Value"
          value={`${store?.currencySymbol || 'PKR'} ${dashboardMetrics.avgOrderValue}`}
          description="Average amount per order"
          icon={CreditCard}
        />
        <MetricCard
          title="Inventory Alerts"
          value={inventoryAlerts.length}
          description="Products needing attention"
          icon={AlertTriangle}
          badge={inventoryAlerts.length > 0 ? { text: 'Action Required', variant: 'warning' } : undefined}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card className="rounded-sm">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest transactions in your store</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-12 bg-muted rounded animate-pulse"></div>
                ))}
              </div>
            ) : recentOrders.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No recent orders.</p>
            ) : (
              <div className="space-y-4">
                {recentOrders.map(order => (
                  <div key={order.id} className="flex items-center justify-between p-3 border rounded-md">
                    <div>
                      <p className="font-medium">Order #{order.orderNumber}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleString()} • {order.items.length} items
                      </p>
                    </div>
                    <div className="text-lg font-semibold">
                      {store?.currencySymbol || 'PKR'} {order.total.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Selling Products */}
        <Card className="rounded-sm">
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
            <CardDescription>Products with the highest sales volume</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-12 bg-muted rounded animate-pulse"></div>
                ))}
              </div>
            ) : topSellingProducts.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No top selling products.</p>
            ) : (
              <div className="space-y-4">
                {topSellingProducts.map(product => (
                  <div key={product.id} className="flex items-center justify-between p-3 border rounded-md">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">{product.category}</p>
                    </div>
                    <div className="text-lg font-semibold">
                      {store?.currencySymbol || 'PKR'} {product.basePrice.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
