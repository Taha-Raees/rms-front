'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, Minus, Search, ShoppingCart, CreditCard, Banknote, Smartphone, Trash2, Scale, Package } from 'lucide-react';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Numpad } from '@/components/ui/numpad';
import { useToast } from '@/hooks/use-toast';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useDeviceAdaptive } from '@/hooks/use-device-adaptive';
import { MobilePOSManager } from '@/components/mobile/MobilePOSManager';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

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

interface CalculationResult {
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  taxRate: number;
}

// Interfaces matching the backend Prisma schema
interface Product {
  id: string;
  name: string;
  description: string;
  brand: string;
  category: string;
  basePrice: number;
  unit: string;
  type: 'prepackaged' | 'loose_weight';
  stock: number;
  lowStockThreshold: number;
  isActive: boolean;
  imageUrl?: string;
  variants?: ProductVariant[];
  createdAt: Date;
  updatedAt: Date;
}

interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  weight?: number;
  weightUnit?: string;
  sku: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export default function POSPage() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [numpadValue, setNumpadValue] = useState('');
  const [numpadMode, setNumpadMode] = useState<'quantity' | 'weight' | 'cash' | null>(null);
  const [selectedItemForInput, setSelectedItemForInput] = useState<string | null>(null);
  const [calculation, setCalculation] = useState<CalculationResult | null>(null);
  const [cashAmount, setCashAmount] = useState<number>(0);

  // WebSocket for customer display updates
  const { sendMessage } = useWebSocket();

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, searchTerm]);

  // Recalculate totals when cart changes
  useEffect(() => {
    if (cart.length > 0) {
      calculateTotals();
    } else {
      setCalculation(null);
      // Send empty cart to customer display
      console.log('POS: Sending pos_cart_cleared event.');
      sendMessage({
        type: 'pos_cart_cleared',
        data: null,
        timestamp: new Date()
      });
    }
  }, [cart]); // Removed calculation from dependency to avoid infinite loop with calculateTotals

  // Send cart updates to customer display when calculation is ready
  useEffect(() => {
    if (cart.length > 0 && calculation) {
      const customerDisplayData = {
        id: `order_${Date.now()}`,
        items: cart.map(item => ({
          id: item.id,
          productName: item.product.name,
          brand: item.product.brand,
          quantity: item.quantity,
          weight: item.weight,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          unit: item.product.unit,
          isLoose: item.product.type === 'loose_weight',
          displayText: item.displayText
        })),
        subtotal: calculation.subtotal,
        tax: calculation.tax,
        taxRate: calculation.taxRate,
        total: calculation.total,
        status: 'building',
        timestamp: new Date()
      };

      console.log('POS: Sending pos_cart_update event:', customerDisplayData);
      sendMessage({
        type: 'pos_cart_update',
        data: customerDisplayData,
        timestamp: new Date()
      });
    }
  }, [cart, calculation, sendMessage]); // Added sendMessage to dependencies

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`${API_BASE_URL}/products?${params}`);
      const result = await response.json();
      
      if (result.success) {
        setProducts(result.data.filter((p: Product) => p.isActive));
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/pos/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart })
      });
      
      const result = await response.json();
      if (result.success) {
        setCalculation(result.data);
      }
    } catch (error) {
      console.error('Failed to calculate totals:', error);
    }
  };

  // Get unique categories
  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))];

  // Add item to cart
  const addToCart = (product: Product, variant?: ProductVariant) => {
    const cartId = `${product.id}_${variant?.id || 'base'}`;
    const existingItem = cart.find(item => item.id === cartId);
    
    if (product.type === 'loose_weight') {
      // For loose weight, open numpad for weight input
      setSelectedItemForInput(cartId);
      setNumpadMode('weight');
      setNumpadValue('');
      
      if (!existingItem) {
        // Add placeholder item
        const newItem: CartItem = {
          id: cartId,
          productId: product.id,
          product,
          quantity: 0,
          weight: 0,
          unitPrice: variant?.price || product.basePrice,
          totalPrice: 0,
          displayText: '0kg'
        };
        setCart([...cart, newItem]);
      }
    } else {
      // For branded/unit products, add directly
      if (existingItem) {
        setCart(cart.map(item =>
          item.id === cartId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ));
      } else {
        const newItem: CartItem = {
          id: cartId,
          productId: product.id,
          product,
          variantId: variant?.id,
          variant,
          quantity: 1,
          unitPrice: variant?.price || product.basePrice,
          totalPrice: variant?.price || product.basePrice,
          displayText: `1 × ${variant?.name || product.unit}`
        };
        setCart([...cart, newItem]);
      }
    }
  };

  // Update cart item
  const updateCartItem = (itemId: string, updates: Partial<CartItem>) => {
    setCart(cart.map(item =>
      item.id === itemId ? { ...item, ...updates } : item
    ));
  };

  // Remove item from cart
  const removeFromCart = (itemId: string) => {
    setCart(cart.filter(item => item.id !== itemId));
  };

  // Numpad handlers
  const handleNumpadNumber = (number: string) => {
    setNumpadValue(prev => prev + number);
  };

  const handleNumpadBackspace = () => {
    setNumpadValue(prev => prev.slice(0, -1));
  };

  const handleNumpadClear = () => {
    setNumpadValue('');
  };

  const handleNumpadEnter = () => {
    const value = parseFloat(numpadValue) || 0;
    
    if (numpadMode === 'weight' && selectedItemForInput) {
      updateCartItem(selectedItemForInput, { 
        weight: value,
        quantity: value, // Quantity is also the weight for loose items
        displayText: `${value}kg`
      });
    } else if (numpadMode === 'quantity' && selectedItemForInput) {
      updateCartItem(selectedItemForInput, { 
        quantity: value,
        displayText: `${value} units`
      });
    } else if (numpadMode === 'cash') {
      setCashAmount(value);
    }
    
    setNumpadValue('');
    setNumpadMode(null);
    setSelectedItemForInput(null);
  };

  // Handle checkout
  const handleCheckout = async (paymentMethod: string) => {
    if (!calculation || cart.length === 0) return;

    console.log('POS: Sending pos_payment_started event.');
    sendMessage({
      type: 'pos_payment_started',
      data: { paymentMethod },
      timestamp: new Date()
    });

    if (paymentMethod === 'cash') {
      setNumpadMode('cash');
      setNumpadValue('');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/pos/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart,
          paymentMethod,
          cashAmount: paymentMethod === 'cash' ? cashAmount : calculation.total,
          subtotal: calculation?.subtotal,
          tax: calculation?.tax,
          total: calculation?.total,
          taxRate: calculation?.taxRate
        })
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('POS: Sending pos_order_completed event.');
        // Send completion event to customer display
        sendMessage({
          type: 'pos_order_completed',
          data: result.data.order,
          timestamp: new Date()
        });

        toast({
          title: "Order Completed",
          description: `Order ${result.data.order.orderNumber} processed successfully!`,
          variant: "default",
        });
        
        if (paymentMethod === 'cash' && result.data.change > 0) {
          toast({
            title: "Change Due",
            description: `Change: PKR ${result.data.change.toFixed(2)}`,
            variant: "default",
          });
        }
        
        // Clear cart
        setCart([]);
        setCashAmount(0);
      } else {
        toast({
          title: "Checkout Failed",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process checkout",
        variant: "destructive",
      });
    }
  };

  const processCashPayment = () => {
    if (calculation && cashAmount >= calculation.total) {
      handleCheckout('cash');
    } else {
      toast({
        title: "Insufficient Cash",
        description: "Please enter sufficient cash amount",
        variant: "destructive",
      });
    }
  };

  const { shouldUseMobileView } = useDeviceAdaptive();

  // Mobile view
  if (shouldUseMobileView) {
    return (
      <MobilePOSManager
        products={products}
        loading={loading}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onAddToCart={addToCart}
        cart={cart}
        calculation={calculation}
        onRemoveFromCart={removeFromCart}
        onClearCart={() => setCart([])}
        onCheckout={handleCheckout}
      />
    );
  }

  // Desktop view
  return (
    <div className="space-y-6">
      <Breadcrumbs />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Selection */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search and Filters */}
          <Card className="rounded-sm"> {/* Added rounded-sm */}
            <CardHeader>
              <CardTitle>Products</CardTitle>
              <CardDescription>Select items to add to cart</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Category Filter */}
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category === 'all' ? 'All Categories' : category}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Product Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse rounded-sm"> {/* Added rounded-sm */}
                  <CardContent className="p-4">
                    <div className="h-20 bg-muted rounded"></div>
                  </CardContent>
                </Card>
              ))
            ) : (
              products.map(product => (
                <Card key={product.id} className="hover:shadow-md transition-shadow rounded-sm"> {/* Added rounded-sm */}
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{product.name}</h3>
                          <p className="text-sm text-muted-foreground">{product.brand}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {product.type === 'loose_weight' ? (
                              <Badge variant="outline" className="text-xs">
                                <Scale className="h-3 w-3 mr-1" />
                                Per {product.unit}
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs">
                                <Package className="h-3 w-3 mr-1" />
                                Packaged
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Badge variant={product.stock > product.lowStockThreshold ? 'success' : 'warning'}>
                          {product.stock} {product.unit}
                        </Badge>
                      </div>

                      {/* Product variants or base price */}
                      {product.variants && product.variants.length > 0 ? (
                        <div className="space-y-2">
                          {product.variants.map(variant => (
                            <div key={variant.id} className="flex items-center justify-between p-2 border rounded">
                              <div>
                                <span className="text-sm font-medium">{variant.name}</span>
                                <div className="text-xs text-muted-foreground">
                                  PKR {variant.price}
                                  {variant.weight && ` • ${variant.weight}${variant.weightUnit}`}
                                </div>
                              </div>
                              <Button
                                size="sm"
                                onClick={() => addToCart(product, variant)}
                                disabled={variant.stock === 0}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold">
                            PKR {product.basePrice}
                            {product.type === 'loose_weight' && `/${product.unit}`}
                          </span>
                          <Button
                            size="sm"
                            onClick={() => addToCart(product)}
                            disabled={product.stock === 0}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Cart and Checkout */}
        <div className="space-y-4">
          <Card className="rounded-sm"> {/* Added rounded-sm */}
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Cart ({cart.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cart.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Cart is empty
                </p>
              ) : (
                <>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {cart.map(item => (
                      <div key={item.id} className="flex items-center justify-between p-2 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.product.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.displayText} • PKR {item.unitPrice}
                            {item.product.type === 'loose_weight' ? `/${item.product.unit}` : ' each'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedItemForInput(item.id);
                              setNumpadMode(item.product.type === 'loose_weight' ? 'weight' : 'quantity');
                              setNumpadValue((item.weight || item.quantity).toString());
                            }}
                          >
                            {item.product.type === 'loose_weight' 
                              ? `${item.weight || 0}kg` 
                              : item.quantity
                            }
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {calculation && (
                    <>
                      <Separator />
                      {/* Order Summary */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Subtotal:</span>
                          <span>PKR {calculation.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Tax ({(calculation.taxRate * 100).toFixed(1)}%):</span>
                          <span>PKR {calculation.tax.toFixed(2)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-bold text-lg">
                          <span>Total:</span>
                          <span>PKR {calculation.total.toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Payment Methods */}
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Payment Method:</p>
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCheckout('cash')}
                            className="flex items-center gap-2"
                          >
                            <Banknote className="h-4 w-4" />
                            Cash
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCheckout('card')}
                            className="flex items-center gap-2"
                          >
                            <CreditCard className="h-4 w-4" />
                            Card
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCheckout('jazzcash')}
                            className="flex items-center gap-2"
                          >
                            <Smartphone className="h-4 w-4" />
                            JazzCash
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCheckout('easypaisa')}
                            className="flex items-center gap-2"
                          >
                            <Smartphone className="h-4 w-4" />
                            EasyPaisa
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Numpad */}
          {numpadMode && (
            <Card className="rounded-sm"> {/* Added rounded-sm */}
              <CardHeader>
                <CardTitle className="text-lg">
                  {numpadMode === 'weight' && 'Enter Weight (kg)'}
                  {numpadMode === 'quantity' && 'Enter Quantity'}
                  {numpadMode === 'cash' && 'Enter Cash Amount'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-mono font-bold">
                      {numpadMode === 'cash' ? 'PKR ' : ''}{numpadValue || '0'}
                      {numpadMode === 'weight' ? ' kg' : ''}
                    </div>
                    {numpadMode === 'cash' && calculation && (
                      <div className="text-sm text-muted-foreground mt-2">
                        Total: PKR {calculation.total.toFixed(2)}
                        {parseFloat(numpadValue) > calculation.total && (
                          <div className="text-green-600">
                            Change: PKR {(parseFloat(numpadValue) - calculation.total).toFixed(2)}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <Numpad
                    onNumberClick={handleNumpadNumber}
                    onBackspace={handleNumpadBackspace}
                    onClear={handleNumpadClear}
                    onEnter={numpadMode === 'cash' ? processCashPayment : handleNumpadEnter}
                    showEnter={true}
                    showDecimal={true}
                  />
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      setNumpadMode(null);
                      setSelectedItemForInput(null);
                      setNumpadValue('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
