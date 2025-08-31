'use client';

import React, { useState } from 'react';
import { MobilePOSView } from './MobilePOSView';
import { MobilePOSCart } from './MobilePOSCart';

type POSView = 'pos';

// Cart item interface (matching the main POS interface)
interface CartItem {
  id: string;
  productId: string;
  product: any;
  variantId?: string;
  variant?: any;
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

interface Product {
  id: string;
  name: string;
  description?: string;
  brand?: string;
  category: string;
  basePrice: number;
  stock: number;
  unit: string;
  type: string;
  lowStockThreshold?: number;
  isActive?: boolean;
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

  if (currentView === 'pos') {
    return (
      <div className="relative">
        <MobilePOSView
          products={products}
          loading={loading}
          searchTerm={searchTerm}
          onSearchChange={onSearchChange}
          onAddToCart={onAddToCart}
        />
        <MobilePOSCart
          cart={cart}
          calculation={calculation}
          onRemoveFromCart={onRemoveFromCart || (() => {})}
          onClearCart={onClearCart || (() => {})}
          onCheckout={onCheckout}
          expandedByDefault={false}
        />
      </div>
    );
  }

  return null;
}
