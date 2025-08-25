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
  CreditCard, 
  DollarSign,
  Search,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ordersApi } from '@/lib/api';
import { Order } from '@/lib/types';
import { format } from 'date-fns';

interface PaymentVerificationResult {
  orderId: string;
  orderNumber: string;
  expectedAmount: number;
  receivedAmount: number;
  variance: number;
  isValid: boolean;
  method: string;
  verifiedAt: Date;
  verifiedBy: string;
}

export function PaymentVerification() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [verificationResults, setVerificationResults] = useState<PaymentVerificationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [receivedAmount, setReceivedAmount] = useState<number>(0);
  const [notes, setNotes] = useState('');

  const loadOrders = async () => {
    try {
      setLoading(true);
      const result = await ordersApi.getAll();
      
      if (result.success && result.data) {
        // Filter for completed orders that need payment verification
        const completedOrders = result.data.filter(order => 
          order.status === 'completed' && order.paymentStatus === 'paid'
        );
        setOrders(completedOrders);
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

  const verifyPayment = async () => {
    if (!selectedOrder) {
      toast({
        title: "Error",
        description: "Please select an order",
        variant: "destructive",
      });
      return;
    }

    if (receivedAmount <= 0) {
      toast({
        title: "Error",
        description: "Received amount must be greater than 0",
        variant: "destructive",
      });
      return;
    }

    try {
      const variance = receivedAmount - selectedOrder.total;
      const isValid = Math.abs(variance) <= 0.01; // Allow small rounding differences
      
      const result: PaymentVerificationResult = {
        orderId: selectedOrder.id,
        orderNumber: selectedOrder.orderNumber,
        expectedAmount: selectedOrder.total,
        receivedAmount,
        variance,
        isValid,
        method: selectedOrder.paymentMethod,
        verifiedAt: new Date(),
        verifiedBy: 'Current User' // In real implementation, get from auth context
      };

      setVerificationResults([result, ...verificationResults.slice(0, 9)]); // Keep last 10 results
      
      toast({
        title: isValid ? "Payment Verified" : "Payment Variance Detected",
        description: isValid 
          ? 'Payment amount matches order total' 
          : `Variance of ${Math.abs(variance).toFixed(2)} ${variance > 0 ? 'overpayment' : 'underpayment'} detected`,
        variant: isValid ? "default" : "destructive",
      });

      // Reset form
      setSelectedOrder(null);
      setReceivedAmount(0);
      setNotes('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify payment",
        variant: "destructive",
      });
    }
  };

  const filteredOrders = orders.filter(order => 
    order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card className="rounded-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Verification
          </CardTitle>
          <CardDescription>
            Verify received payments against order totals
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-2">
            <Button onClick={loadOrders} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Load Orders
            </Button>
          </div>

          {orders.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="search">Search Orders</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="search"
                      placeholder="Search by order number or customer name..."
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
                                {order.customerName || 'Walk-in Customer'}
                              </div>
                              </div>
                              <Badge variant="secondary">
                                {order.paymentMethod}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground flex justify-between mt-1">
                              <span>Total: Rs. {order.total.toFixed(2)}</span>
                              <span>{format(new Date(order.createdAt), 'MMM dd, yyyy')}</span>
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
                          <Badge variant="secondary">
                            {selectedOrder.paymentMethod}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mt-2">
                          Order Total: <span className="font-medium">Rs. {selectedOrder.total.toFixed(2)}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Created: {format(new Date(selectedOrder.createdAt), 'MMM dd, yyyy HH:mm')}
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="receivedAmount">Received Amount *</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                          id="receivedAmount"
                          type="number"
                          min="0"
                          step="0.01"
                          value={receivedAmount}
                          onChange={(e) => setReceivedAmount(parseFloat(e.target.value) || 0)}
                          placeholder="Enter received amount"
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="notes">Notes (Optional)</Label>
                      <Textarea
                        id="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add any notes about this payment verification..."
                      />
                    </div>

                    <Button onClick={verifyPayment} className="w-full">
                      Verify Payment
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {verificationResults.length > 0 && (
        <Card className="rounded-sm">
          <CardHeader>
            <CardTitle>Recent Verifications</CardTitle>
            <CardDescription>
              Last 10 payment verifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {verificationResults.map((result, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {result.isValid ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    )}
                    <div>
                      <div className="font-medium">{result.orderNumber}</div>
                      <div className="text-sm text-muted-foreground">
                        Expected: Rs. {result.expectedAmount.toFixed(2)} • Received: Rs. {result.receivedAmount.toFixed(2)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant={result.isValid ? "default" : "destructive"}>
                      {result.variance > 0 ? '+' : ''}{result.variance.toFixed(2)}
                    </Badge>
                    <Badge variant="secondary">
                      {result.method}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
