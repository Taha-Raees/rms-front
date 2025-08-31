'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Printer, Receipt, Clock, CreditCard, CheckCircle } from 'lucide-react';

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  subtotal: number;
  tax: number;
  total: number;
  taxRate: number;
  change?: number;
  createdAt: Date;
  items: Array<{
    id: string;
    product: { name: string };
    variant?: { name: string };
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
}

interface MobileOrderDetailProps {
  order: Order;
  onBack: () => void;
  onPrint?: (order: Order) => void;
}

export function MobileOrderDetail({ order, onBack, onPrint }: MobileOrderDetailProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'pending': return <Clock className="h-5 w-5 text-yellow-500" />;
      default: return <Receipt className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'cancelled': return 'destructive';
      default: return 'default';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePrint = () => {
    if (onPrint) {
      onPrint(order);
    } else {
      // Default print functionality - create a simple print window
      const printContent = `
        <html>
          <head>
            <title>Receipt - Order ${order.orderNumber}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              .receipt { max-width: 300px; margin: 0 auto; }
              .header { text-align: center; margin-bottom: 20px; }
              .details { margin-bottom: 15px; }
              .item { display: flex; justify-content: space-between; padding: 5px 0; }
              .totals { border-top: 1px dashed #000; padding-top: 10px; }
              .total { display: flex; justify-content: space-between; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="receipt">
              <div class="header">
                <h2>Receipt</h2>
                <p>Order #${order.orderNumber}</p>
                <p>${formatDate(order.createdAt)}</p>
              </div>
              <div class="details">
                ${order.items.map(item => `
                  <div class="item">
                    <span>${item.product.name} x${item.quantity}</span>
                    <span>PKR ${item.totalPrice.toFixed(2)}</span>
                  </div>
                `).join('')}
              </div>
              <div class="totals">
                <div class="item">
                  <span>Subtotal:</span>
                  <span>PKR ${order.subtotal.toFixed(2)}</span>
                </div>
                <div class="item">
                  <span>Tax (${(order.taxRate * 100).toFixed(1)}%):</span>
                  <span>PKR ${order.tax.toFixed(2)}</span>
                </div>
                <div class="total">
                  <span>Total:</span>
                  <span>PKR ${order.total.toFixed(2)}</span>
                </div>
                ${order.change && order.change > 0 ? `
                  <div class="item" style="color: green;">
                    <span>Change:</span>
                    <span>PKR ${order.change.toFixed(2)}</span>
                  </div>
                ` : ''}
              </div>
              <div style="text-align: center; margin-top: 20px; font-size: 12px;">
                <p>Payment: ${order.paymentMethod.toUpperCase()}</p>
                <p>Thank you for your business!</p>
              </div>
            </div>
          </body>
        </html>
      `;

      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="h-8 w-8 p-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl font-bold">Order #{order.orderNumber}</h1>
          <p className="text-sm text-muted-foreground">Order details</p>
        </div>
      </div>

      {/* Order Status Card */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {getStatusIcon(order.status)}
              <span className="font-medium">Status</span>
            </div>
            <Badge
              variant={getStatusBadgeVariant(order.status) as any}
              className="capitalize"
            >
              {order.status}
            </Badge>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date:</span>
              <span>{formatDate(order.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment:</span>
              <div className="flex items-center gap-1">
                <CreditCard className="h-3 w-3" />
                <span className="capitalize">{order.paymentMethod}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Items Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Items ({order.items.length})</CardTitle>
          <CardDescription>Products in this order</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between items-center p-3 border rounded-lg">
              <div>
                <p className="font-medium">{item.product.name}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{item.quantity} × PKR {item.unitPrice.toFixed(2)}</span>
                  {item.variant && (
                    <Badge variant="outline" className="text-xs">
                      {item.variant.name}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold">PKR {item.totalPrice.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Totals Card */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span>PKR {order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tax ({(order.taxRate * 100).toFixed(1)}%):</span>
              <span>PKR {order.tax.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>Total:</span>
              <span>PKR {order.total.toFixed(2)}</span>
            </div>
            {order.change && order.change > 0 && (
              <>
                <div className="flex justify-between text-sm text-green-600">
                  <span>Change:</span>
                  <span>PKR {order.change.toFixed(2)}</span>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-2">
        <Button onClick={handlePrint} className="flex-1" variant="outline">
          <Printer className="h-4 w-4 mr-2" />
          Print Receipt
        </Button>
      </div>
    </div>
  );
}
