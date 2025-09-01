'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Package, Scale, ChevronDown, ChevronUp, Edit3 } from 'lucide-react';

interface ProductVariant {
  id: string;
  name: string;
  weight?: number;
  weightUnit?: string;
  price: number;
  cost: number;
  stock: number;
  sku: string;
  isActive: boolean;
}

interface Product {
  id: string;
  name: string;
  category: string;
  type: 'branded_packet' | 'loose_weight' | 'unit_based';
  baseCost: number;
  basePrice: number;
  stock: number;
  unit: string;
  barcode?: string;
  variants?: ProductVariant[];
  isActive: boolean;
}

interface MobilePOSViewProps {
  products?: Product[];
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
  onAddToCart?: (product: Product, variant?: any) => void;
  onQuantityNumpad?: (product: Product, isWeight: boolean) => void;
  onCustomPriceNumpad?: (product: Product) => void;
  loading?: boolean;
}

export function MobilePOSView({
  products = [],
  searchTerm = '',
  onSearchChange,
  onAddToCart,
  onQuantityNumpad,
  onCustomPriceNumpad,
  loading = false
}: MobilePOSViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch = searchTerm === '' ||
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-4 p-4 pb-24"> {/* pb-24 to account for bottom cart */}
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => onSearchChange?.(e.target.value)}
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
            {category === 'all' ? 'All' : category}
          </Button>
        ))}
      </div>

      {/* Product Grid - Mobile optimized */}
      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
                <div className="h-8 w-20 bg-muted rounded"></div>
              </div>
            </Card>
          ))
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No products found</p>
          </div>
        ) : (
          filteredProducts.map((product) => (
            <Card key={product.id} className="p-4 hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{product.name}</h3>
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
                    <Badge
                      variant={product.stock > 0 ? 'secondary' : 'destructive'}
                      className="text-xs"
                    >
                      {product.stock} {product.unit}
                    </Badge>
                  </div>
                </div>

                <div className="ml-4 flex flex-col items-end gap-2">
                  <div className="text-right">
                    <div className="font-bold">
                      PKR {product.basePrice}
                      {product.type === 'loose_weight' && `/${product.unit}`}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-1">
                    {product.type === 'loose_weight' ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onQuantityNumpad?.(product, true)}
                        disabled={product.stock === 0}
                        className="h-8 px-2 text-xs"
                        title="Enter Weight"
                      >
                        <Scale className="h-3 w-3 mr-1" />
                        WT
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onQuantityNumpad?.(product, false)}
                        disabled={product.stock === 0}
                        className="h-8 px-2 text-xs"
                        title="Enter Quantity"
                      >
                        <Edit3 className="h-3 w-3 mr-1" />
                        QTY
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onCustomPriceNumpad?.(product)}
                      disabled={product.stock === 0}
                      className="h-8 px-2 text-xs"
                      title="Custom Price"
                    >
                      <Edit3 className="h-3 w-3" />
                    </Button>

                    <Button
                      size="sm"
                      onClick={() => onAddToCart?.(product)}
                      disabled={product.stock === 0}
                      className="h-8 w-8 p-0"
                      title="Quick Add"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
