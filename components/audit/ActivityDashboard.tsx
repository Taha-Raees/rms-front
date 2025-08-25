'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Filter, Download, Calendar, User, Database } from 'lucide-react';
import { auditApi } from '@/lib/api';
import { AuditLog } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface ActivityDashboardProps {
  storeId: string;
}

export function ActivityDashboard({ storeId }: ActivityDashboardProps) {
  const { toast } = useToast();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [entityTypes, setEntityTypes] = useState<{ entityType: string; count: number }[]>([]);
  const [actions, setActions] = useState<{ action: string; count: number }[]>([]);
  const [users, setUsers] = useState<{ id: string; name: string; email: string; role: string }[]>([]);
  const [filters, setFilters] = useState({
    entityType: '',
    action: '',
    userId: '',
    search: '',
    limit: 50,
    offset: 0
  });
  const [totalLogs, setTotalLogs] = useState(0);

  useEffect(() => {
    loadAuditData();
    loadFilters();
  }, [storeId]);

  const loadAuditData = async () => {
    try {
      setLoading(true);
      const [logsResponse, totalResponse] = await Promise.all([
        auditApi.getLogs({
          ...filters,
          limit: filters.limit,
          offset: filters.offset
        }),
        auditApi.getLogs({
          ...filters,
          limit: 1,
          offset: 0
        })
      ]);
      
      if (logsResponse.success) {
        setLogs(logsResponse.data || []);
        setTotalLogs(logsResponse.total || logsResponse.data?.length || 0);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load audit logs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadFilters = async () => {
    try {
      const [typesResponse, actionsResponse, usersResponse] = await Promise.all([
        auditApi.getEntityTypes(),
        auditApi.getActions(),
        auditApi.getUsers()
      ]);

      if (typesResponse.success) {
        setEntityTypes(typesResponse.data || []);
      }
      if (actionsResponse.success) {
        setActions(actionsResponse.data || []);
      }
      if (usersResponse.success) {
        setUsers(usersResponse.data || []);
      }
    } catch (error) {
      console.error('Failed to load filter data:', error);
    }
  };

  const handleFilterChange = (key: string, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      offset: 0 // Reset offset when filters change
    }));
  };

  const handleSearch = () => {
    loadAuditData();
  };

  const handleExport = async (format: 'csv' | 'json') => {
    try {
      const response = await auditApi.exportLogs({
        format,
        entityType: filters.entityType || undefined,
        action: filters.action || undefined,
        userId: filters.userId || undefined
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-logs-${format === 'csv' ? 'export.csv' : 'export.json'}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        toast({
          title: "Success",
          description: `Audit logs exported as ${format.toUpperCase()}`,
        });
      } else {
        throw new Error('Export failed');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export audit logs",
        variant: "destructive",
      });
    }
  };

  const getActionColor = (action: string) => {
    if (action.includes('CREATE') || action.includes('ADD')) return 'bg-green-100 text-green-800';
    if (action.includes('UPDATE') || action.includes('MODIFY')) return 'bg-blue-100 text-blue-800';
    if (action.includes('DELETE') || action.includes('REMOVE')) return 'bg-red-100 text-red-800';
    if (action.includes('LOGIN') || action.includes('AUTH')) return 'bg-purple-100 text-purple-800';
    return 'bg-gray-100 text-gray-800';
  };

  const formatAction = (action: string) => {
    return action
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="space-y-6">
      {/* Header with Export Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Activity Dashboard</h2>
          <p className="text-muted-foreground">
            Monitor all system activities and user actions
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleExport('csv')}
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleExport('json')}
          >
            <Download className="h-4 w-4 mr-2" />
            Export JSON
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLogs.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">across all entities</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entity Types</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{entityTypes.length}</div>
            <p className="text-xs text-muted-foreground">different types tracked</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">users with activity</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actions</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{actions.length}</div>
            <p className="text-xs text-muted-foreground">different actions tracked</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter Activities</CardTitle>
          <CardDescription>
            Search and filter audit logs by various criteria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label htmlFor="entityType">Entity Type</Label>
              <Select 
                value={filters.entityType} 
                onValueChange={(value) => handleFilterChange('entityType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  {entityTypes.map((type) => (
                    <SelectItem key={type.entityType} value={type.entityType}>
                      {type.entityType} ({type.count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="action">Action</Label>
              <Select 
                value={filters.action} 
                onValueChange={(value) => handleFilterChange('action', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Actions</SelectItem>
                  {actions.map((action) => (
                    <SelectItem key={action.action} value={action.action}>
                      {formatAction(action.action)} ({action.count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="user">User</Label>
              <Select 
                value={filters.userId} 
                onValueChange={(value) => handleFilterChange('userId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Users" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Users</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name} ({user.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search logs..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2 flex items-end">
              <Button onClick={handleSearch} className="w-full">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
          <CardDescription>
            Latest system activities and user actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No activities found matching your criteria
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-sm">
                        {format(new Date(log.createdAt), 'MMM dd, yyyy HH:mm:ss')}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{log.user?.name || 'System'}</div>
                        <div className="text-sm text-muted-foreground">
                          {log.user?.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{log.entityType}</div>
                        <div className="text-sm text-muted-foreground">
                          {log.entityId}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getActionColor(log.action)}>
                          {formatAction(log.action)}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="text-sm text-muted-foreground truncate">
                          {log.newValues ? JSON.stringify(log.newValues).substring(0, 100) + '...' : 'No details'}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
