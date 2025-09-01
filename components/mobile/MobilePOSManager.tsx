'use client';

import React, { useState } from 'react';
import { MobilePOSView } from './MobilePOSView';
import { MobilePOSCart } from './MobilePOSCart';
import { MobileNumpad } from '@/components/ui/mobile-numpad';
import { Product, ProductVariant } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

type POSView = 'pos';

// Cart item interface (matching the main POS interface)
interface CartItem {
  id: string;
  productId: string;
  product: Product;
  variantId?: string;
  variant?: ProductVariant;
  quantity: number;
  weight?: number;
  unitPrice: number;
  totalPrice: number;
  displayText: string;
}

// Calculation result interface
interface CalculationResult {
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  taxRate: number;
}

// Numpad modes
type NumpadMode = 'quantity' | 'price' | 'checkout' | null;

// Numpad context
interface NumpadContext {
  mode: NumpadMode;
  title: string;
  placeholder: string;
  initialValue?: string;
  productId?: string;
  onSubmit: (value: string) => void;
}

interface MobilePOSManagerProps {
  initialView?: POSView;
  products?: Product[];
  loading?: boolean;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
  onAddToCart?: (product: Product, variant?: any) => void;
  cart?: CartItem[];
  calculation?: CalculationResult | null;
  onRemoveFromCart?: (itemId: string) => void;
  onClearCart?: () => void;
  onCheckout?: () => void;
}

export function MobilePOSManager({
  initialView = 'pos',
  products = [],
  loading = false,
  searchTerm = '',
  onSearchChange,
  onAddToCart,
  cart = [],
  calculation,
  onRemoveFromCart,
  onClearCart,
  onCheckout
}: MobilePOSManagerProps) {
  const [currentView, setCurrentView] = useState<POSView>(initialView);
  const [showNumpad, setShowNumpad] = useState(false);
  const [numpadContext, setNumpadContext] = useState<NumpadContext | null>(null);
  const [numpadValue, setNumpadValue] = useState('');

  // Handle showing numpad for quantity/weight input
  const handleQuantityNumpad = (product: Product, isWeight: boolean = false) => {
    setNumpadContext({
      mode: 'quantity',
      title: isWeight ? 'Enter Weight' : 'Enter Quantity',
      placeholder: isWeight ? 'Weight (kg)' : 'Quantity',
      initialValue: '1',
      productId: product.id,
      onSubmit: (value: string) => {
        const numValue = parseFloat(value);
        if (!isNaN(numValue) && numValue > 0) {
          onAddToCart?.(product, {
            quantity: isWeight ? 1 : numValue,
            weight: isWeight ? numValue : undefined
          });
        }
        setShowNumpad(false);
        setNumpadValue('');
      }
    });
    setShowNumpad(true);
    setNumpadValue('1');
  };

  // Handle showing numpad for custom price input
  const handleCustomPriceNumpad = (product: Product) => {
    setNumpadContext({
      mode: 'price',
      title: 'Enter Custom Price',
      placeholder: 'Price',
      initialValue: product.basePrice.toString(),
      productId: product.id,
      onSubmit: (value: string) => {
        const numValue = parseFloat(value);
        if (!isNaN(numValue) && numValue >= 0) {
          onAddToCart?.(product, {
            customPrice: numValue
          });
        }
        setShowNumpad(false);
        setNumpadValue('');
      }
    });
    setShowNumpad(true);
    setNumpadValue(product.basePrice.toString());
  };

  // Handle checkout numpad for cash payment
  const handleCheckoutNumpad = (amount: number, tax: number, total: number) => {
    setNumpadContext({
      mode: 'checkout',
      title: 'Cash Payment',
      placeholder: `Total: PKR ${total.toFixed(2)}`,
      initialValue: '',
      onSubmit: (value: string) => {
        const cashAmount = parseFloat(value);
        if (!isNaN(cashAmount) && cashAmount >= total) {
          const change = cashAmount - total;
          onCheckout?.();
          alert(`Payment successful!\nPaid: PKR ${cashAmount.toFixed(2)}\nChange: PKR ${change.toFixed(2)}`);
        } else {
          alert('Invalid amount or insufficient cash');
        }
        setShowNumpad(false);
        setNumpadValue('');
      }
    });
    setShowNumpad(true);
    setNumpadValue('');
  };

  if (currentView === 'pos') {
    return (
      <div className="relative">
        <MobilePOSView
          products={products}
          loading={loading}
          searchTerm={searchTerm}
          onSearchChange={onSearchChange}
          onAddToCart={onAddToCart}
          onQuantityNumpad={handleQuantityNumpad}
          onCustomPriceNumpad={handleCustomPriceNumpad}
        />
        <MobilePOSCart
          cart={cart}
          calculation={calculation}
          onRemoveFromCart={onRemoveFromCart || (() => {})}
          onClearCart={onClearCart || (() => {})}
          onCheckout={(paymentMethod) => {
            if (paymentMethod === 'cash' && calculation && calculation.total > 0) {
              handleCheckoutNumpad(calculation.subtotal, calculation.tax, calculation.total);
            } else {
              onCheckout?.();
            }
          }}
          expandedByDefault={false}
        />

        {/* Numpad Dialog */}
        <Dialog open={showNumpad} onOpenChange={setShowNumpad}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>{numpadContext?.title || 'Enter Value'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <MobileNumpad
                value={numpadValue}
                onNumberClick={(num) => {
                  if (num === '00' && numpadValue === '0') return;
                  setNumpadValue(prev => prev === '0' && num !== '.' ? num : prev + num);
                }}
                onBackspace={() => {
                  setNumpadValue(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
                }}
                onClear={() => setNumpadValue('')}
                onEnter={() => {
                  if (numpadValue && parseFloat(numpadValue) >= 0) {
                    numpadContext?.onSubmit(numpadValue);
                  }
                }}
                placeholder={numpadContext?.placeholder}
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowNumpad(false);
                    setNumpadValue('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => {
                    if (numpadValue && parseFloat(numpadValue) >= 0) {
                      numpadContext?.onSubmit(numpadValue);
                    }
                  }}
                >
                  OK
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return null;
}
