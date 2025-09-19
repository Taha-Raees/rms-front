'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Calendar, Download, Eye, Printer, RefreshCw, CreditCard } from 'lucide-react';

import { DataTable } from '@/components/ui/data-table';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useDeviceAdaptive } from '@/hooks/use-device-adaptive';
import { MobileOrdersManager } from '@/components/mobile/MobileOrdersManager';
import { ordersApi } from '@/lib/api';
import { Order, Product, ProductVariant, OrderItem } from '@/lib/types';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function OrdersPage() {
  const { toast } = useToast();
  const { state: authState } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed' | 'cancelled'>('all');
  const [filterPayment, setFilterPayment] = useState<'all' | 'cash' | 'card' | 'jazzcash' | 'easypaisa'>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [filterStatus, filterPayment, searchTerm]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const storeId = authState.store?.id;
      const result = await ordersApi.getAll(storeId);
      
      if (result.success && result.data) {
        setOrders(result.data);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch orders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchOrders();
    toast({
      title: "Refreshed",
      description: "Order list updated.",
    });
  };

  const handleViewOrder = async (orderId: string) => {
    try {
      const result = await ordersApi.getById(orderId);
      if (result.success && result.data) {
        setSelectedOrder(result.data);
        setShowOrderModal(true);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch order details",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch order details",
        variant: "destructive",
      });
    }
  };

  const handlePrintReceipt = (order: Order) => {
    // Create a simple print-friendly receipt
    const printContent = `
      <div style="font-family: Arial, sans-serif; max-width: 300px; margin: 0 auto; padding: 20px;">
        <h2 style="text-align: center; margin-bottom: 20px;">${authState.store?.name || 'Store'}</h2>
        <div style="border-bottom: 1px dashed #000; padding-bottom: 10px; margin-bottom: 10px;">
          <p><strong>Order #:</strong> ${order.orderNumber}</p>
          <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
        </div>
        <div style="margin-bottom: 15px;">
          ${order.items.map(item => `
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
              <span>${item.product.name} x${item.quantity}</span>
              <span>PKR ${item.totalPrice.toFixed(2)}</span>
            </div>
          `).join('')}
        </div>
        <div style="border-top: 1px dashed #000; padding-top: 10px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
            <span>Subtotal:</span>
            <span>PKR ${order.subtotal.toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
            <span>Tax (${(order.taxRate * 100).toFixed(1)}%):</span>
            <span>PKR ${order.tax.toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 1.1em;">
            <span>Total:</span>
            <span>PKR ${order.total.toFixed(2)}</span>
          </div>
        </div>
        <div style="text-align: center; margin-top: 20px; font-size: 0.9em;">
          <p>Thank you for your purchase!</p>
          <p>Payment: ${order.paymentMethod.toUpperCase()}</p>
        </div>
      </div>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Receipt - Order ${order.orderNumber}</title>
            <style>
              body { margin: 0; padding: 20px; }
              @media print {
                body { margin: 0; padding: 0; }
              }
            </style>
          </head>
          <body>${printContent}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const orderColumns: any[] = [
    {
      key: 'orderNumber',
      title: 'Order #',
      sortable: true,
      render: (value: string) => <div className="font-medium">{value}</div>,
    },
    {
      key: 'createdAt',
      title: 'Date',
      sortable: true,
      render: (value: Date) => new Date(value).toLocaleString(),
    },
    {
      key: 'total',
      title: 'Total',
      sortable: true,
      render: (value: number) => <div className="font-medium">PKR {value.toFixed(2)}</div>,
    },
    {
      key: 'paymentMethod',
      title: 'Payment Method',
      render: (value: string) => (
        <Badge variant="outline" className="capitalize">
          {value}
        </Badge>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      render: (value: Order['status']) => {
        let variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' = 'default';
        if (value === 'completed') {
          variant = 'success';
        } else if (value === 'pending') {
          variant = 'warning';
        } else if (value === 'cancelled') {
          variant = 'destructive';
        }
        return <Badge variant={variant} className="capitalize">{value}</Badge>;
      },
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (value: any, order: Order) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => handleViewOrder(order.id)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handlePrintReceipt(order)}>
            <Printer className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const { shouldUseMobileView } = useDeviceAdaptive();

  // Mobile view
  if (shouldUseMobileView) {
    return (
      <MobileOrdersManager
        orders={orders}
        loading={loading}
        onRefreshOrders={handleRefresh}
      />
    );
  }

  // Desktop view
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Order Management</h2>
      <p className="text-muted-foreground">View and manage all customer orders.</p>

      <Card className="rounded-sm">
        <CardHeader>
          <CardTitle>Order List</CardTitle>
          <CardDescription>Browse, filter, and manage your store's sales orders.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search orders by number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={filterStatus} onValueChange={(value: 'all' | 'pending' | 'completed' | 'cancelled') => setFilterStatus(value)}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterPayment} onValueChange={(value: 'all' | 'cash' | 'card' | 'jazzcash' | 'easypaisa') => setFilterPayment(value)}>
                <SelectTrigger className="w-[180px]">
                  <CreditCard className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by Payment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payments</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="jazzcash">JazzCash</SelectItem>
                  <SelectItem value="easypaisa">EasyPaisa</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <DataTable
            data={orders}
            columns={orderColumns}
            searchPlaceholder="Search orders..."
            pageSize={10}
          />
        </CardContent>
      </Card>

      {/* Order Details Modal */}
      <Dialog open={showOrderModal} onOpenChange={setShowOrderModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              Order #{selectedOrder?.orderNumber}
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Date</p>
                  <p className="font-medium">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <Badge 
                    variant={
                      selectedOrder.status === 'completed' ? 'success' :
                      selectedOrder.status === 'pending' ? 'warning' :
                      selectedOrder.status === 'cancelled' ? 'destructive' : 'default'
                    }
                    className="capitalize"
                  >
                    {selectedOrder.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Payment Method</p>
                  <p className="font-medium capitalize">{selectedOrder.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Payment Status</p>
                  <p className="font-medium capitalize">{selectedOrder.paymentStatus}</p>
                </div>
              </div>

              {/* Items */}
              <div>
                <h3 className="font-semibold mb-3">Items</h3>
                <div className="space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-md">
                      <div>
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.quantity} x PKR {item.unitPrice.toFixed(2)}
                          {item.variant && ` (${item.variant.name})`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">PKR {item.totalPrice.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="space-y-2 border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>PKR {selectedOrder.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax ({(selectedOrder.taxRate * 100).toFixed(1)}%):</span>
                  <span>PKR {selectedOrder.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>PKR {selectedOrder.total.toFixed(2)}</span>
                </div>
                {selectedOrder.change && selectedOrder.change > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Change:</span>
                    <span>PKR {selectedOrder.change.toFixed(2)}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button onClick={() => handlePrintReceipt(selectedOrder)} className="flex items-center gap-2">
                  <Printer className="h-4 w-4" />
                  Print Receipt
                </Button>
                <Button variant="outline" onClick={() => setShowOrderModal(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
