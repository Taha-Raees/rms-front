'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Trash2, 
  Archive, 
  Clock, 
  Search,
  RefreshCw,
  HardDrive,
  Database,
  Undo,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface SoftDeletedItem {
  id: string;
  type: 'product' | 'order' | 'customer' | 'user';
  name: string;
  deletedAt: Date;
  deletedBy?: string;
  originalData: any;
  canRestore: boolean;
  restoreDependencies?: string[];
}

export function RecycleBin() {
  const { toast } = useToast();
  const [items, setItems] = useState<SoftDeletedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [processing, setProcessing] = useState(false);

  // Mock deleted items data - in a real implementation, this would come from an API
  const mockDeletedItems: SoftDeletedItem[] = [
    {
      id: '1',
      type: 'product',
      name: 'Samsung Galaxy S21',
      deletedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      deletedBy: 'admin@example.com',
      originalData: { category: 'Electronics', price: 799.99 },
      canRestore: true
    },
    {
      id: '2',
      type: 'customer',
      name: 'John Doe',
      deletedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      deletedBy: 'manager@example.com',
      originalData: { email: 'john@example.com', phone: '+1234567890' },
      canRestore: true
    },
    {
      id: '3',
      type: 'order',
      name: 'ORD-2023-001',
      deletedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      deletedBy: 'admin@example.com',
      originalData: { total: 129.99, status: 'completed' },
      canRestore: false,
      restoreDependencies: ['Customer record has been permanently deleted']
    }
  ];

  const loadDeletedItems = async () => {
    try {
      setLoading(true);
      // In a real implementation, this would call an API endpoint
      // const result = await adminApi.getDeletedItems();
      
      // For now, use mock data
      await new Promise(resolve => setTimeout(resolve, 1000));
      setItems(mockDeletedItems);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load deleted items",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const restoreItem = async (id: string) => {
    try {
      setProcessing(true);
      const item = items.find(i => i.id === id);
      if (!item) return;

      // In a real implementation, this would call an API endpoint
      // const result = await adminApi.restoreItem(item.type, id);
      
      // For now, just simulate the restore
      toast({
        title: "Success",
        description: `${item.type} "${item.name}" has been restored`,
      });
      
      // Remove from list
      setItems(items.filter(i => i.id !== id));
      setSelectedItems(selectedItems.filter(itemId => itemId !== id));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to restore item",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const permanentlyDeleteItem = async (id: string) => {
    try {
      setProcessing(true);
      const item = items.find(i => i.id === id);
      if (!item) return;

      // In a real implementation, this would call an API endpoint
      // const result = await adminApi.permanentlyDeleteItem(item.type, id);
      
      // For now, just simulate the deletion
      toast({
        title: "Success",
        description: `${item.type} "${item.name}" has been permanently deleted`,
      });
      
      // Remove from list
      setItems(items.filter(i => i.id !== id));
      setSelectedItems(selectedItems.filter(itemId => itemId !== id));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to permanently delete item",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const restoreSelectedItems = async () => {
    try {
      setProcessing(true);
      const selectedItemsData = items.filter(i => selectedItems.includes(i.id));
      
      // In a real implementation, this would call an API endpoint
      // const result = await adminApi.restoreItems(selectedItemsData.map(i => ({ type: i.type, id: i.id })));
      
      // For now, just simulate the restore
      toast({
        title: "Success",
        description: `${selectedItems.length} items have been restored`,
      });
      
      // Remove from list
      setItems(items.filter(i => !selectedItems.includes(i.id)));
      setSelectedItems([]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to restore selected items",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const permanentlyDeleteSelectedItems = async () => {
    try {
      setProcessing(true);
      const selectedItemsData = items.filter(i => selectedItems.includes(i.id));
      
      // In a real implementation, this would call an API endpoint
      // const result = await adminApi.permanentlyDeleteItems(selectedItemsData.map(i => ({ type: i.type, id: i.id })));
      
      // For now, just simulate the deletion
      toast({
        title: "Success",
        description: `${selectedItems.length} items have been permanently deleted`,
      });
      
      // Remove from list
      setItems(items.filter(i => !selectedItems.includes(i.id)));
      setSelectedItems([]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to permanently delete selected items",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'product':
        return <Database className="h-4 w-4" />;
      case 'order':
        return <Archive className="h-4 w-4" />;
      case 'customer':
        return <HardDrive className="h-4 w-4" />;
      case 'user':
        return <HardDrive className="h-4 w-4" />;
      default:
        return <Database className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'product':
        return 'bg-blue-100 text-blue-800';
      case 'order':
        return 'bg-green-100 text-green-800';
      case 'customer':
        return 'bg-purple-100 text-purple-800';
      case 'user':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const allSelected = selectedItems.length === filteredItems.length && filteredItems.length > 0;
  const someSelected = selectedItems.length > 0;

  const toggleAll = () => {
    if (allSelected) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredItems.map(item => item.id));
    }
  };

  const toggleItem = (id: string) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(itemId => itemId !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  useEffect(() => {
    loadDeletedItems();
  }, []);

  return (
    <div className="space-y-6">
      <Card className="rounded-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            Recycle Bin
          </CardTitle>
          <CardDescription>
            Manage soft deleted items and restore or permanently delete them
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="flex flex-col sm:flex-row gap-2 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search deleted items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button onClick={loadDeletedItems} disabled={loading} variant="outline">
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
            
            <div className="flex gap-2">
              {someSelected && (
                <>
                  <Button
                    variant="outline"
                    onClick={restoreSelectedItems}
                    disabled={processing}
                    className="flex items-center gap-2"
                  >
                    <Undo className="h-4 w-4" />
                    Restore ({selectedItems.length})
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={permanentlyDeleteSelectedItems}
                    disabled={processing}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Permanently
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="border rounded-md">
            <div className="bg-muted px-4 py-3 flex items-center gap-4 border-b">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
              </div>
              <div className="flex-1 grid grid-cols-12 gap-4 text-sm font-medium text-muted-foreground">
                <div className="col-span-4">Item</div>
                <div className="col-span-2">Type</div>
                <div className="col-span-3">Deleted By</div>
                <div className="col-span-3">Deleted At</div>
              </div>
              <div className="w-32 text-right text-sm font-medium text-muted-foreground">
                Actions
              </div>
            </div>
            
            {filteredItems.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Trash2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No deleted items found</p>
                <p className="text-sm">Items moved to the recycle bin will appear here</p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredItems.map((item) => (
                  <div key={item.id} className="px-4 py-3 flex items-center gap-4 hover:bg-muted/50">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => toggleItem(item.id)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                    </div>
                    <div className="flex-1 grid grid-cols-12 gap-4">
                      <div className="col-span-4">
                        <div className="font-medium">{item.name}</div>
                        {item.originalData && (
                          <div className="text-sm text-muted-foreground">
                            {Object.entries(item.originalData).map(([key, value]) => (
                              <span key={key} className="inline-block mr-2">
                                {key}: {String(value)}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="col-span-2">
                        <Badge className={`${getTypeColor(item.type)} flex items-center gap-1`}>
                          {getTypeIcon(item.type)}
                          {item.type}
                        </Badge>
                      </div>
                      <div className="col-span-3 text-sm">
                        {item.deletedBy || 'System'}
                      </div>
                      <div className="col-span-3 text-sm text-muted-foreground">
                        {format(item.deletedAt, 'MMM dd, yyyy HH:mm')}
                      </div>
                    </div>
                    <div className="w-32 flex justify-end gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => restoreItem(item.id)}
                        disabled={processing || !item.canRestore}
                        className="h-8 w-8 p-0"
                        title={item.canRestore ? "Restore" : "Cannot restore due to dependencies"}
                      >
                        {item.canRestore ? (
                          <Undo className="h-4 w-4" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => permanentlyDeleteItem(item.id)}
                        disabled={processing}
                        className="h-8 w-8 p-0"
                        title="Permanently Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {items.length > 0 && (
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-sm text-muted-foreground">
              <div>
                Showing {filteredItems.length} of {items.length} deleted items
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Items are automatically purged after 30 days
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="p-3 bg-blue-50 rounded-md border border-blue-200">
              <div className="flex items-center gap-2 font-medium text-blue-800">
                <Undo className="h-4 w-4" />
                Restore Items
              </div>
              <div className="text-blue-700 mt-1">
                Bring back deleted items to their original state
              </div>
            </div>
            
            <div className="p-3 bg-yellow-50 rounded-md border border-yellow-200">
              <div className="flex items-center gap-2 font-medium text-yellow-800">
                <AlertTriangle className="h-4 w-4" />
                Dependencies
              </div>
              <div className="text-yellow-700 mt-1">
                Some items cannot be restored due to missing dependencies
              </div>
            </div>
            
            <div className="p-3 bg-red-50 rounded-md border border-red-200">
              <div className="flex items-center gap-2 font-medium text-red-800">
                <Trash2 className="h-4 w-4" />
                Permanent Deletion
              </div>
              <div className="text-red-700 mt-1">
                Permanently deleted items cannot be recovered
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
