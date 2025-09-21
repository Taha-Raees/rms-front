'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, Users, Package, Clock, BarChart3, PieChart, Activity } from 'lucide-react';
import {
  LineChart as RechartsLineChart,
  BarChart as RechartsBarChart,
  AreaChart,
  PieChart as RechartsPieChart,
  Line,
  Bar,
  Area,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

// Chart colors
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ComponentType<any>;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  className?: string;
}

export function AdvancedMetricCard({ title, value, description, icon: Icon, trend, className }: MetricCardProps) {
  return (
    <Card className={`rounded-sm ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend && (
          <div className="flex items-center mt-2">
            {trend.isPositive ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
            <span
              className={`text-xs font-medium ml-1 ${
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {trend.value}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function RevenueTrendChart({ data, title = "Revenue Trends", height = 300 }: {
  data: Array<{ date: string; revenue: number; orders: number }>;
  title?: string;
  height?: number;
}) {
  return (
    <Card className="rounded-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>Revenue and order trends over time</CardDescription>
      </CardHeader>
      <CardContent>
        <div style={{ width: '100%', height }}>
          <ResponsiveContainer>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={(value: number, name: string) => [
                  name === 'revenue' ? `PKR ${value.toLocaleString()}` : value.toLocaleString(),
                  name === 'revenue' ? 'Revenue' : 'Orders'
                ]}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.3}
                name="revenue"
              />
              <Area
                type="monotone"
                dataKey="orders"
                stroke="#82ca9d"
                fill="#82ca9d"
                fillOpacity={0.3}
                name="orders"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function PaymentMethodChart({ data, title = "Revenue by Payment Method", height = 300 }: {
  data: Array<{ paymentMethod: string; revenue: number; transactionCount: number }>;
  title?: string;
  height?: number;
}) {
  return (
    <Card className="rounded-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChart className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>Revenue distribution across payment methods</CardDescription>
      </CardHeader>
      <CardContent>
        <div style={{ width: '100%', height }}>
          <ResponsiveContainer>
            <RechartsPieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="revenue"
                nameKey="paymentMethod"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`PKR ${Number(value).toLocaleString()}`, 'Revenue']} />
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function ProductPerformanceChart({ data, title = "Product Performance", height = 300 }: {
  data: Array<{
    name: string;
    totalRevenue: number;
    totalSold: number;
    totalProfit: number;
    profitMargin: number;
  }>;
  title?: string;
  height?: number;
}) {
  return (
    <Card className="rounded-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>Top products by revenue performance</CardDescription>
      </CardHeader>
      <CardContent>
        <div style={{ width: '100%', height }}>
          <ResponsiveContainer>
            <RechartsBarChart data={data.slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value: number, name: string) => [
                  name === 'totalRevenue' ? `PKR ${value.toLocaleString()}` :
                  name === 'totalProfit' ? `PKR ${value.toLocaleString()}` :
                  name === 'profitMargin' ? `${value.toFixed(1)}%` : value.toLocaleString(),
                  name === 'totalRevenue' ? 'Revenue' :
                  name === 'totalProfit' ? 'Profit' :
                  name === 'profitMargin' ? 'Profit Margin' : 'Units Sold'
                ]}
              />
              <Bar dataKey="totalRevenue" fill="#8884d8" name="totalRevenue" />
              <Bar dataKey="totalProfit" fill="#82ca9d" name="totalProfit" />
            </RechartsBarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function CustomerSegmentChart({ data, title = "Customer Segmentation", height = 300 }: {
  data: Array<{
    segment: string;
    customerCount: number;
    totalRevenue: number;
    avgCustomerValue: number;
  }>;
  title?: string;
  height?: number;
}) {
  return (
    <Card className="rounded-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>Customer distribution by value segments</CardDescription>
      </CardHeader>
      <CardContent>
        <div style={{ width: '100%', height }}>
          <ResponsiveContainer>
            <RechartsBarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="segment" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value: number, name: string) => [
                  name === 'totalRevenue' ? `PKR ${value.toLocaleString()}` :
                  name === 'avgCustomerValue' ? `PKR ${value.toLocaleString()}` : value.toLocaleString(),
                  name === 'totalRevenue' ? 'Total Revenue' :
                  name === 'avgCustomerValue' ? 'Avg Customer Value' : 'Customer Count'
                ]}
              />
              <Bar dataKey="customerCount" fill="#8884d8" name="customerCount" />
              <Bar dataKey="totalRevenue" fill="#82ca9d" name="totalRevenue" />
            </RechartsBarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function HourlySalesPatternChart({ data, title = "Hourly Sales Pattern", height = 300 }: {
  data: Array<{ hour: number; orderCount: number; totalRevenue: number; avgOrderValue: number }>;
  title?: string;
  height?: number;
}) {
  return (
    <Card className="rounded-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>Sales patterns throughout the day</CardDescription>
      </CardHeader>
      <CardContent>
        <div style={{ width: '100%', height }}>
          <ResponsiveContainer>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="hour"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `${value}:00`}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                labelFormatter={(value) => `${value}:00`}
                formatter={(value: number, name: string) => [
                  name === 'totalRevenue' ? `PKR ${value.toLocaleString()}` : value.toLocaleString(),
                  name === 'totalRevenue' ? 'Revenue' : 'Orders'
                ]}
              />
              <Area
                type="monotone"
                dataKey="totalRevenue"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.6}
                name="totalRevenue"
              />
              <Line
                type="monotone"
                dataKey="orderCount"
                stroke="#ff7300"
                strokeWidth={2}
                dot={{ r: 4 }}
                name="orderCount"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function WeeklySalesPatternChart({ data, title = "Weekly Sales Pattern", height = 300 }: {
  data: Array<{ dayOfWeek: number; dayName: string; orderCount: number; totalRevenue: number }>;
  title?: string;
  height?: number;
}) {
  return (
    <Card className="rounded-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>Sales patterns by day of week</CardDescription>
      </CardHeader>
      <CardContent>
        <div style={{ width: '100%', height }}>
          <ResponsiveContainer>
            <RechartsBarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="dayName" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value: number, name: string) => [
                  name === 'totalRevenue' ? `PKR ${value.toLocaleString()}` : value.toLocaleString(),
                  name === 'totalRevenue' ? 'Revenue' : 'Orders'
                ]}
              />
              <Bar dataKey="orderCount" fill="#8884d8" name="orderCount" />
              <Bar dataKey="totalRevenue" fill="#82ca9d" name="totalRevenue" />
            </RechartsBarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function ProfitMarginChart({ data, title = "Profit Margin Analysis", height = 300 }: {
  data: Array<{
    month: string;
    revenue: number;
    cost: number;
    profit: number;
  }>;
  title?: string;
  height?: number;
}) {
  return (
    <Card className="rounded-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>Monthly profit and loss breakdown</CardDescription>
      </CardHeader>
      <CardContent>
        <div style={{ width: '100%', height }}>
          <ResponsiveContainer>
            <RechartsBarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={(value: number, name: string) => [
                  `PKR ${value.toLocaleString()}`,
                  name === 'revenue' ? 'Revenue' :
                  name === 'cost' ? 'Cost' : 'Profit'
                ]}
              />
              <Bar dataKey="cost" stackId="a" fill="#ff8042" name="cost" />
              <Bar dataKey="profit" stackId="a" fill="#82ca9d" name="profit" />
            </RechartsBarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
