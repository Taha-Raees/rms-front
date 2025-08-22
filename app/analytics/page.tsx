'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { LineChart, BarChart, DollarSign, ShoppingCart, Users, TrendingUp, TrendingDown, Package, AlertTriangle } from 'lucide-react';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { MetricCard } from '@/components/ui/metric-card';
import { useToast } from '@/hooks/use-toast';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { analyticsApi } from '@/lib/api';

// Import Recharts components
import {
  LineChart as RechartsLineChart,
  BarChart as RechartsBarChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export default function AnalyticsPage() {
  const { toast } = useToast();
  const { state: authState } = useAuth();
  const { state } = useApp();
  const { store } = state;

  const [loading, setLoading] = useState(true);
  const [totalSales, setTotalSales] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [topCategory, setTopCategory] = useState('');
  const [salesTrendValue, setSalesTrendValue] = useState('');
  const [salesTrendPositive, setSalesTrendPositive] = useState(true);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [productSalesData, setProductSalesData] = useState<any[]>([]);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Fetch analytics data from API
      const result = await analyticsApi.getDashboardData();
      
      if (result.success && result.data) {
        const data = result.data;
        
        setTotalSales(data.totalRevenue || 0);
        setTotalOrders(data.totalOrders || 0);
        setTopCategory(data.topCategory || '');
        
        // Calculate sales trend (simplified)
        setSalesTrendValue('+0%');
        setSalesTrendPositive(true);

        // Process sales data for charts
        if (data.salesByMonth) {
          const chartData = data.salesByMonth.map((item: any) => ({
            month: new Date(item.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            totalSales: parseFloat(item.totalsales) || 0,
            orderCount: parseInt(item.ordercount) || 0
          }));
          setSalesData(chartData);
        }

        // Process product sales data for charts
        if (data.productSalesDistribution) {
          const productData = data.productSalesDistribution.map((item: any) => ({
            name: item.name,
            totalQuantitySold: parseInt(item.totalquantitysold) || 0,
            totalRevenue: parseFloat(item.totalrevenue) || 0
          }));
          setProductSalesData(productData);
        }
      }
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch analytics data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs />

      <h2 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h2>
      <p className="text-muted-foreground">Gain insights into your store's performance and make data-driven decisions.</p>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Revenue"
          value={`${store?.currencySymbol || 'PKR'} ${totalSales.toLocaleString()}`}
          description="Overall sales generated"
          icon={DollarSign}
          trend={{ value: salesTrendValue, isPositive: salesTrendPositive }}
          className="bg-white shadow-sm"
        />
        <MetricCard
          title="Orders Completed"
          value={totalOrders}
          description="Total successful transactions"
          icon={ShoppingCart}
          trend={{ value: '+0%', isPositive: true }}
          className="bg-white shadow-sm"
        />
        <MetricCard
          title="Top Category"
          value={topCategory}
          description="Best performing product category"
          icon={Package}
          className="bg-white shadow-sm"
        />
        <MetricCard
          title="Avg. Order Value"
          value={`${store?.currencySymbol || 'PKR'} ${(totalOrders > 0 ? (totalSales / totalOrders).toFixed(2) : '0.00')}`}
          description="Average amount per order"
          icon={TrendingUp}
          className="bg-white shadow-sm"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Over Time Chart */}
        <Card className="rounded-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="h-5 w-5" />
              Sales Over Time
            </CardTitle>
            <CardDescription>Monthly revenue trends</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-64 bg-muted rounded animate-pulse flex items-center justify-center">
                <p className="text-muted-foreground">Loading chart...</p>
              </div>
            ) : salesData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`PKR ${Number(value).toLocaleString()}`, 'Sales']} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="totalSales" 
                      stroke="#8884d8" 
                      name="Total Sales"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center">
                <p className="text-muted-foreground">No sales data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Product Sales Distribution Chart */}
        <Card className="rounded-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5" />
              Product Sales Distribution
            </CardTitle>
            <CardDescription>Top selling products by units</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-64 bg-muted rounded animate-pulse flex items-center justify-center">
                <p className="text-muted-foreground">Loading chart...</p>
              </div>
            ) : productSalesData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={productSalesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [Number(value).toLocaleString(), 'Quantity']} />
                    <Legend />
                    <Bar 
                      dataKey="totalQuantitySold" 
                      fill="#8884d8" 
                      name="Units Sold"
                    />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center">
                <p className="text-muted-foreground">No product sales data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Additional Analytics Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="rounded-sm">
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
            <CardDescription>Best performing items by revenue</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-8 bg-muted rounded animate-pulse"></div>
                ))}
              </div>
            ) : productSalesData.length > 0 ? (
              <div className="space-y-3">
                {productSalesData.slice(0, 5).map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-2 hover:bg-muted rounded">
                    <div className="font-medium text-sm">{product.name}</div>
                    <div className="text-right">
                      <div className="font-semibold text-sm">
                        {store?.currencySymbol || 'PKR'} {product.totalRevenue.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {product.totalQuantitySold} units
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">No product data available</p>
            )}
          </CardContent>
        </Card>
        
        <Card className="rounded-sm">
          <CardHeader>
            <CardTitle>Category Performance</CardTitle>
            <CardDescription>Sales by product category</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-8 bg-muted rounded animate-pulse"></div>
                ))}
              </div>
            ) : productSalesData.length > 0 ? (
              <div className="space-y-3">
                {productSalesData.slice(0, 5).map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-2 hover:bg-muted rounded">
                    <div className="font-medium text-sm">{product.name}</div>
                    <div className="text-right">
                      <div className="font-semibold text-sm">
                        {store?.currencySymbol || 'PKR'} {product.totalRevenue.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">No category data available</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
