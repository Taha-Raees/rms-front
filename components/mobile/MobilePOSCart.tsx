'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronUp, ChevronDown, Trash2, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CartItem {
  id: string;
  productId: string;
  product: any;
  quantity: number;
  weight?: number;
  unitPrice: number;
  totalPrice: number;
  displayText: string;
  variantId?: string;
  variant?: any;
}

interface CalculationResult {
  subtotal: number;
  tax: number;
  total: number;
  taxRate: number;
}

interface MobilePOSCartProps {
  cart: CartItem[];
  calculation?: CalculationResult | null;
  onRemoveFromCart: (itemId: string) => void;
  onClearCart: () => void;
  onCheckout?: (paymentMethod?: string) => void;
  expandedByDefault?: boolean;
}

export function MobilePOSCart({
  cart,
  calculation,
  onRemoveFromCart,
  onClearCart,
  onCheckout,
  expandedByDefault = false
}: MobilePOSCartProps) {
  const [isExpanded, setIsExpanded] = useState(expandedByDefault);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const itemCount = cart.length;
  const totalAmount = calculation?.total || 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t">
      {!isExpanded ? (
        /* Collapsed cart - shows total only */
        <div
          className="w-full p-4 cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={toggleExpanded}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShoppingCart className="h-5 w-5" />
              <span className="font-medium">
                {itemCount === 0 ? 'Cart Empty' : `${itemCount} items`}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold">
                PKR {totalAmount.toFixed(2)}
              </span>
              <ChevronUp className="h-5 w-5" />
            </div>
          </div>
        </div>
      ) : (
        /* Expanded cart - shows full cart */
        <Card className="rounded-none border-x-0 border-b-0">
          <CardContent className="p-4 max-h-80 overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <ShoppingCart className="h-5 w-5" />
                <span className="font-semibold">Cart ({itemCount})</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleExpanded}
                className="p-1 h-8 w-8"
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>

            {/* Cart Items */}
            {itemCount === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Your cart is empty</p>
              </div>
            ) : (
              <>
                <div className="space-y-3 mb-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-2 border rounded-lg">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.product?.name || item.displayText}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {item.displayText}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            PKR {item.unitPrice}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-2">
                        <span className="font-semibold text-sm">
                          {item.totalPrice ? `PKR ${item.totalPrice.toFixed(2)}` : 'Calculating...'}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRemoveFromCart(item.id)}
                          className="p-1 h-8 w-8 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  {/* Summary */}
                  {calculation && (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>PKR {calculation.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax ({(calculation.taxRate * 100).toFixed(1)}%):</span>
                        <span>PKR {calculation.tax.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg border-t pt-2">
                        <span>Total:</span>
                        <span>PKR {calculation.total.toFixed(2)}</span>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={onClearCart}
                      className="flex-1"
                      disabled={itemCount === 0}
                    >
                      Clear Cart
                    </Button>
                    <Button
                      onClick={() => onCheckout?.('card')}
                      className="flex-1"
                      disabled={itemCount === 0}
                    >
                      Checkout
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
