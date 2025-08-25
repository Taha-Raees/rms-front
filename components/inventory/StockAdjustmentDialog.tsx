'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { inventoryApi } from '@/lib/api';
import { Product } from '@/lib/types';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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

interface StockAdjustmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: Product[];
  onAdjustmentComplete: () => void;
}

const STOCK_ADJUSTMENT_REASONS = [
  { value: 'SALE', label: 'Sale' },
  { value: 'RETURN', label: 'Return' },
  { value: 'DAMAGE', label: 'Damage' },
  { value: 'THEFT', label: 'Theft' },
  { value: 'CORRECTION', label: 'Correction' },
  { value: 'RECEIPT', label: 'Receipt' },
  { value: 'TRANSFER', label: 'Transfer' },
];

export function StockAdjustmentDialog({
  open,
  onOpenChange,
  products,
  onAdjustmentComplete
}: StockAdjustmentDialogProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    productId: '',
    variantId: '',
    quantityChange: 0,
    reason: 'CORRECTION',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const result = await inventoryApi.createStockAdjustment(formData);
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Stock adjusted successfully",
          variant: "default",
        });
        onOpenChange(false);
        setFormData({
          productId: '',
          variantId: '',
          quantityChange: 0,
          reason: 'CORRECTION',
          notes: ''
        });
        onAdjustmentComplete();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to adjust stock",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to adjust stock",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Adjust Stock</DialogTitle>
          <DialogDescription>
            Manually adjust stock levels for products
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="productId">Product *</Label>
              <Select 
                value={formData.productId} 
                onValueChange={(value) => setFormData({ ...formData, productId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select product" />
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
            <div>
              <Label htmlFor="reason">Reason *</Label>
              <Select 
                value={formData.reason} 
                onValueChange={(value) => setFormData({ ...formData, reason: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STOCK_ADJUSTMENT_REASONS.map((reason) => (
                    <SelectItem key={reason.value} value={reason.value}>
                      {reason.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quantityChange">Quantity Change *</Label>
              <Input
                id="quantityChange"
                type="number"
                value={formData.quantityChange}
                onChange={(e) => setFormData({ ...formData, quantityChange: parseInt(e.target.value) || 0 })}
                required
              />
              <p className="text-sm text-muted-foreground mt-1">
                Use negative numbers to reduce stock
              </p>
            </div>
            <div>
              <Label htmlFor="variantId">Variant (Optional)</Label>
              <Select 
                value={formData.variantId} 
                onValueChange={(value) => setFormData({ ...formData, variantId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select variant" />
                </SelectTrigger>
                <SelectContent>
                  {products
                    .filter(p => p.id === formData.productId)
                    .flatMap(p => p.variants || [])
                    .map((variant) => (
                      <SelectItem key={variant.id} value={variant.id}>
                        {variant.name} ({variant.stock} {variant.sku})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Input
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes about this adjustment..."
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Adjust Stock
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
