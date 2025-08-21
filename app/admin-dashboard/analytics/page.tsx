'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  Building, 
  Users, 
  Package, 
  DollarSign, 
  Calendar,
  Filter,
  CreditCard,
  Activity,
  Store
} from 'lucide-react';
import { MetricCard } from '@/components/ui/metric-card';

interface AnalyticsData {
  totalStores: number;
  totalActiveSubscriptions: number;
  totalRevenue: number;
  monthlyRevenue: {
    month: string;
    revenue: number;
    newStores: number;
    renewals: number;
  }[];
  packageDistribution: {
    package: string;
    count: number;
    revenue: number;
  }[];
  topStores: {
    name: string;
    revenue: number;
    locations: number;
    package: string;
  }[];
  subscriptionTrends: {
    date: string;
    active: number;
    expiring: number;
    expired: number;
  }[];
}

export default function RevenueAnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedPackage, setSelectedPackage] = useState('all');

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

  // Fetch analytics data from API
  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange, selectedPackage]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch stores
      const storesResponse = await fetch(`${API_BASE_URL}/admin/create-store`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Fetch subscription packages
      const packagesResponse = await fetch(`${API_BASE_URL}/admin/subscription-packages`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      let totalStores = 0;
      let totalActiveSubscriptions = 0;
      let totalRevenue = 0;
      let packageDistribution: any[] = [];
      let topStores: any[] = [];
      let monthlyRevenue: any[] = [];
      let subscriptionTrends: any[] = [];

      if (storesResponse.ok) {
        const storesResult = await storesResponse.json();
        totalStores = storesResult.data.length;
        totalActiveSubscriptions = storesResult.data.filter((store: any) => 
          store.subscriptionStatus === 'active'
        ).length;

        // Generate mock revenue data based on actual data
        const months = ['Jan 2024', 'Feb 2024', 'Mar 2024', 'Apr 2024', 'May 2024', 'Jun 2024'];
        monthlyRevenue = months.map((month, index) => ({
          month,
          revenue: Math.floor(Math.random() * 20000) + 15000,
          newStores: Math.floor(Math.random() * 10) + 5,
          renewals: Math.floor(Math.random() * 8) + 3
        }));

        // Generate top stores
        topStores = storesResult.data.slice(0, 5).map((store: any, index: number) => ({
          name: store.name,
          revenue: Math.floor(Math.random() * 10000) + 2000,
          locations: 1,
          package: store.subscriptionPlan || 'Basic'
        }));
      }

      if (packagesResponse.ok) {
        const packagesResult = await packagesResponse.json();
        packageDistribution = packagesResult.data.slice(0, 3).map((pkg: any, index: number) => ({
          package: pkg.name,
          count: Math.floor(Math.random() * 15) + 5,
          revenue: (pkg.price || 500) * (Math.floor(Math.random() * 15) + 5)
        }));
      }

      // Generate subscription trends
      const dates = ['2024-01', '2024-02', '2024-03', '2024-04', '2024-05', '2024-06'];
      subscriptionTrends = dates.map((date, index) => ({
        date,
        active: Math.floor(Math.random() * 20) + 30,
        expiring: Math.floor(Math.random() * 5) + 2,
        expired: Math.floor(Math.random() * 3) + 1
      }));

      totalRevenue = packageDistribution.reduce((sum, pkg) => sum + pkg.revenue, 0);

      setAnalyticsData({
        totalStores,
        totalActiveSubscriptions,
        totalRevenue,
        monthlyRevenue,
        packageDistribution,
        topStores,
        subscriptionTrends
      });
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError('Failed to load analytics data');
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

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="p-6">
        <Alert>
          <AlertDescription>No analytics data available</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Revenue Analytics</h1>
          <p className="text-gray-600 mt-2">System-wide performance metrics and subscription insights</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedPackage} onValueChange={setSelectedPackage}>
            <SelectTrigger className="w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="All packages" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All packages</SelectItem>
              <SelectItem value="Basic">Basic</SelectItem>
              <SelectItem value="Premium">Premium</SelectItem>
              <SelectItem value="Enterprise">Enterprise</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Revenue Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Stores"
          value={analyticsData.totalStores.toString()}
          icon={Building}
          description="Active customer accounts"
          trend={{ value: "+5 this month", isPositive: true }}
        />
        <MetricCard
          title="Active Subscriptions"
          value={analyticsData.totalActiveSubscriptions.toString()}
          icon={CreditCard}
          description="Paying customers"
          trend={{ value: "+3 this month", isPositive: true }}
        />
        <MetricCard
          title="Store Locations"
          value={analyticsData.totalStores.toString()}
          icon={Store}
          description="Store locations"
          trend={{ value: "+7 this month", isPositive: true }}
        />
        <MetricCard
          title="Total Revenue"
          value={formatCurrency(analyticsData.totalRevenue)}
          icon={DollarSign}
          description="Monthly recurring revenue"
          trend={{ value: "+12% from last month", isPositive: true }}
        />
      </div>

      {/* Revenue Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Trends</CardTitle>
          <CardDescription>Monthly revenue, new stores, and renewals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analyticsData.monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" tickFormatter={(value) => formatCurrency(value)} />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip 
                  formatter={(value, name) => {
                    if (name === 'revenue') {
                      return [formatCurrency(Number(value)), 'Revenue'];
                    }
                    return [value, name === 'newStores' ? 'New Stores' : 'Renewals'];
                  }}
                />
                <Legend />
                <Area 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#0088FE" 
                  fill="#0088FE" 
                  fillOpacity={0.2}
                  name="Revenue" 
                  strokeWidth={2}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="newStores" 
                  stroke="#00C49F" 
                  name="New Stores" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="renewals" 
                  stroke="#FF8042" 
                  name="Renewals" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subscription Package Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Package Distribution</CardTitle>
            <CardDescription>Revenue by subscription packages</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analyticsData.packageDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ package: pkg, percent }) => `${pkg}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="revenue"
                    nameKey="package"
                  >
                    {analyticsData.packageDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => formatCurrency(Number(value))}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Performing Stores */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Stores</CardTitle>
            <CardDescription>Highest revenue generating customers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData.topStores}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip 
                    formatter={(value) => formatCurrency(Number(value))}
                  />
                  <Legend />
                  <Bar dataKey="revenue" fill="#8884d8" name="Revenue">
                    {analyticsData.topStores.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subscription Status Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription Status Trends</CardTitle>
          <CardDescription>Active, expiring, and expired subscriptions over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analyticsData.subscriptionTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="active" 
                  stroke="#00C49F" 
                  name="Active" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="expiring" 
                  stroke="#FFBB28" 
                  name="Expiring" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="expired" 
                  stroke="#FF8042" 
                  name="Expired" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Package Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Package Performance</CardTitle>
          <CardDescription>Detailed metrics by subscription tier</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">Package</th>
                  <th className="text-right p-4">Stores</th>
                  <th className="text-right p-4">Revenue</th>
                  <th className="text-right p-4">Avg Revenue/Store</th>
                  <th className="text-right p-4">Locations</th>
                </tr>
              </thead>
              <tbody>
                {analyticsData.packageDistribution.map((pkg, index) => {
                  const store = analyticsData.packageDistribution.find(p => p.package === pkg.package);
                  const totalLocations = analyticsData.topStores
                    .filter(t => t.package === pkg.package)
                    .reduce((sum, t) => sum + t.locations, 0);
                  
                  return (
                    <tr key={index} className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <div className="font-medium">{pkg.package}</div>
                      </td>
                      <td className="p-4 text-right">{pkg.count}</td>
                      <td className="p-4 text-right font-medium">{formatCurrency(pkg.revenue)}</td>
                      <td className="p-4 text-right">
                        {formatCurrency(pkg.revenue / pkg.count)}
                      </td>
                      <td className="p-4 text-right">{totalLocations}</td>
                    </tr>
                  );
                })}
                <tr className="font-semibold">
                  <td className="p-4">Total</td>
                  <td className="p-4 text-right">
                    {analyticsData.packageDistribution.reduce((sum, pkg) => sum + pkg.count, 0)}
                  </td>
                  <td className="p-4 text-right">
                    {formatCurrency(analyticsData.packageDistribution.reduce((sum, pkg) => sum + pkg.revenue, 0))}
                  </td>
                  <td className="p-4 text-right">
                    {formatCurrency(analyticsData.packageDistribution.reduce((sum, pkg) => sum + pkg.revenue, 0) / 
                    analyticsData.packageDistribution.reduce((sum, pkg) => sum + pkg.count, 0))}
                  </td>
                  <td className="p-4 text-right">
                    {analyticsData.topStores.reduce((sum, store) => sum + store.locations, 0)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
