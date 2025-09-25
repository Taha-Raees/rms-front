'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DollarSign, ShoppingCart, Users, TrendingUp, TrendingDown, Package, AlertTriangle, Clock, BarChart3 } from 'lucide-react';

import {
  AdvancedMetricCard,
  RevenueTrendChart,
  PaymentMethodChart,
  ProductPerformanceChart,
  CustomerSegmentChart,
  HourlySalesPatternChart,
  WeeklySalesPatternChart,
  ProfitMarginChart
} from '@/components/analytics/AdvancedCharts';

import { useToast } from '@/hooks/use-toast';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { useDeviceAdaptive } from '@/hooks/use-device-adaptive';
import { MobileAnalyticsManager } from '@/components/mobile/MobileAnalyticsManager';
import { analyticsApi } from '@/lib/api';

export default function AnalyticsPage() {
  const { toast } = useToast();
  const { state: authState } = useAuth();
  const { state } = useApp();
  const { store } = state;

  const [loading, setLoading] = useState(true);
  const [financialData, setFinancialData] = useState<any>(null);
  const [customerData, setCustomerData] = useState<any>(null);
  const [productData, setProductData] = useState<any>(null);
  const [operationalData, setOperationalData] = useState<any>(null);

  const [activeTab, setActiveTab] = useState<'overview' | 'financial' | 'products' | 'operational'>('overview');

  useEffect(() => {
    fetchAllAnalyticsData();
  }, []);

  const fetchAllAnalyticsData = async () => {
    try {
      setLoading(true);

      const [
        financialResult,
        productResult,
        operationalResult
      ] = await Promise.all([
        analyticsApi.getFinancialAnalytics(),
        analyticsApi.getProductAnalytics(),
        analyticsApi.getOperationalAnalytics()
      ]);

      if (financialResult.success) {
        setFinancialData(financialResult.data);
      }
      if (productResult.success) {
        setProductData(productResult.data);
      }
      if (operationalResult.success) {
        setOperationalData(operationalResult.data);
      }
    } catch (error) {
      console.error('Failed to fetch advanced analytics data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch advanced analytics data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const { shouldUseMobileView } = useDeviceAdaptive();

  // Mobile view
  if (shouldUseMobileView) {
    return <MobileAnalyticsManager />;
  }

  const renderOverviewTab = () => {
    if (!financialData?.summary) return null;

    return (
      <div className="space-y-6">
        {/* Key Financial Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <AdvancedMetricCard
            title="Total Revenue"
            value={`PKR ${financialData.summary.totalRevenue.toLocaleString()}`}
            description="Overall sales generated"
            icon={DollarSign}
          />
          <AdvancedMetricCard
            title="Total Profit"
            value={`PKR ${financialData.summary.totalProfit.toLocaleString()}`}
            description="Net profit after costs"
            icon={TrendingUp}
            trend={{
              value: `${financialData.summary.profitMargin.toFixed(1)}% margin`,
              isPositive: financialData.summary.profitMargin > 0
            }}
          />
          <AdvancedMetricCard
            title="Product Categories"
            value={productData?.productPerformance?.reduce((unique: Set<string>, product: any) => unique.add(product.category), new Set()).size || 0}
            description="Different product categories"
            icon={Package}
          />
          <AdvancedMetricCard
            title="Top Products"
            value={productData?.productPerformance?.length || 0}
            description="Revenue-generating products"
            icon={Package}
          />
        </div>

        {/* Key Charts Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {financialData.monthlyPnL && (
            <ProfitMarginChart
              data={financialData.monthlyPnL}
              title="Monthly P&L Overview"
              height={300}
            />
          )}
          {operationalData?.dailySales && (
            <WeeklySalesPatternChart
              data={operationalData.dailySales}
              title="Weekly Sales Patterns"
              height={300}
            />
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {financialData.revenueByPaymentMethod && (
            <PaymentMethodChart
              data={financialData.revenueByPaymentMethod}
              title="Revenue by Payment Type"
              height={300}
            />
          )}
          {productData?.productPerformance && (
            <ProductPerformanceChart
              data={productData.productPerformance}
              title="Top Product Performance"
              height={300}
            />
          )}
        </div>
      </div>
    );
  };

  const renderFinancialTab = () => {
    if (!financialData) return <div>No financial data available</div>;

    return (
      <div className="space-y-6">
        {/* Financial Summary */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <AdvancedMetricCard
            title="Total Revenue"
            value={`PKR ${financialData.summary.totalRevenue.toLocaleString()}`}
            icon={DollarSign}
          />
          <AdvancedMetricCard
            title="Total Cost"
            value={`PKR ${financialData.summary.totalCost.toLocaleString()}`}
            icon={TrendingDown}
          />
          <AdvancedMetricCard
            title="Net Profit"
            value={`PKR ${financialData.summary.totalProfit.toLocaleString()}`}
            icon={TrendingUp}
            trend={{
              value: `${financialData.summary.profitMargin.toFixed(1)}% margin`,
              isPositive: financialData.summary.profitMargin > 0
            }}
          />
        </div>

        {/* Financial Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {financialData.monthlyPnL && (
            <ProfitMarginChart
              data={financialData.monthlyPnL}
              title="Monthly Profit & Loss"
              height={350}
            />
          )}
          {financialData.revenueTrends && (
            <RevenueTrendChart
              data={financialData.revenueTrends}
              title="Daily Revenue Trends"
              height={350}
            />
          )}
        </div>

        {financialData.revenueByPaymentMethod && (
          <PaymentMethodChart
            data={financialData.revenueByPaymentMethod}
            title="Revenue Distribution by Payment Method"
            height={400}
          />
        )}
      </div>
    );
  };

  const renderCustomerTab = () => {
    if (!customerData) return <div>No customer data available</div>;

    return (
      <div className="space-y-6">
        {/* Customer Summary */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <AdvancedMetricCard
            title="Total Customers"
            value={customerData.customerLTV?.length || 0}
            description="Unique customers tracked"
            icon={Users}
          />
          <AdvancedMetricCard
            title="Customer Segments"
            value={customerData.customerSegments?.length || 0}
            description="Different customer tiers"
            icon={Users}
          />
          <AdvancedMetricCard
            title="VIP Customers"
            value={customerData.customerSegments?.find((s: any) => s.segment === 'VIP')?.customerCount || 0}
            description="High-value customers"
            icon={TrendingUp}
          />
        </div>

        {/* Customer Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {customerData.customerSegments && (
            <CustomerSegmentChart
              data={customerData.customerSegments}
              title="Customer Segmentation Analysis"
              height={350}
            />
          )}
          {customerData.customerSegments && (
            <Card className="rounded-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Customer Segment Breakdown
                </CardTitle>
                <CardDescription>Value distribution across customer segments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {customerData.customerSegments.map((segment: any) => (
                    <div key={segment.segment} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <div className="font-medium">{segment.segment}</div>
                        <div className="text-sm text-muted-foreground">
                          {segment.customerCount} customers
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">
                          PKR {segment.totalRevenue.toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Avg: PKR {(segment.avgCustomerValue).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Top Customers */}
        {customerData.customerLTV && (
          <Card className="rounded-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Top Customers by Lifetime Value
              </CardTitle>
              <CardDescription>Most valuable customers based on total spending</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {customerData.customerLTV.slice(0, 10).map((customer: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 hover:bg-muted rounded">
                    <div className="font-medium">{customer.customerName || 'Anonymous'}</div>
                    <div className="text-right">
                      <div className="font-semibold">
                        PKR {customer.totalSpent.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {customer.orderCount} orders • Avg: PKR {customer.avgOrderValue.toFixed(0)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderProductTab = () => {
    if (!productData) return <div>No product data available</div>;

    return (
      <div className="space-y-6">
        {/* Product Summary */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <AdvancedMetricCard
            title="Total Products"
            value={productData.productPerformance?.length || 0}
            description="Products with performance data"
            icon={Package}
          />
          <AdvancedMetricCard
            title="Top Product Revenue"
            value={`PKR ${productData.productPerformance?.[0]?.totalRevenue.toLocaleString() || '0'}`}
            description="Best selling product"
            icon={TrendingUp}
          />
          <AdvancedMetricCard
            title="Avg Profit Margin"
            value={`${productData.productPerformance?.reduce((acc: number, p: any) =>
              acc + p.profitMargin, 0) / (productData.productPerformance?.length || 1)
            }%`}
            description="Overall product profitability"
            icon={TrendingUp}
          />
        </div>

        {/* Product Charts */}
        {productData.productPerformance && (
          <ProductPerformanceChart
            data={productData.productPerformance}
            title="Product Performance by Revenue & Profit"
            height={400}
          />
        )}

        {/* Inventory Turnover */}
        {productData.inventoryTurnover && (
          <Card className="rounded-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Inventory Turnover Analysis
              </CardTitle>
              <CardDescription>Product movement efficiency (sold units / current stock)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {productData.inventoryTurnover.slice(0, 15).map((product: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 hover:bg-muted rounded">
                    <div className="font-medium">{product.name}</div>
                    <div className="text-right">
                      <div className="font-semibold">
                        Turnover: {product.turnoverRatio.toFixed(2)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Stock: {product.currentStock} • Sold: {product.totalSoldMonth}
                        {product.daysOfInventory && ` • Days: ${product.daysOfInventory.toFixed(0)}`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderOperationalTab = () => {
    if (!operationalData) return <div>No operational data available</div>;

    return (
      <div className="space-y-6">
        {/* Operational Summary */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <AdvancedMetricCard
            title="Peak Hour Sales"
            value={`${
              operationalData.hourlySales?.reduce((max: any, hour: any) =>
                hour.orderCount > max.orderCount ? hour : max, operationalData.hourlySales[0])?.hour || 0
            }:00`}
            description="Busiest sales hour"
            icon={Clock}
          />
          <AdvancedMetricCard
            title="Busiest Day"
            value={`${
              operationalData.dailySales?.reduce((max: any, day: any) =>
                day.orderCount > max.orderCount ? day : max, operationalData.dailySales[0])?.dayName || 'N/A'
            }`}
            description="Most active day of week"
            icon={TrendingUp}
          />
          <AdvancedMetricCard
            title="Daily Patterns"
            value={operationalData.dailySales?.length || 7}
            description="Days tracked"
            icon={BarChart3}
          />
        </div>

        {/* Operational Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {operationalData.hourlySales && (
            <HourlySalesPatternChart
              data={operationalData.hourlySales}
              title="Hourly Sales Pattern"
              height={350}
            />
          )}
          {operationalData.dailySales && (
            <WeeklySalesPatternChart
              data={operationalData.dailySales}
              title="Weekly Sales Pattern"
              height={350}
            />
          )}
        </div>
      </div>
    );
  };

  // Desktop view
  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex items-center justify-between bg-muted p-1 rounded-lg">
        <div className="flex space-x-1">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'financial', label: 'Financial', icon: DollarSign },
          { id: 'products', label: 'Products', icon: Package },
          { id: 'operational', label: 'Operations', icon: Clock }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-background shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="font-medium">{tab.label}</span>
            </button>
          );
        })}
        </div>
        <Button variant="outline" onClick={fetchAllAnalyticsData} disabled={loading}>
          {loading ? 'Loading...' : 'Refresh Data'}
        </Button>
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="rounded-sm">
                <CardHeader>
                  <div className="h-6 bg-muted rounded animate-pulse"></div>
                  <div className="h-4 bg-muted rounded animate-pulse w-2/3"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-muted rounded animate-pulse"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {activeTab === 'overview' && renderOverviewTab()}
            {activeTab === 'financial' && renderFinancialTab()}
            {activeTab === 'products' && renderProductTab()}
            {activeTab === 'operational' && renderOperationalTab()}
          </>
        )}
      </div>
    </div>
  );
}
