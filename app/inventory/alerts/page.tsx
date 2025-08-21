'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Search, Package, AlertTriangle, Edit, Trash2, Scale, Box, CheckCircle, Clock } from 'lucide-react';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { MetricCard } from '@/components/ui/metric-card';
import { useToast } from '@/hooks/use-toast';
import { useApp } from '@/contexts/AppContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

interface InventoryAlert {
  id: string;
  type: 'low_stock' | 'out_of_stock' | 'reorder_reminder' | 'payment_failed' | 'order_cancelled';
  message: string;
  isRead: boolean;
  createdAt: string;
  product?: {
    id: string;
    name: string;
    stock: number;
    lowStockThreshold: number;
  };
}

export default function InventoryAlertsPage() {
  const { toast } = useToast();
  const { state } = useApp();
  const [alerts, setAlerts] = useState<InventoryAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'read'>('unread');
  const [selectedAlert, setSelectedAlert] = useState<InventoryAlert | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  // Fetch alerts on component mount
  useEffect(() => {
    fetchAlerts();
  }, []);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

  const fetchAlerts = async () => {
    if (!state.store?.id) {
      toast({
        title: "Error",
        description: "Store not selected. Please select a store first.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/inventory/alerts?storeId=${state.store.id}`, {
        credentials: 'include'
      });
      const result = await response.json();
      
      if (result.success) {
        setAlerts(result.data);
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to fetch alerts",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch alerts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter alerts
  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.product?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesFilter = true;
    if (filterType === 'unread') {
      matchesFilter = !alert.isRead;
    } else if (filterType === 'read') {
      matchesFilter = alert.isRead;
    }
    
    return matchesSearch && matchesFilter;
  });

  // Calculate alert stats
  const totalAlerts = alerts.length;
  const unreadAlerts = alerts.filter(a => !a.isRead).length;
  const lowStockAlerts = alerts.filter(a => a.type === 'low_stock').length;
  const outOfStockAlerts = alerts.filter(a => a.type === 'out_of_stock').length;

  const markAsRead = async (alertId: string) => {
    // TODO: Implement when backend API is available
    toast({
      title: "Info",
      description: "Mark as read functionality not implemented yet",
      variant: "default",
    });
  };

  const markAllAsRead = async () => {
    // TODO: Implement when backend API is available
    toast({
      title: "Info",
      description: "Mark all as read functionality not implemented yet",
      variant: "default",
    });
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'low_stock':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'out_of_stock':
        return <Box className="h-5 w-5 text-red-500" />;
      case 'reorder_reminder':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'payment_failed':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'order_cancelled':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getAlertBadgeVariant = (type: string) => {
    switch (type) {
      case 'low_stock':
        return 'warning';
      case 'out_of_stock':
        return 'destructive';
      case 'reorder_reminder':
        return 'default';
      case 'payment_failed':
        return 'destructive';
      case 'order_cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getAlertTypeLabel = (type: string) => {
    switch (type) {
      case 'low_stock':
        return 'Low Stock';
      case 'out_of_stock':
        return 'Out of Stock';
      case 'reorder_reminder':
        return 'Reorder Reminder';
      case 'payment_failed':
        return 'Payment Failed';
      case 'order_cancelled':
        return 'Order Cancelled';
      default:
        return type;
    }
  };

  const alertColumns = [
    {
      key: 'type',
      title: 'Type',
      render: (value: string, alert: InventoryAlert) => (
        <div className="flex items-center gap-2">
          {getAlertIcon(value)}
          <Badge variant={getAlertBadgeVariant(value) as any}>
            {getAlertTypeLabel(value)}
          </Badge>
        </div>
      ),
    },
    {
      key: 'message',
      title: 'Message',
      render: (value: string, alert: InventoryAlert) => (
        <div>
          <div className="font-medium">{value}</div>
          {alert.product && (
            <div className="text-sm text-muted-foreground">
              Product: {alert.product.name}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'createdAt',
      title: 'Created At',
      render: (value: string) => (
        <div>
          {new Date(value).toLocaleString()}
        </div>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      render: (value: any, alert: InventoryAlert) => (
        <Badge variant={alert.isRead ? 'secondary' : 'default'}>
          {alert.isRead ? 'Read' : 'Unread'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (value: any, alert: InventoryAlert) => (
        <div className="flex items-center gap-2">
          {!alert.isRead && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAsRead(alert.id)}
            >
              <CheckCircle className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedAlert(alert);
              setShowDetailsDialog(true);
            }}
          >
            View Details
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs actions={[
        { 
          label: 'Mark All as Read', 
          icon: CheckCircle, 
          variant: 'outline',
          onClick: markAllAsRead
        }
      ]} />

      <h2 className="text-3xl font-bold tracking-tight">Inventory Alerts</h2>
      <p className="text-muted-foreground">Manage and view inventory-related alerts and notifications.</p>

      {/* Alert Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Alerts"
          value={totalAlerts}
          description="All inventory alerts"
          icon={AlertTriangle}
        />
        <MetricCard
          title="Unread Alerts"
          value={unreadAlerts}
          description="Need attention"
          icon={AlertTriangle}
          badge={unreadAlerts > 0 ? { text: 'New', variant: 'destructive' } : undefined}
        />
        <MetricCard
          title="Low Stock"
          value={lowStockAlerts}
          description="Items need restocking"
          icon={AlertTriangle}
        />
        <MetricCard
          title="Out of Stock"
          value={outOfStockAlerts}
          description="Items unavailable"
          icon={Box}
          badge={outOfStockAlerts > 0 ? { text: 'Critical', variant: 'destructive' } : undefined}
        />
      </div>

      {/* Filters */}
      <Card className="rounded-sm">
        <CardHeader>
          <CardTitle>Alert Filters</CardTitle>
          <CardDescription>Filter alerts by type and search</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search alerts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterType === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('all')}
              >
                All ({totalAlerts})
              </Button>
              <Button
                variant={filterType === 'unread' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('unread')}
              >
                Unread ({unreadAlerts})
              </Button>
              <Button
                variant={filterType === 'read' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('read')}
              >
                Read ({totalAlerts - unreadAlerts})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts Table */}
      <Card className="rounded-sm">
        <CardHeader>
          <CardTitle>Inventory Alerts</CardTitle>
          <CardDescription>
            List of all inventory alerts and notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 bg-muted rounded animate-pulse"></div>
              ))}
            </div>
          ) : filteredAlerts.length === 0 ? (
            <div className="text-center py-8">
              <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-medium">No alerts found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {filterType === 'unread' ? 'No unread alerts.' : 'No alerts match your filters.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAlerts.map(alert => (
                <div
                  key={alert.id}
                  className={`p-4 border rounded-lg ${
                    alert.isRead ? 'bg-muted/50' : 'bg-background'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {getAlertIcon(alert.type)}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={getAlertBadgeVariant(alert.type) as any}>
                            {getAlertTypeLabel(alert.type)}
                          </Badge>
                          {!alert.isRead && (
                            <Badge variant="default">New</Badge>
                          )}
                        </div>
                        <p className="text-sm">{alert.message}</p>
                        {alert.product && (
                          <div className="mt-2 text-xs text-muted-foreground">
                            <p>Product: {alert.product.name}</p>
                            <p>Current Stock: {alert.product.stock} units</p>
                            <p>Threshold: {alert.product.lowStockThreshold} units</p>
                          </div>
                        )}
                        <p className="mt-2 text-xs text-muted-foreground">
                          Created: {new Date(alert.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!alert.isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(alert.id)}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedAlert(alert);
                          setShowDetailsDialog(true);
                        }}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alert Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alert Details</DialogTitle>
            <DialogDescription>
              Detailed information about the inventory alert
            </DialogDescription>
          </DialogHeader>
          
          {selectedAlert && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {getAlertIcon(selectedAlert.type)}
                <Badge variant={getAlertBadgeVariant(selectedAlert.type) as any}>
                  {getAlertTypeLabel(selectedAlert.type)}
                </Badge>
                <Badge variant={selectedAlert.isRead ? 'secondary' : 'default'}>
                  {selectedAlert.isRead ? 'Read' : 'Unread'}
                </Badge>
              </div>
              
              <div>
                <Label>Message</Label>
                <p className="text-sm text-muted-foreground">{selectedAlert.message}</p>
              </div>
              
              <div>
                <Label>Created At</Label>
                <p className="text-sm text-muted-foreground">
                  {new Date(selectedAlert.createdAt).toLocaleString()}
                </p>
              </div>
              
              {selectedAlert.product && (
                <div className="space-y-2">
                  <Label>Product Information</Label>
                  <div className="text-sm space-y-1">
                    <p><span className="font-medium">Name:</span> {selectedAlert.product.name}</p>
                    <p><span className="font-medium">Current Stock:</span> {selectedAlert.product.stock} units</p>
                    <p><span className="font-medium">Low Stock Threshold:</span> {selectedAlert.product.lowStockThreshold} units</p>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            {!selectedAlert?.isRead && (
              <Button onClick={() => {
                if (selectedAlert) markAsRead(selectedAlert.id);
                setShowDetailsDialog(false);
              }}>
                Mark as Read
              </Button>
            )}
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
