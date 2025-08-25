'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { Calendar, Filter } from 'lucide-react';
import { auditApi } from '@/lib/api';
import { AuditLog } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface UserActivityLogProps {
  storeId: string;
}

export function UserActivityLog({ storeId }: UserActivityLogProps) {
  const { toast } = useToast();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<{ id: string; name: string; email: string; role: string }[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null
  });

  useEffect(() => {
    loadUsers();
  }, [storeId]);

  useEffect(() => {
    if (selectedUser) {
      loadUserActivity();
    }
  }, [selectedUser, dateRange]);

  const loadUsers = async () => {
    try {
      const response = await auditApi.getUsers();
      if (response.success) {
        setUsers(response.data || []);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    }
  };

  const loadUserActivity = async () => {
    try {
      setLoading(true);
      const response = await auditApi.getLogs({
        userId: selectedUser,
        limit: 100
      });
      
      if (response.success) {
        setLogs(response.data || []);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load user activity",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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

  const getUserActivityStats = () => {
    const userLogs = logs.filter(log => log.userId === selectedUser);
    const totalActions = userLogs.length;
    const uniqueEntities = new Set(userLogs.map(log => log.entityType)).size;
    const uniqueActions = new Set(userLogs.map(log => log.action)).size;
    
    return { totalActions, uniqueEntities, uniqueActions };
  };

  const stats = selectedUser ? getUserActivityStats() : { totalActions: 0, uniqueEntities: 0, uniqueActions: 0 };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">User Activity Tracking</h2>
        <p className="text-muted-foreground">
          Monitor individual user activities and actions
        </p>
      </div>

      {/* User Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select User</CardTitle>
          <CardDescription>
            Choose a user to view their activity history
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">User</label>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a user" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex items-center gap-2">
                        <div className="font-medium">{user.name}</div>
                        <div className="text-xs text-muted-foreground">({user.role})</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Date Range</label>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="w-full">
                  <Calendar className="h-4 w-4 mr-2" />
                  Start Date
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  <Calendar className="h-4 w-4 mr-2" />
                  End Date
                </Button>
              </div>
            </div>

            <div className="space-y-2 flex items-end">
              <Button variant="outline" size="sm" className="w-full">
                <Filter className="h-4 w-4 mr-2" />
                Apply Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Stats */}
      {selectedUser && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalActions}</div>
              <p className="text-xs text-muted-foreground">actions performed</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Entities Modified</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.uniqueEntities}</div>
              <p className="text-xs text-muted-foreground">different entity types</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Action Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.uniqueActions}</div>
              <p className="text-xs text-muted-foreground">different actions</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>User Activity Timeline</CardTitle>
          <CardDescription>
            Detailed history of user actions and activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : !selectedUser ? (
              <div className="text-center py-8 text-muted-foreground">
                Please select a user to view their activity
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No activity found for this user
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
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
