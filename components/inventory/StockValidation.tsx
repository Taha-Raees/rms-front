'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Package, 
  Search,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { productsApi } from '@/lib/api';
import { Product } from '@/lib/types';

interface ValidationResult {
  productId: string;
  productName: string;
  currentStock: number;
  expectedStock: number;
  variance: number;
  isValid: boolean;
  message?: string;
}

export function StockValidation() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [expectedStock, setExpectedStock] = useState<number>(0);
  const [notes, setNotes] = useState('');

  const loadProducts = async () => {
    try {
      setLoading(true);
      const result = await productsApi.getAll();
      
      if (result.success && result.data) {
        setProducts(result.data.filter(p => p.isActive));
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const validateStock = async () => {
    if (!selectedProduct) {
      toast({
        title: "Error",
        description: "Please select a product",
        variant: "destructive",
      });
      return;
    }

    if (expectedStock < 0) {
      toast({
        title: "Error",
        description: "Expected stock cannot be negative",
        variant: "destructive",
      });
      return;
    }

    try {
      const variance = expectedStock - selectedProduct.stock;
      const isValid = Math.abs(variance) <= 0; // Exact match required
      
      const result: ValidationResult = {
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        currentStock: selectedProduct.stock,
        expectedStock,
        variance,
        isValid,
        message: isValid 
          ? 'Stock count matches expected value' 
          : `Variance of ${Math.abs(variance)} ${variance > 0 ? 'shortage' : 'excess'} detected`
      };

      setValidationResults([result, ...validationResults.slice(0, 9)]); // Keep last 10 results
      
      toast({
        title: isValid ? "Stock Valid" : "Stock Variance Detected",
        description: result.message,
        variant: isValid ? "default" : "destructive",
      });

      // Reset form
      setSelectedProduct(null);
      setExpectedStock(0);
      setNotes('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to validate stock",
        variant: "destructive",
      });
    }
  };

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.barcode?.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <Card className="rounded-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Stock Validation
          </CardTitle>
          <CardDescription>
            Validate physical stock counts against system records
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-2">
            <Button onClick={loadProducts} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Load Products
            </Button>
          </div>

          {products.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="search">Search Products</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="search"
                      placeholder="Search by name, category, or barcode..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label>Select Product</Label>
                  <div className="max-h-40 overflow-y-auto border rounded-md">
                    {filteredProducts.length === 0 ? (
                      <div className="p-4 text-center text-muted-foreground">
                        No products found
                      </div>
                    ) : (
                      <div className="divide-y">
                        {filteredProducts.map(product => (
                          <div
                            key={product.id}
                            className={`p-3 cursor-pointer hover:bg-muted/50 transition-colors ${
                              selectedProduct?.id === product.id ? 'bg-muted' : ''
                            }`}
                            onClick={() => setSelectedProduct(product)}
                          >
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-muted-foreground flex justify-between">
                              <span>Current: {product.stock} {product.unit}</span>
                              <span>Category: {product.category}</span>
                            </div>
                            {product.barcode && (
                              <div className="text-xs text-muted-foreground">
                                Barcode: {product.barcode}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {selectedProduct && (
                  <div className="space-y-4">
                    <div>
                      <Label>Selected Product</Label>
                      <div className="p-3 border rounded-md bg-muted">
                        <div className="font-medium">{selectedProduct.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Current Stock: {selectedProduct.stock} {selectedProduct.unit}
                        </div>
                        {selectedProduct.barcode && (
                          <div className="text-xs text-muted-foreground">
                            Barcode: {selectedProduct.barcode}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="expectedStock">Expected Stock Count *</Label>
                      <Input
                        id="expectedStock"
                        type="number"
                        min="0"
                        value={expectedStock}
                        onChange={(e) => setExpectedStock(parseInt(e.target.value) || 0)}
                        placeholder="Enter physical count"
                      />
                    </div>

                    <div>
                      <Label htmlFor="notes">Notes (Optional)</Label>
                      <Textarea
                        id="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add any notes about this validation..."
                      />
                    </div>

                    <Button onClick={validateStock} className="w-full">
                      Validate Stock
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {validationResults.length > 0 && (
        <Card className="rounded-sm">
          <CardHeader>
            <CardTitle>Recent Validations</CardTitle>
            <CardDescription>
              Last 10 stock validation results
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {validationResults.map((result, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {result.isValid ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    )}
                    <div>
                      <div className="font-medium">{result.productName}</div>
                      <div className="text-sm text-muted-foreground">
                        System: {result.currentStock} • Physical: {result.expectedStock}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant={result.isValid ? "default" : "destructive"}>
                      {result.variance > 0 ? '+' : ''}{result.variance}
                    </Badge>
                    {!result.isValid && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          // This would open a correction dialog in a real implementation
                          toast({
                            title: "Info",
                            description: "Stock correction functionality would be implemented here",
                          });
                        }}
                      >
                        Correct
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
