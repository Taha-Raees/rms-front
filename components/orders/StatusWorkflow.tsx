'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Package, 
  Search,
  RefreshCw,
  Clock,
  Truck,
  Check
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ordersApi } from '@/lib/api';
import { Order } from '@/lib/types';
import { format } from 'date-fns';

interface StatusTransition {
  from: string;
  to: string;
  allowed: boolean;
  reason?: string;
}

export function StatusWorkflow() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [notes, setNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const result = await ordersApi.getAll();
      
      if (result.success && result.data) {
        setOrders(result.data);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'processing':
        return <Package className="h-4 w-4" />;
      case 'completed':
        return <Check className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      case 'refunded':
        return <Truck className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAllowedTransitions = (currentStatus: string): string[] => {
    const transitions: Record<string, string[]> = {
      'pending': ['processing', 'cancelled'],
      'processing': ['completed', 'cancelled'],
      'completed': ['refunded'],
      'cancelled': [],
      'refunded': []
    };
    
    return transitions[currentStatus] || [];
  };

  const updateOrderStatus = async (newStatus: string) => {
    if (!selectedOrder) {
      toast({
        title: "Error",
        description: "No order selected",
        variant: "destructive",
      });
      return;
    }

    const allowedTransitions = getAllowedTransitions(selectedOrder.status);
    if (!allowedTransitions.includes(newStatus)) {
      toast({
        title: "Error",
        description: `Cannot transition from ${selectedOrder.status} to ${newStatus}`,
        variant: "destructive",
      });
      return;
    }

    try {
      setProcessing(true);
      // In a real implementation, this would call the API to update the order status
      // const result = await ordersApi.updateStatus(selectedOrder.id, newStatus, notes);
      
      // For now, just simulate the update
      const updatedOrder = {
        ...selectedOrder,
        status: newStatus as any,
        updatedAt: new Date()
      };
      
      // Update local state
      setOrders(orders.map(order => 
        order.id === selectedOrder.id ? updatedOrder : order
      ));
      
      setSelectedOrder(updatedOrder);
      
      toast({
        title: "Success",
        description: `Order status updated to ${newStatus}`,
      });
      
      // Reset form
      setNotes('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const filteredOrders = orders.filter(order => 
    order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const allowedTransitions = selectedOrder ? getAllowedTransitions(selectedOrder.status) : [];

  return (
    <div className="space-y-6">
      <Card className="rounded-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Order Status Workflow
          </CardTitle>
          <CardDescription>
            Manage order status transitions with validation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-2">
            <Button onClick={loadOrders} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Load Orders
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="search">Search Orders</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="search"
                    placeholder="Search by order number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label>Select Order</Label>
                <div className="max-h-60 overflow-y-auto border rounded-md">
                  {filteredOrders.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                      No orders found
                    </div>
                  ) : (
                    <div className="divide-y">
                      {filteredOrders.map(order => (
                        <div
                          key={order.id}
                          className={`p-3 cursor-pointer hover:bg-muted/50 transition-colors ${
                            selectedOrder?.id === order.id ? 'bg-muted' : ''
                          }`}
                          onClick={() => setSelectedOrder(order)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium">{order.orderNumber}</div>
                              <div className="text-sm text-muted-foreground">
                                Total: Rs. {order.total.toFixed(2)}
                              </div>
                            </div>
                            <Badge className={getStatusColor(order.status)}>
                              <div className="flex items-center gap-1">
                                {getStatusIcon(order.status)}
                                {order.status}
                              </div>
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {format(new Date(order.createdAt), 'MMM dd, yyyy HH:mm')}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {selectedOrder && (
                <div className="space-y-4">
                  <div>
                    <Label>Selected Order</Label>
                    <div className="p-3 border rounded-md bg-muted">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{selectedOrder.orderNumber}</div>
                          <div className="text-sm text-muted-foreground">
                            {selectedOrder.customerName || 'Walk-in Customer'}
                          </div>
                        </div>
                        <Badge className={getStatusColor(selectedOrder.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(selectedOrder.status)}
                            {selectedOrder.status}
                          </div>
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mt-2">
                        Order Total: <span className="font-medium">Rs. {selectedOrder.total.toFixed(2)}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Created: {format(new Date(selectedOrder.createdAt), 'MMM dd, yyyy HH:mm')}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Last Updated: {format(new Date(selectedOrder.updatedAt), 'MMM dd, yyyy HH:mm')}
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label>Allowed Status Transitions</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {allowedTransitions.length > 0 ? (
                        allowedTransitions.map(status => (
                          <Button
                            key={status}
                            variant="outline"
                            size="sm"
                            disabled={processing}
                            onClick={() => updateOrderStatus(status)}
                            className="flex items-center gap-2"
                          >
                            {getStatusIcon(status)}
                            {status}
                          </Button>
                        ))
                      ) : (
                        <div className="col-span-2 text-center text-muted-foreground py-2">
                          No allowed transitions from current status
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add notes about this status change..."
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedOrder && (
        <Card className="rounded-sm">
          <CardHeader>
            <CardTitle>Order Timeline</CardTitle>
            <CardDescription>
              Status history for order {selectedOrder.orderNumber}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <div>
                  <div className="font-medium">Order Created</div>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(selectedOrder.createdAt), 'MMM dd, yyyy HH:mm')}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${selectedOrder.status !== 'pending' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <div>
                  <div className="font-medium">Status: {selectedOrder.status}</div>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(selectedOrder.updatedAt), 'MMM dd, yyyy HH:mm')}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
