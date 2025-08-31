'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Package, Scale } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  category: string;
  basePrice: number;
  stock: number;
  unit: string;
  type: 'prepackaged' | 'loose_weight';
}

interface MobilePOSViewProps {
  products?: Product[];
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
  onAddToCart?: (product: Product, variant?: any) => void;
  loading?: boolean;
}

export function MobilePOSView({
  products = [],
  searchTerm = '',
  onSearchChange,
  onAddToCart,
  loading = false
}: MobilePOSViewProps) {
  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))];

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
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No products found</p>
          </div>
        ) : (
          products.map((product) => (
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

                <div className="ml-4 flex items-center gap-3">
                  <div className="text-right">
                    <div className="font-bold">
                      PKR {product.basePrice}
                      {product.type === 'loose_weight' && `/${product.unit}`}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => onAddToCart?.(product)}
                    disabled={product.stock === 0}
                    className="h-10 w-10 p-0"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
