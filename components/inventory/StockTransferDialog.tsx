'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { inventoryApi } from '@/lib/api';
import { Product } from '@/lib/types';

interface StockTransferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: Product[];
  onTransferComplete: () => void;
}

export function StockTransferDialog({ 
  open, 
  onOpenChange, 
  products, 
  onTransferComplete 
}: StockTransferDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [transferForm, setTransferForm] = useState({
    fromProductId: '',
    fromVariantId: '',
    toProductId: '',
    toVariantId: '',
    quantity: 1,
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!transferForm.fromProductId || !transferForm.toProductId) {
      toast({
        title: "Validation Error",
        description: "Please select both source and destination products",
        variant: "destructive",
      });
      return;
    }

    if (transferForm.fromProductId === transferForm.toProductId && 
        transferForm.fromVariantId === transferForm.toVariantId) {
      toast({
        title: "Validation Error",
        description: "Source and destination cannot be the same",
        variant: "destructive",
      });
      return;
    }

    if (transferForm.quantity <= 0) {
      toast({
        title: "Validation Error",
        description: "Quantity must be greater than 0",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      // First, reduce stock from source
      const reduceResult = await inventoryApi.createStockAdjustment({
        productId: transferForm.fromProductId,
        variantId: transferForm.fromVariantId || undefined,
        quantityChange: -transferForm.quantity,
        reason: 'TRANSFER',
        notes: `Transfer to ${transferForm.toProductId}. ${transferForm.notes}`
      });

      if (!reduceResult.success) {
        throw new Error(reduceResult.error || 'Failed to reduce source stock');
      }

      // Then, increase stock at destination
      const increaseResult = await inventoryApi.createStockAdjustment({
        productId: transferForm.toProductId,
        variantId: transferForm.toVariantId || undefined,
        quantityChange: transferForm.quantity,
        reason: 'TRANSFER',
        notes: `Transfer from ${transferForm.fromProductId}. ${transferForm.notes}`
      });

      if (!increaseResult.success) {
        // If increasing stock fails, we should try to rollback the reduction
        // This is a simplified rollback - in production you might want a proper transaction
        try {
          await inventoryApi.createStockAdjustment({
            productId: transferForm.fromProductId,
            variantId: transferForm.fromVariantId || undefined,
            quantityChange: transferForm.quantity,
            reason: 'CORRECTION',
            notes: 'Rollback of failed transfer'
          });
        } catch (rollbackError) {
          console.error('Rollback failed:', rollbackError);
        }
        throw new Error(increaseResult.error || 'Failed to increase destination stock');
      }

      toast({
        title: "Success",
        description: "Stock transferred successfully",
      });

      // Reset form
      setTransferForm({
        fromProductId: '',
        fromVariantId: '',
        toProductId: '',
        toVariantId: '',
        quantity: 1,
        notes: ''
      });

      onOpenChange(false);
      onTransferComplete();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to transfer stock",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getSourceProduct = () => {
    return products.find(p => p.id === transferForm.fromProductId);
  };

  const getDestinationProduct = () => {
    return products.find(p => p.id === transferForm.toProductId);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Transfer Stock</DialogTitle>
          <DialogDescription>
            Move stock between products or variants within the same store
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Source Product */}
            <div className="space-y-2">
              <Label htmlFor="fromProductId">From Product *</Label>
              <Select 
                value={transferForm.fromProductId} 
                onValueChange={(value) => setTransferForm({ 
                  ...transferForm, 
                  fromProductId: value,
                  fromVariantId: '' // Reset variant when product changes
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select source product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} ({product.stock} {product.unit})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Source Variant */}
            <div className="space-y-2">
              <Label htmlFor="fromVariantId">From Variant (Optional)</Label>
              <Select 
                value={transferForm.fromVariantId} 
                onValueChange={(value) => setTransferForm({ ...transferForm, fromVariantId: value })}
                disabled={!transferForm.fromProductId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select source variant" />
                </SelectTrigger>
                <SelectContent>
                  {getSourceProduct()?.variants?.map((variant) => (
                    <SelectItem key={variant.id} value={variant.id}>
                      {variant.name} ({variant.stock} {variant.sku})
                    </SelectItem>
                  )) || []}
                </SelectContent>
              </Select>
            </div>

            {/* Destination Product */}
            <div className="space-y-2">
              <Label htmlFor="toProductId">To Product *</Label>
              <Select 
                value={transferForm.toProductId} 
                onValueChange={(value) => setTransferForm({ 
                  ...transferForm, 
                  toProductId: value,
                  toVariantId: '' // Reset variant when product changes
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select destination product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} ({product.stock} {product.unit})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Destination Variant */}
            <div className="space-y-2">
              <Label htmlFor="toVariantId">To Variant (Optional)</Label>
              <Select 
                value={transferForm.toVariantId} 
                onValueChange={(value) => setTransferForm({ ...transferForm, toVariantId: value })}
                disabled={!transferForm.toProductId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select destination variant" />
                </SelectTrigger>
                <SelectContent>
                  {getDestinationProduct()?.variants?.map((variant) => (
                    <SelectItem key={variant.id} value={variant.id}>
                      {variant.name} ({variant.stock} {variant.sku})
                    </SelectItem>
                  )) || []}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Quantity */}
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity *</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={transferForm.quantity}
              onChange={(e) => setTransferForm({ ...transferForm, quantity: parseInt(e.target.value) || 1 })}
              required
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={transferForm.notes}
              onChange={(e) => setTransferForm({ ...transferForm, notes: e.target.value })}
              placeholder="Additional notes about this transfer..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Transferring..." : "Transfer Stock"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
