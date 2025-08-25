'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Database, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  RefreshCw,
  Table,
  Key,
  Shield,
  Lock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Constraint {
  id: string;
  name: string;
  table: string;
  type: 'PRIMARY_KEY' | 'FOREIGN_KEY' | 'UNIQUE' | 'CHECK' | 'NOT_NULL';
  columns: string[];
  referencedTable?: string;
  referencedColumns?: string[];
  isValid: boolean;
  issues?: string[];
  lastChecked: Date;
}

interface ConstraintGroup {
  table: string;
  constraints: Constraint[];
  isValid: boolean;
  issueCount: number;
}

export function ConstraintVisualization() {
  const { toast } = useToast();
  const [constraints, setConstraints] = useState<ConstraintGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);

  // Mock constraint data - in a real implementation, this would come from an API
  const mockConstraints: ConstraintGroup[] = [
    {
      table: 'stores',
      isValid: true,
      issueCount: 0,
      constraints: [
        {
          id: '1',
          name: 'stores_pkey',
          table: 'stores',
          type: 'PRIMARY_KEY',
          columns: ['id'],
          isValid: true,
          lastChecked: new Date()
        },
        {
          id: '2',
          name: 'stores_ownerId_fkey',
          table: 'stores',
          type: 'FOREIGN_KEY',
          columns: ['ownerId'],
          referencedTable: 'users',
          referencedColumns: ['id'],
          isValid: true,
          lastChecked: new Date()
        }
      ]
    },
    {
      table: 'users',
      isValid: true,
      issueCount: 0,
      constraints: [
        {
          id: '3',
          name: 'users_pkey',
          table: 'users',
          type: 'PRIMARY_KEY',
          columns: ['id'],
          isValid: true,
          lastChecked: new Date()
        },
        {
          id: '4',
          name: 'users_email_key',
          table: 'users',
          type: 'UNIQUE',
          columns: ['email'],
          isValid: true,
          lastChecked: new Date()
        }
      ]
    },
    {
      table: 'products',
      isValid: false,
      issueCount: 1,
      constraints: [
        {
          id: '5',
          name: 'products_pkey',
          table: 'products',
          type: 'PRIMARY_KEY',
          columns: ['id'],
          isValid: true,
          lastChecked: new Date()
        },
        {
          id: '6',
          name: 'products_storeId_fkey',
          table: 'products',
          type: 'FOREIGN_KEY',
          columns: ['storeId'],
          referencedTable: 'stores',
          referencedColumns: ['id'],
          isValid: false,
          issues: ['Orphaned records found: 3 products reference non-existent stores'],
          lastChecked: new Date()
        }
      ]
    },
    {
      table: 'orders',
      isValid: true,
      issueCount: 0,
      constraints: [
        {
          id: '7',
          name: 'orders_pkey',
          table: 'orders',
          type: 'PRIMARY_KEY',
          columns: ['id'],
          isValid: true,
          lastChecked: new Date()
        },
        {
          id: '8',
          name: 'orders_storeId_fkey',
          table: 'orders',
          type: 'FOREIGN_KEY',
          columns: ['storeId'],
          referencedTable: 'stores',
          referencedColumns: ['id'],
          isValid: true,
          lastChecked: new Date()
        }
      ]
    }
  ];

  const loadConstraints = async () => {
    try {
      setLoading(true);
      // In a real implementation, this would call an API endpoint
      // const result = await adminApi.getConstraints();
      
      // For now, use mock data
      await new Promise(resolve => setTimeout(resolve, 1000));
      setConstraints(mockConstraints);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load database constraints",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getConstraintIcon = (type: string) => {
    switch (type) {
      case 'PRIMARY_KEY':
        return <Key className="h-4 w-4" />;
      case 'FOREIGN_KEY':
        return <Shield className="h-4 w-4" />;
      case 'UNIQUE':
        return <CheckCircle className="h-4 w-4" />;
      case 'CHECK':
        return <AlertTriangle className="h-4 w-4" />;
      case 'NOT_NULL':
        return <Lock className="h-4 w-4" />;
      default:
        return <Database className="h-4 w-4" />;
    }
  };

  const getConstraintColor = (type: string) => {
    switch (type) {
      case 'PRIMARY_KEY':
        return 'bg-blue-100 text-blue-800';
      case 'FOREIGN_KEY':
        return 'bg-purple-100 text-purple-800';
      case 'UNIQUE':
        return 'bg-green-100 text-green-800';
      case 'CHECK':
        return 'bg-yellow-100 text-yellow-800';
      case 'NOT_NULL':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (isValid: boolean) => {
    return isValid ? 
      <CheckCircle className="h-5 w-5 text-green-500" /> : 
      <XCircle className="h-5 w-5 text-red-500" />;
  };

  useEffect(() => {
    loadConstraints();
  }, []);

  const selectedGroup = selectedTable 
    ? constraints.find(group => group.table === selectedTable)
    : null;

  return (
    <div className="space-y-6">
      <Card className="rounded-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Constraint Visualization
          </CardTitle>
          <CardDescription>
            Monitor and validate database integrity constraints
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Button onClick={loadConstraints} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh Constraints
              </Button>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Valid
              </div>
              <div className="flex items-center gap-1">
                <XCircle className="h-4 w-4 text-red-500" />
                Issues
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {constraints.map((group) => (
              <Card 
                key={group.table}
                className={`cursor-pointer transition-colors hover:border-primary ${
                  selectedTable === group.table ? 'border-primary ring-2 ring-primary/20' : ''
                }`}
                onClick={() => setSelectedTable(selectedTable === group.table ? null : group.table)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Table className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{group.table}</div>
                        <div className="text-xs text-muted-foreground">
                          {group.constraints.length} constraints
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(group.isValid)}
                      {group.issueCount > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {group.issueCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {selectedGroup && (
            <Card className="rounded-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Table className="h-5 w-5" />
                  {selectedGroup.table} Constraints
                </CardTitle>
                <CardDescription>
                  Detailed view of constraints for {selectedGroup.table} table
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {selectedGroup.constraints.map((constraint) => (
                    <div 
                      key={constraint.id}
                      className={`p-3 rounded-md border ${
                        constraint.isValid 
                          ? 'border-green-200 bg-green-50' 
                          : 'border-red-200 bg-red-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={constraint.isValid ? 'text-green-600' : 'text-red-600'}>
                            {getConstraintIcon(constraint.type)}
                          </div>
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              {constraint.name}
                              <Badge className={getConstraintColor(constraint.type)}>
                                {constraint.type.replace('_', ' ')}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Columns: {constraint.columns.join(', ')}
                            </div>
                            {constraint.referencedTable && (
                              <div className="text-sm text-muted-foreground">
                                References: {constraint.referencedTable} ({constraint.referencedColumns?.join(', ')})
                              </div>
                            )}
                            <div className="text-xs text-muted-foreground mt-1">
                              Last checked: {constraint.lastChecked.toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <div>
                          {getStatusIcon(constraint.isValid)}
                        </div>
                      </div>
                      
                      {!constraint.isValid && constraint.issues && (
                        <div className="mt-2 p-2 bg-red-100 rounded text-sm text-red-800">
                          <div className="font-medium mb-1">Issues Found:</div>
                          <ul className="list-disc list-inside space-y-1">
                            {constraint.issues.map((issue, index) => (
                              <li key={index}>{issue}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="p-3 bg-blue-50 rounded-md border border-blue-200">
              <div className="flex items-center gap-2 font-medium text-blue-800">
                <Key className="h-4 w-4" />
                Primary Keys
              </div>
              <div className="text-blue-700 mt-1">
                Ensure each row has a unique identifier
              </div>
            </div>
            
            <div className="p-3 bg-purple-50 rounded-md border border-purple-200">
              <div className="flex items-center gap-2 font-medium text-purple-800">
                <Shield className="h-4 w-4" />
                Foreign Keys
              </div>
              <div className="text-purple-700 mt-1">
                Maintain referential integrity between tables
              </div>
            </div>
            
            <div className="p-3 bg-green-50 rounded-md border border-green-200">
              <div className="flex items-center gap-2 font-medium text-green-800">
                <CheckCircle className="h-4 w-4" />
                Unique Constraints
              </div>
              <div className="text-green-700 mt-1">
                Prevent duplicate values in specified columns
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
