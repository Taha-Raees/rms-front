'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, Minus, Search, ShoppingCart, CreditCard, Banknote, Smartphone, Trash2, Scale, Package } from 'lucide-react';

import { Numpad } from '@/components/ui/numpad';
import { useToast } from '@/hooks/use-toast';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useDeviceAdaptive } from '@/hooks/use-device-adaptive';
import { MobilePOSManager } from '@/components/mobile/MobilePOSManager';
import { productsApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
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
  discountRate?: number;
}

interface CalculationResult {
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  taxRate: number;
}

import { Product, ProductVariant } from '@/lib/types';

// Use shared interfaces from types.ts to ensure consistency

export default function POSPage() {
  const { toast } = useToast();
  const { state: authState } = useAuth();
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
  const [lastOrder, setLastOrder] = useState<any>(null);
  const [showReceipt, setShowReceipt] = useState<boolean>(false);

  // Debug authentication state
  console.log('POS - Auth State:', {
    isLoading: authState.isLoading,
    userId: authState.user?.id,
    storeId: authState.user?.storeId,
    storeName: authState.store?.name
  });

  // Demo fallback for testing
  const demoStoreId = 'demo-store-001';

  // WebSocket for customer display updates - now with storeId
  const { sendMessage, isConnected, error } = useWebSocket({
    storeId: authState.user?.storeId || demoStoreId,
    onOpen: () => {
      console.log('POS - WebSocket connected successfully!');
    },
    onError: (err) => {
      console.error('POS - WebSocket error:', err);
    }
  });

  // Debug WebSocket status
  console.log('POS - WebSocket Status:', { isConnected, error, demoStoreId: demoStoreId });

  // Check if we have store access and redirect if not
  useEffect(() => {
    if (!authState.isLoading && !authState.user?.storeId) {
      toast({
        title: "Access Denied",
        description: "You don't have access to any store.",
        variant: "destructive",
      });
    }
  }, [authState.isLoading, authState.user, toast]);

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, searchTerm]);

  // Recalculate totals when cart changes - with debouncing to prevent race conditions
  useEffect(() => {
    if (cart.length > 0) {
      const debounceTimer = setTimeout(() => {
        calculateTotals();
      }, 150); // 150ms debounce
      return () => clearTimeout(debounceTimer);
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
  }, [cart]); // Added calculateTotals dependency since it's stable now

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
      // For now, fetch all products - in a real implementation,
      // you'd want filtering capabilities from the API
      const result = await productsApi.getAll();

      if (result.success && result.data) {
        let filteredProducts = result.data;

        // Basic client-side filtering since API might not support all filters yet
        if (selectedCategory !== 'all') {
          filteredProducts = filteredProducts.filter(p => p.category === selectedCategory);
        }

        if (searchTerm) {
          const search = searchTerm.toLowerCase();
          filteredProducts = filteredProducts.filter(p =>
            p.name.toLowerCase().includes(search) ||
            (p.brand && p.brand.toLowerCase().includes(search)) ||
            p.category.toLowerCase().includes(search)
          );
        }

        setProducts(filteredProducts);
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to fetch products",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("POS: Failed to fetch products:", error);
      toast({
        title: "Error",
        description: "Failed to fetch products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Frontend calculation logic - more efficient and doesn't require API calls
  const calculateTotals = () => {
    try {
      if (cart.length === 0) {
        setCalculation(null);
        return;
      }

      let subtotal = 0;
      let totalDiscount = 0;
      let taxableAmount = 0;
      let taxAmount = 0;
      let totalAmount = 0;

      // Fetch tax rate from store database instead of hardcoding
      const taxRate = 0.00; // Temporarily set to 0 to match database until we add API endpoint

      const processedItems = cart.map(item => {
        // Apply individual item discounts
        const itemDiscount = (item.discountRate || 0) / 100;
        const discountedPrice = item.unitPrice * (1 - itemDiscount);
        const itemTotal = discountedPrice * (item.weight || item.quantity);

        subtotal += item.unitPrice * (item.weight || item.quantity);
        totalDiscount += item.unitPrice * (item.weight || item.quantity) * itemDiscount;

        return {
          ...item,
          totalPrice: itemTotal
        };
      });

      taxableAmount = subtotal - totalDiscount;
      taxAmount = taxableAmount * taxRate;
      totalAmount = taxableAmount + taxAmount;

      setCalculation({
        items: processedItems,
        subtotal,
        tax: taxAmount,
        total: totalAmount,
        taxRate
      });

    } catch (error) {
      console.error('Failed to calculate totals:', error);
      toast({
        title: "Calculation Error",
        description: "Failed to calculate cart totals",
        variant: "destructive",
      });
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

  const handleNumpadEnter = useCallback(() => {
    const value = parseFloat(numpadValue) || 0;

    console.log('Processing numpad enter:', {
      numpadValue,
      value,
      numpadMode,
      calculationTotal: calculation?.total
    });

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
      // Valid amount check
      if (!value || value < 0) {
        toast({
          title: "Invalid Amount",
          description: "Please enter a valid cash amount",
          variant: "destructive",
        });
        return;
      }

      // Set cash amount first
      setCashAmount(value);

      // Check if sufficient
      if (calculation && value >= calculation.total) {
        console.log('Processing cash payment:', value);
        // Process immediately without closing modal first
        processPayment('cash', value);
        // Close modal after processing
        setNumpadValue('');
        setNumpadMode(null);
        setSelectedItemForInput(null);
      } else {
        toast({
          title: "Insufficient Cash",
          description: `Entered: PKR ${value}, Required: PKR ${calculation?.total || 0}`,
          variant: "destructive",
        });
        return; // Don't close modal for insufficient cash
      }
      return; // Don't reset states yet, only if payment is successful
    }

    // Reset modal states for non-cash modes
    setNumpadValue('');
    setNumpadMode(null);
    setSelectedItemForInput(null);
  }, [numpadValue, numpadMode, selectedItemForInput, calculation, toast]);

  // Handle payment method selection (separate from actual payment processing)
  const handlePaymentMethodSelection = useCallback((paymentMethod: string) => {
    if (!calculation || cart.length === 0) return;

    console.log('POS: Sending pos_payment_started event.');
    sendMessage({
      type: 'pos_payment_started',
      data: { paymentMethod },
      timestamp: new Date()
    });

    if (paymentMethod === 'cash') {
      // For cash, open numpad to enter payment amount
      setNumpadMode('cash');
      setNumpadValue('');
      setCashAmount(0);
    } else {
      // For non-cash payments, process immediately
      processPayment(paymentMethod, calculation.total);
    }
  }, [calculation, cart, sendMessage]);

  // Actual payment processing function
  const processPayment = useCallback(async (paymentMethod: string, amountPaid: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/pos/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify({
          items: cart,
          paymentMethod,
          amountPaid,
          taxRate: calculation?.taxRate || 0, // Send the tax rate to match frontend/backend
        })
      });

      const result = await response.json();

      if (result.success) {
        console.log('POS: Checkout successful!', result);
        console.log('POS: Sending pos_order_completed event.');

        // Send completion event to customer display
        sendMessage({
          type: 'pos_order_completed',
          data: result.data,
          timestamp: new Date()
        });

        // Calculate change properly since backend doesn't return change
        const orderTotal = calculation?.total || 0;
        const changeAmount = Math.max(0, amountPaid - orderTotal);

        // Save order data for receipt
        setLastOrder({
          order: result.data,
          paymentMethod,
          paidAmount: amountPaid,
          changeAmount: changeAmount,
          processedAt: new Date(),
          items: cart
        });

        // Show receipt
        setShowReceipt(true);

        toast({
          title: "Order Completed",
          description: `Order ${result.data.orderNumber} processed successfully!`,
          variant: "default",
        });

        if (paymentMethod === 'cash' && changeAmount > 0) {
          toast({
            title: "Change Due",
            description: `Change: PKR ${changeAmount.toFixed(2)}`,
            variant: "default",
          });
        }

        // Clear cart and reset states
        setCart([]);
        setCashAmount(0);
        setNumpadValue('');
        setNumpadMode(null);
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
  }, [cart, sendMessage, toast]);



  const { shouldUseMobileView } = useDeviceAdaptive();

  // Mobile view
  if (shouldUseMobileView) {
    const handleMobileCheckout = (paymentMethod: string = 'cash') => {
      // Default to cash payment for mobile view, but allow other methods
      handlePaymentMethodSelection(paymentMethod);
    };

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
        onCheckout={handleMobileCheckout}
      />
    );
  }

  // Desktop view
  return (
    <div className="space-y-6">
      {/* WebSocket Connection Status */}
      <div className={`fixed top-4 right-4 p-2 rounded-lg text-sm font-medium ${
        isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        {isConnected ? '🟢 Connected to Customer Display' : '🔴 Customer Display Disconnected'}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Selection */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search and Filters */}
          <Card className="rounded-sm"> {/* Added rounded-sm */}
            <CardContent className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold mb-1 md:mb-0">Products</h3>
                </div>
                <div className="relative flex-1 min-w-0">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse rounded-sm"> {/* Added rounded-sm */}
                  <CardContent className="p-4">
                    <div className="h-20 bg-muted rounded"></div>
                  </CardContent>
                </Card>
              ))
            ) : (
              products.map(product => {
                const hasActiveVariants = product.variants?.filter(v => !v.deletedAt).length > 0;
                const isOutOfStock = product.stock === 0 && !hasActiveVariants;

                return (
                  <Card
                    key={product.id}
                    className={`hover:shadow-md transition-shadow rounded-sm relative ${
                      !hasActiveVariants ? 'cursor-pointer' : ''
                    } ${
                      isOutOfStock ? 'cursor-not-allowed opacity-50 blur-[0.8px]' : ''
                    }`}
                    onClick={!hasActiveVariants ? () => addToCart(product) : undefined}
                  >
                    {isOutOfStock && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/70 rounded-sm z-10">
                        <span className="font-semibold text-gray-600 text-sm">Out of Stock</span>
                      </div>
                    )}
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold">{product.name}</h3>
                            <p className="text-sm text-muted-foreground">{product.brand}</p>
                          </div>
                        </div>

                        {/* Product variants or base price */}
                        {hasActiveVariants ? (
                          (() => {
                            const variants = product.variants?.filter(v => !v.deletedAt) || [];
                            const gridColsClass = variants.length === 1 ? "grid-cols-1" :
                                                 variants.length === 2 ? "grid-cols-2" :
                                                 "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";
                            return (
                              <div className={`grid ${gridColsClass} gap-2`}>
                                {variants.map(variant => (
                                  <Card
                                    key={variant.id}
                                    className={`p-3 hover:shadow-sm rounded-sm cursor-pointer transition-all relative ${
                                      variant.stock === 0
                                        ? 'cursor-not-allowed opacity-50 blur-[0.8px] hover:shadow-sm'
                                        : 'hover:shadow-md'
                                    }`}
                                    onClick={() => addToCart(product, variant)}
                                  >
                                    {variant.stock === 0 && (
                                      <div className="absolute inset-0 flex items-center justify-center bg-white/70 rounded-sm z-10">
                                        <span className="font-semibold text-gray-600 text-sm">Out of Stock</span>
                                      </div>
                                    )}
                                    <div className="flex items-center justify-between">
                                      <div className="flex-1">
                                        <h4 className="font-medium text-sm">{variant.name}</h4>
                                      <div className="text-xs text-muted-foreground mt-1">
                                        <div className="price-text">PKR {variant.price}</div>
                                        {variant.weight && (
                                          <div className="text-xs">{variant.weight} {variant.weightUnit}</div>
                                        )}
                                      </div>
                                      </div>
                                    </div>
                                  </Card>
                                ))}
                              </div>
                            );
                          })()
                        ) : (
                          <div className="flex items-center gap-2 mt-2">
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
                            <span className="text-m font-bold price-text">
                              PKR {product.basePrice}
                              {product.type === 'loose_weight' && `/${product.unit}`}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
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
                            {item.displayText} • <span className="price-text">PKR {item.unitPrice}</span>
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
                          <span className="price-text">{calculation.subtotal.toFixed(2)} PKR</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Tax ({(calculation.taxRate * 100).toFixed(1)}%):</span>
                          <span className="price-text">{calculation.tax.toFixed(2)} PKR</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-bold text-lg">
                          <span>Total:</span>
                          <span className="price-text">{calculation.total.toFixed(2)} PKR</span>
                        </div>
                      </div>

                      {/* Payment Methods */}
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Payment Method:</p>
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePaymentMethodSelection('cash')}
                            className="flex items-center gap-2"
                          >
                            <Banknote className="h-4 w-4" />
                            Cash
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePaymentMethodSelection('card')}
                            className="flex items-center gap-2"
                          >
                            <CreditCard className="h-4 w-4" />
                            Card
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePaymentMethodSelection('jazzcash')}
                            className="flex items-center gap-2"
                          >
                            <Smartphone className="h-4 w-4" />
                            JazzCash
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePaymentMethodSelection('easypaisa')}
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
                        Total: <span className="price-text">{calculation.total.toFixed(2)} PKR</span>
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
                    onEnter={handleNumpadEnter}
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
