'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Package,
  AlertTriangle,
  Search,
  Plus,
  Edit,
  Trash2,
  Scale,
  Box,
  ArrowLeft,
  Eye
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { productsApi, inventoryApi } from '@/lib/api';
import { Product } from '@/lib/types';

type InventoryView = 'list' | 'create' | 'edit' | 'detail';

interface MobileInventoryManagerProps {
  initialView?: InventoryView;
  selectedProductId?: string;
  onProductSelect?: (productId: string) => void;
}

export function MobileInventoryManager({
  initialView = 'list',
  selectedProductId,
  onProductSelect
}: MobileInventoryManagerProps) {
  const { toast } = useToast();
  const [currentView, setCurrentView] = useState<InventoryView>(initialView);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch products on load
  useEffect(() => {
    if (currentView === 'list') {
      fetchProducts();
    }
  }, [currentView]);

  // Handle selected product for edit/view
  useEffect(() => {
    if (selectedProductId && currentView === 'edit') {
      const product = products.find(p => p.id === selectedProductId);
      if (product) {
        setSelectedProduct(product);
      }
    }
  }, [selectedProductId, products]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const result = await productsApi.getAll();
      if (result.success && result.data) {
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

  const switchView = (view: InventoryView, productId?: string) => {
    if (productId && view === 'edit') {
      const product = products.find(p => p.id === productId);
      setSelectedProduct(product || null);
    } else if (view === 'create') {
      setSelectedProduct(null);
    }

    setCurrentView(view);

    if (onProductSelect && productId) {
      onProductSelect(productId);
    }
  };

  // Filter products by search term
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate stats
  const lowStockItems = products.filter(p => p.stock <= p.lowStockThreshold && p.stock > 0).length;
  const outOfStockItems = products.filter(p => p.stock === 0).length;

  if (currentView === 'list') {
    return (
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="text-center py-4">
          <h1 className="text-2xl font-bold">Inventory Management</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Manage your products and stock levels
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Package className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold">{products.length}</div>
              <div className="text-xs text-muted-foreground">Total Products</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-orange-500" />
              <div className="text-2xl font-bold">{lowStockItems}</div>
              <div className="text-xs text-muted-foreground">Low Stock</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Add */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={() => switchView('create')} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add
          </Button>
        </div>

        {/* Product List */}
        <div className="space-y-3">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-3 bg-muted rounded w-3/4"></div>
                </CardContent>
              </Card>
            ))
          ) : filteredProducts.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground mb-4">
                  {products.length === 0 ? 'No products yet' : 'No products match your search'}
                </p>
                <Button onClick={() => switchView('create')} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Product
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredProducts.map((product) => (
              <Card key={product.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      {product.type === 'loose_weight' ? (
                        <Scale className="h-5 w-5 text-blue-500" />
                      ) : (
                        <Box className="h-5 w-5 text-green-500" />
                      )}
                      <div>
                        <h3 className="font-semibold leading-tight">{product.name}</h3>
                        <p className="text-sm text-muted-foreground">{product.brand}</p>
                      </div>
                    </div>
                    <Badge variant={product.stock === 0 ? 'destructive' : product.stock <= product.lowStockThreshold ? 'secondary' : 'default'}>
                      {product.stock === 0 ? 'Out' : `${product.stock} ${product.unit}`}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>PKR {product.basePrice}/{product.unit}</span>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => switchView('detail', product.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => switchView('edit', product.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteProduct(product.id)}
                        className="h-8 w-8 p-0 text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    );
  }

  if (currentView === 'create') {
    return (
      <MobileProductForm
        mode="create"
        onSuccess={() => {
          switchView('list');
          fetchProducts();
        }}
        onCancel={() => switchView('list')}
      />
    );
  }

  if (currentView === 'edit' && selectedProduct) {
    return (
      <MobileProductForm
        mode="edit"
        product={selectedProduct}
        onSuccess={() => {
          switchView('list');
          fetchProducts();
        }}
        onCancel={() => switchView('list')}
      />
    );
  }

  if (currentView === 'detail' && selectedProduct) {
    return (
      <MobileProductDetail
        product={selectedProduct}
        onEdit={() => switchView('edit', selectedProduct.id)}
        onBack={() => switchView('list')}
        onDelete={() => handleDeleteProduct(selectedProduct.id)}
      />
    );
  }

  return null;

  // Helper function for delete
  function handleDeleteProduct(productId: string) {
    // This would normally call the API to delete the product
    // For now, just show a confirmation and update the UI
    if (confirm('Are you sure you want to delete this product?')) {
      setProducts(products.filter(p => p.id !== productId));
      toast({
        title: "Success",
        description: "Product deleted successfully",
        variant: "default",
      });
    }
  }
}



// Mobile Product Form Component
interface ProductFormData {
  name: string;
  brand: string;
  category: string;
  type: 'branded_packet' | 'loose_weight' | 'unit_based';
  basePrice: string;
  stock: string;
  unit: string;
  lowStockThreshold: string;
}

function MobileProductForm({
  mode,
  product,
  onSuccess,
  onCancel
}: {
  mode: 'create' | 'edit';
  product?: Product;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>({
    name: product?.name || '',
    brand: product?.brand || '',
    category: product?.category || '',
    type: (product?.type === 'prepackaged' ? 'branded_packet' : product?.type) || 'branded_packet',
    basePrice: product?.basePrice?.toString() || '',
    stock: product?.stock?.toString() || '',
    unit: product?.unit || '',
    lowStockThreshold: product?.lowStockThreshold?.toString() || '10',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        ...formData,
        basePrice: parseFloat(formData.basePrice) || 0,
        stock: parseInt(formData.stock) || 0,
        lowStockThreshold: parseInt(formData.lowStockThreshold) || 10,
        description: '', // Add required description field
        isActive: true,  // Add active status
      };

      let result;
      if (mode === 'create') {
        result = await productsApi.create(data as any);
      } else {
        result = await productsApi.update(product!.id, data as any);
      }

      if (result.success) {
        toast({
          title: "Success",
          description: `Product ${mode === 'create' ? 'created' : 'updated'} successfully`,
          variant: "default",
        });
        onSuccess();
      } else {
        throw new Error(result.error || 'Operation failed');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${mode} product`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onCancel} size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-xl font-bold">
          {mode === 'create' ? 'Add Product' : 'Edit Product'}
        </h1>
        <div className="w-16"></div> {/* Spacer for centering title */}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card>
          <CardContent className="p-4 space-y-4">
            <div>
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="brand">Brand</Label>
              <Input
                id="brand"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="category">Category *</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="type">Product Type *</Label>
              <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="branded_packet">Branded Package</SelectItem>
                  <SelectItem value="loose_weight">Loose Weight</SelectItem>
                  <SelectItem value="unit_based">Unit Based</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="basePrice">Price (PKR) *</Label>
                <Input
                  id="basePrice"
                  type="number"
                  step="0.01"
                  value={formData.basePrice}
                  onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="stock">Stock *</Label>
                <Input
                  id="stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="unit">Unit (kg, pcs, etc.) *</Label>
                <Input
                  id="unit"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="lowStockThreshold">Low Stock Alert</Label>
                <Input
                  id="lowStockThreshold"
                  type="number"
                  value={formData.lowStockThreshold}
                  onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? 'Saving...' : mode === 'create' ? 'Create' : 'Update'}
          </Button>
        </div>
      </form>
    </div>
  );
}

// Mobile Product Detail Component
function MobileProductDetail({
  product,
  onEdit,
  onBack,
  onDelete
}: {
  product: Product;
  onEdit: () => void;
  onBack: () => void;
  onDelete: () => void;
}) {
  const { toast } = useToast();

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this product?')) {
      onDelete();
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-xl font-bold">Product Details</h1>
        <div className="w-16"></div> {/* Spacer */}
      </div>

      <Card>
        <CardContent className="p-4 space-y-4">
          {/* Product Info */}
          <div className="text-center">
            <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-3 flex items-center justify-center">
              {product.type === 'loose_weight' ? (
                <Scale className="h-8 w-8 text-blue-500" />
              ) : (
                <Box className="h-8 w-8 text-green-500" />
              )}
            </div>
            <h2 className="text-lg font-bold">{product.name}</h2>
            <p className="text-muted-foreground">{product.brand}</p>
          </div>

          {/* Product Details */}
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <span className="font-medium">Category:</span>
              <span>{product.category}</span>
            </div>

            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <span className="font-medium">Type:</span>
              <span className="capitalize">{product.type.replace('_', ' ')}</span>
            </div>

            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <span className="font-medium">Price:</span>
              <span>PKR {product.basePrice}/{product.unit}</span>
            </div>

            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <span className="font-medium">Current Stock:</span>
              <div className="text-right">
                <div className="font-semibold">{product.stock} {product.unit}</div>
                {product.stock <= product.lowStockThreshold && product.stock > 0 && (
                  <Badge variant="secondary">Low Stock</Badge>
                )}
                {product.stock === 0 && (
                  <Badge variant="destructive">Out of Stock</Badge>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <span className="font-medium">Low Stock Alert:</span>
              <span>{product.lowStockThreshold} {product.unit}</span>
            </div>

            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <span className="font-medium">Status:</span>
              <Badge variant={product.isActive ? 'default' : 'secondary'}>
                {product.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <Button variant="outline" onClick={onBack} className="flex-1">
              Back to List
            </Button>
            <Button onClick={onEdit} className="flex-1">
              Edit Product
            </Button>
          </div>

          <Button
            variant="destructive"
            onClick={handleDelete}
            className="w-full mt-3"
          >
            Delete Product
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
