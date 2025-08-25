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
import { Search, Database } from 'lucide-react';
import { auditApi } from '@/lib/api';
import { AuditLog } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface EntityHistoryProps {
  storeId: string;
}

export function EntityHistory({ storeId }: EntityHistoryProps) {
  const { toast } = useToast();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [entityTypes, setEntityTypes] = useState<{ entityType: string; count: number }[]>([]);
  const [searchParams, setSearchParams] = useState({
    entityType: '',
    entityId: '',
    limit: 50
  });

  useEffect(() => {
    loadEntityTypes();
  }, [storeId]);

  const loadEntityTypes = async () => {
    try {
      const response = await auditApi.getEntityTypes();
      if (response.success) {
        setEntityTypes(response.data || []);
      }
    } catch (error) {
      console.error('Failed to load entity types:', error);
    }
  };

  const loadEntityHistory = async () => {
    if (!searchParams.entityType || !searchParams.entityId) {
      toast({
        title: "Validation Error",
        description: "Please select entity type and enter entity ID",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const response = await auditApi.getEntityLogs(
        searchParams.entityType,
        searchParams.entityId,
        searchParams.limit
      );
      
      if (response.success) {
        setLogs(response.data || []);
      } else {
        throw new Error(response.error || 'Failed to load entity history');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load entity history",
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

  const formatChanges = (oldValues: any, newValues: any) => {
    if (!oldValues && !newValues) return 'No changes';
    
    const changes: string[] = [];
    
    if (newValues) {
      Object.keys(newValues).forEach(key => {
        const oldValue = oldValues?.[key];
        const newValue = newValues[key];
        
        if (oldValue !== newValue) {
          changes.push(`${key}: ${oldValue || 'null'} → ${newValue}`);
        }
      });
    }
    
    return changes.length > 0 ? changes.join(', ') : 'No changes detected';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Entity History</h2>
        <p className="text-muted-foreground">
          View detailed change history for specific entities
        </p>
      </div>

      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle>Search Entity History</CardTitle>
          <CardDescription>
            Find and track changes to specific entities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="entityType">Entity Type</Label>
              <Select 
                value={searchParams.entityType} 
                onValueChange={(value) => setSearchParams(prev => ({ ...prev, entityType: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {entityTypes.map((type) => (
                    <SelectItem key={type.entityType} value={type.entityType}>
                      {type.entityType}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="entityId">Entity ID</Label>
              <div className="relative">
                <Database className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Enter entity ID"
                  value={searchParams.entityId}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, entityId: e.target.value }))}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="limit">Limit Results</Label>
              <Select 
                value={searchParams.limit.toString()} 
                onValueChange={(value) => setSearchParams(prev => ({ ...prev, limit: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 flex items-end">
              <Button onClick={loadEntityHistory} className="w-full">
                <Search className="h-4 w-4 mr-2" />
                Search History
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Change History */}
      <Card>
        <CardHeader>
          <CardTitle>Change History</CardTitle>
          <CardDescription>
            Detailed audit trail of entity modifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : !searchParams.entityType || !searchParams.entityId ? (
              <div className="text-center py-8 text-muted-foreground">
                Enter entity type and ID to view history
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No history found for this entity
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Changes</TableHead>
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
                        <Badge className={getActionColor(log.action)}>
                          {formatAction(log.action)}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-md">
                        <div className="text-sm text-muted-foreground">
                          {formatChanges(log.oldValues, log.newValues)}
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
