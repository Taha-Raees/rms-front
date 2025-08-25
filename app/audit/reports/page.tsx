'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Download, 
  Filter, 
  Calendar,
  FileText,
  BarChart3,
  PieChart as PieChartIcon
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { auditApi } from '@/lib/api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

interface ReportFilter {
  startDate: string;
  endDate: string;
  entityType?: string;
  action?: string;
  userId?: string;
  format: 'csv' | 'json';
}

interface ActivityData {
  date: string;
  count: number;
}

interface EntityTypeData {
  name: string;
  value: number;
}

interface ActionData {
  name: string;
  value: number;
}

export default function AuditReportsPage() {
  const { toast } = useToast();
  const [filters, setFilters] = useState<ReportFilter>({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    format: 'csv'
  });
  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  const [entityTypeData, setEntityTypeData] = useState<EntityTypeData[]>([]);
  const [actionData, setActionData] = useState<ActionData[]>([]);
  const [loading, setLoading] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);

  // Mock data for charts
  const mockActivityData: ActivityData[] = [
    { date: '2023-01-01', count: 45 },
    { date: '2023-01-02', count: 52 },
    { date: '2023-01-03', count: 48 },
    { date: '2023-01-04', count: 61 },
    { date: '2023-01-05', count: 55 },
    { date: '2023-01-06', count: 67 },
    { date: '2023-01-07', count: 58 },
  ];

  const mockEntityTypeData: EntityTypeData[] = [
    { name: 'Product', value: 400 },
    { name: 'Order', value: 300 },
    { name: 'User', value: 200 },
    { name: 'Store', value: 100 },
    { name: 'Inventory', value: 150 },
  ];

  const mockActionData: ActionData[] = [
    { name: 'CREATE', value: 300 },
    { name: 'UPDATE', value: 400 },
    { name: 'DELETE', value: 100 },
    { name: 'READ', value: 200 },
  ];

  const loadReportData = async () => {
    try {
      setLoading(true);
      
      // In a real implementation, this would call the API
      // const result = await auditApi.getLogs(filters);
      
      // For now, use mock data
      await new Promise(resolve => setTimeout(resolve, 1000));
      setActivityData(mockActivityData);
      setEntityTypeData(mockEntityTypeData);
      setActionData(mockActionData);
      
      toast({
        title: "Success",
        description: "Report data loaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load report data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    try {
      setGeneratingReport(true);
      
      // In a real implementation, this would call the API
      // const response = await auditApi.exportLogs(filters);
      
      // For now, just simulate the download
      toast({
        title: "Success",
        description: `Report generated and downloaded as ${filters.format.toUpperCase()}`,
      });
      
      // Simulate file download
      const blob = new Blob([JSON.stringify({ filters, activityData, entityTypeData, actionData })], 
        { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-report-${new Date().toISOString().split('T')[0]}.${filters.format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate report",
        variant: "destructive",
      });
    } finally {
      setGeneratingReport(false);
    }
  };

  const handleFilterChange = (key: keyof ReportFilter, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Audit Reports</h1>
        <p className="text-muted-foreground">
          Generate and analyze audit trail reports
        </p>
      </div>

      <Card className="rounded-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Report Filters
          </CardTitle>
          <CardDescription>
            Configure filters to generate custom audit reports
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="startDate"
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="endDate"
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="entityType">Entity Type</Label>
              <Select value={filters.entityType || ''} onValueChange={(value) => handleFilterChange('entityType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select entity type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="product">Product</SelectItem>
                  <SelectItem value="order">Order</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="store">Store</SelectItem>
                  <SelectItem value="inventory">Inventory</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="format">Export Format</Label>
              <Select value={filters.format} onValueChange={(value) => handleFilterChange('format', value as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={loadReportData} disabled={loading}>
              <BarChart3 className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Generate Report Data
            </Button>
            <Button 
              onClick={generateReport} 
              disabled={generatingReport || activityData.length === 0}
              variant="outline"
            >
              <Download className={`h-4 w-4 mr-2 ${generatingReport ? 'animate-spin' : ''}`} />
              Export Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {activityData.length > 0 && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="rounded-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Activity Timeline
                </CardTitle>
                <CardDescription>
                  Daily audit activity over the selected period
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={activityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" name="Activity Count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="rounded-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5" />
                  Entity Type Distribution
                </CardTitle>
                <CardDescription>
                  Distribution of audit events by entity type
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={entityTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {entityTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card className="rounded-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Action Distribution
              </CardTitle>
              <CardDescription>
                Distribution of audit events by action type
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={actionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {actionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div className="p-3 bg-blue-50 rounded-md border border-blue-200">
          <div className="flex items-center gap-2 font-medium text-blue-800">
            <BarChart3 className="h-4 w-4" />
            Activity Timeline
          </div>
          <div className="text-blue-700 mt-1">
            Visualize audit activity patterns over time
          </div>
        </div>
        
        <div className="p-3 bg-green-50 rounded-md border border-green-200">
          <div className="flex items-center gap-2 font-medium text-green-800">
            <PieChartIcon className="h-4 w-4" />
            Distribution Charts
          </div>
          <div className="text-green-700 mt-1">
            Analyze data distribution across different categories
          </div>
        </div>
        
        <div className="p-3 bg-purple-50 rounded-md border border-purple-200">
          <div className="flex items-center gap-2 font-medium text-purple-800">
            <Download className="h-4 w-4" />
            Export Reports
          </div>
          <div className="text-purple-700 mt-1">
            Download detailed reports in CSV or JSON format
          </div>
        </div>
      </div>
    </div>
  );
}
