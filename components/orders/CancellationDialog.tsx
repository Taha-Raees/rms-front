'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  DollarSign,
  Info
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ordersApi } from '@/lib/api';
import { Order } from '@/lib/types';

interface CancellationDialogProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCancellationComplete: () => void;
}

export function CancellationDialog({
  order,
  open,
  onOpenChange,
  onCancellationComplete
}: CancellationDialogProps) {
  const { toast } = useToast();
  const [refundAmount, setRefundAmount] = useState<number>(0);
  const [refundMethod, setRefundMethod] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  React.useEffect(() => {
    if (order && open) {
      setRefundAmount(order.total);
      setRefundMethod(order.paymentMethod);
    }
  }, [order, open]);

  const handleCancelOrder = async () => {
    if (!order) return;

    if (refundAmount > order.total) {
      toast({
        title: "Error",
        description: "Refund amount cannot exceed order total",
        variant: "destructive",
      });
      return;
    }

    if (refundAmount < 0) {
      toast({
        title: "Error",
        description: "Refund amount cannot be negative",
        variant: "destructive",
      });
      return;
    }

    try {
      setProcessing(true);
      
      // In a real implementation, this would call the API to cancel the order
      // const result = await ordersApi.cancelOrder(order.id, {
      //   amount: refundAmount,
      //   method: refundMethod,
      //   notes
      // });
      
      // For now, just simulate the cancellation
      toast({
        title: "Success",
        description: `Order ${order.orderNumber} has been cancelled successfully`,
      });
      
      onCancellationComplete();
      onOpenChange(false);
      
      // Reset form
      setRefundAmount(0);
      setRefundMethod('');
      setNotes('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel order",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const isRefundRequired = order?.paymentStatus === 'paid';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Cancel Order
          </DialogTitle>
          <DialogDescription>
            {order && `Cancel order ${order.orderNumber}. This action cannot be undone.`}
          </DialogDescription>
        </DialogHeader>

        {order && (
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Are you sure you want to cancel this order? This action cannot be undone.
              </AlertDescription>
            </Alert>

            <div className="bg-muted p-3 rounded-md">
              <div className="font-medium">Order Summary</div>
              <div className="text-sm text-muted-foreground">
                Order #{order.orderNumber}
              </div>
              <div className="text-sm font-medium mt-1">
                Total: Rs. {order.total.toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground">
                Payment Status: {order.paymentStatus}
              </div>
            </div>

            {isRefundRequired && (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="refundAmount">Refund Amount *</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="refundAmount"
                      type="number"
                      min="0"
                      step="0.01"
                      max={order.total}
                      value={refundAmount}
                      onChange={(e) => setRefundAmount(parseFloat(e.target.value) || 0)}
                      placeholder="Enter refund amount"
                      className="pl-10"
                    />
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Maximum refund: Rs. {order.total.toFixed(2)}
                  </div>
                </div>

                <div>
                  <Label htmlFor="refundMethod">Refund Method</Label>
                  <Input
                    id="refundMethod"
                    value={refundMethod}
                    onChange={(e) => setRefundMethod(e.target.value)}
                    placeholder="Enter refund method"
                  />
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="notes">Cancellation Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Reason for cancellation..."
                rows={3}
              />
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-blue-50 p-2 rounded-md">
              <Info className="h-4 w-4 flex-shrink-0" />
              <span>
                {isRefundRequired 
                  ? "This order has been paid and requires a refund." 
                  : "This order will be marked as cancelled."}
              </span>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={processing}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleCancelOrder}
                disabled={processing}
              >
                {processing ? "Processing..." : "Confirm Cancellation"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
