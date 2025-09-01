'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Plus, Search, Package, AlertTriangle, Edit, Trash2, Scale, Box } from 'lucide-react';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Product, ProductVariant } from '@/lib/types';
import { DataTable } from '@/components/ui/data-table';
import { MetricCard } from '@/components/ui/metric-card';
import { useToast } from '@/hooks/use-toast';
import { productsApi } from '@/lib/api';

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

// Interfaces for form data
interface ProductFormData {
  name: string;
  brand?: string;
  category: string;
  type: 'branded_packet' | 'loose_weight' | 'unit_based';
  baseCost: number;
  basePrice: number;
  stock: number;
  unit: string;
  lowStockThreshold: number;
  barcode?: string;
  variants?: ProductVariant[];
  isActive: boolean;
}

export default function InventoryPage() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'low-stock' | 'out-of-stock'>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    brand: '',
    category: '',
    type: 'branded_packet',
    baseCost: 0,
    basePrice: 0,
    stock: 0,
    unit: '',
    lowStockThreshold: 10,
    barcode: '',
    variants: [],
    isActive: true
  });

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const result = await productsApi.getAll();
      
      if (result.success && result.data) {
        setProducts(result.data.filter((p) => p.isActive));
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

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesFilter = true;
    if (filterStatus === 'low-stock') {
      matchesFilter = product.stock <= product.lowStockThreshold && product.stock > 0;
    } else if (filterStatus === 'out-of-stock') {
      matchesFilter = product.stock === 0;
    }
    
    return matchesSearch && matchesFilter;
  });

  // Calculate inventory stats
  const totalProducts = products.length;
  const lowStockItems = products.filter(p => p.stock <= p.lowStockThreshold && p.stock > 0);
  const outOfStockItems = products.filter(p => p.stock === 0);
  const totalValue = products.reduce((sum, p) => sum + (p.basePrice * p.stock), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingProduct) {
        // Update existing product
        const result = await productsApi.update(editingProduct.id, formData);
        if (result.success) {
          toast({
            title: "Success",
            description: "Product updated successfully",
            variant: "default",
          });
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to update product",
            variant: "destructive",
          });
        }
      } else {
        // Create new product
        const result = await productsApi.create(formData);
        if (result.success) {
          toast({
            title: "Success",
            description: "Product created successfully",
            variant: "default",
          });
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to create product",
            variant: "destructive",
          });
        }
      }
      
      setShowAddDialog(false);
      setEditingProduct(null);
      resetForm();
      fetchProducts();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save product",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      brand: product.brand || '',
      category: product.category,
      type: product.type,
      baseCost: product.baseCost,
      basePrice: product.basePrice,
      stock: product.stock,
      unit: product.unit,
      lowStockThreshold: product.lowStockThreshold,
      barcode: product.barcode || '',
      variants: product.variants || [],
      isActive: product.isActive
    });
    setShowAddDialog(true);
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      const result = await productsApi.delete(productId);
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Product deleted successfully",
          variant: "default",
        });
        fetchProducts();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete product",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      brand: '',
      category: '',
      type: 'branded_packet',
      baseCost: 0,
      basePrice: 0,
      stock: 0,
      unit: '',
      lowStockThreshold: 10,
      barcode: '',
      variants: [],
      isActive: true
    });
  };

  const addVariant = () => {
    const newVariant: ProductVariant = {
      id: `var_${Date.now()}`,
      name: '',
      weight: 0,
      weightUnit: 'kg',
      price: 0,
      cost: 0,
      stock: 0,
      sku: '',
      productId: '',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setFormData({
      ...formData,
      variants: [...(formData.variants || []), newVariant]
    });
  };

  const updateVariant = (index: number, updates: Partial<ProductVariant>) => {
    const updatedVariants = (formData.variants || []).map((variant, i) =>
      i === index ? { ...variant, ...updates } : variant
    );
    setFormData({ ...formData, variants: updatedVariants });
  };

  const removeVariant = (index: number) => {
    setFormData({
      ...formData,
      variants: (formData.variants || []).filter((_, i) => i !== index)
    });
  };

  const productColumns = [
    {
      key: 'name',
      title: 'Product',
      sortable: true,
      render: (value: string, product: Product) => (
        <div>
          <div className="font-medium flex items-center gap-2">
            {product.type === 'loose_weight' ? (
              <Scale className="h-4 w-4 text-blue-500" />
            ) : (
              <Box className="h-4 w-4 text-green-500" />
            )}
            {value}
          </div>
          <div className="text-sm text-muted-foreground">{product.brand}</div>
        </div>
      ),
    },
    {
      key: 'category',
      title: 'Category',
      sortable: true,
    },
    {
      key: 'type',
      title: 'Type',
      render: (value: string) => (
        <Badge variant="outline" className="capitalize">
          {value.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      key: 'basePrice',
      title: 'Price',
      sortable: true,
      render: (value: number, product: Product) => (
        <div>
          PKR {value}
          {product.type === 'loose_weight' && `/${product.unit}`}
        </div>
      ),
    },
    {
      key: 'stock',
      title: 'Stock',
      sortable: true,
      render: (value: number, product: Product) => {
        const stockStatus = value === 0 ? 'out-of-stock' :
                          value <= product.lowStockThreshold ? 'low-stock' : 'in-stock';
        
        return (
          <div className="flex items-center gap-2">
            <span>{value} {product.unit}</span>
            {stockStatus !== 'in-stock' && (
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            )}
          </div>
        );
      },
    },
    {
      key: 'status',
      title: 'Status',
      render: (value: any, product: Product) => {
        const stockStatus = product.stock === 0 ? 'out-of-stock' :
                          product.stock <= product.lowStockThreshold ? 'low-stock' : 'in-stock';
        
        return (
          <Badge
            variant={
              stockStatus === 'out-of-stock' ? 'destructive' :
              stockStatus === 'low-stock' ? 'warning' : 'success'
            }
          >
            {stockStatus === 'out-of-stock' ? 'Out of Stock' :
             stockStatus === 'low-stock' ? 'Low Stock' : 'In Stock'}
          </Badge>
        );
      },
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (value: any, product: Product) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => handleEdit(product)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleDelete(product.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs actions={[
        { 
          label: 'Add Product', 
          icon: Plus, 
          variant: 'default',
          onClick: () => {
            resetForm();
            setShowAddDialog(true);
          }
        },
        { 
          label: 'Adjust Stock', 
          icon: Package, 
          variant: 'outline',
          onClick: () => {
            // This would open the stock adjustment dialog
            // Implementation depends on how you want to integrate it
          }
        }
      ]} />

      {/* Inventory Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Products"
          value={totalProducts}
          description="Items in inventory"
          icon={Package}
        />
        <MetricCard
          title="Low Stock"
          value={lowStockItems.length}
          description="Items need restocking"
          icon={AlertTriangle}
          badge={lowStockItems.length > 0 ? { text: 'Action Required', variant: 'warning' } : undefined}
        />
        <MetricCard
          title="Out of Stock"
          value={outOfStockItems.length}
          description="Items unavailable"
          icon={AlertTriangle}
          badge={outOfStockItems.length > 0 ? { text: 'Critical', variant: 'destructive' } : undefined}
        />
        <MetricCard
          title="Total Value"
          value={`PKR ${totalValue.toLocaleString()}`}
          description="Inventory worth"
          icon={Package}
        />
      </div>

      {/* Filters */}
      <Card className="rounded-sm">
        <CardHeader>
          <CardTitle>Inventory Filters</CardTitle>
          <CardDescription>Filter products by status and search</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search products, brands, categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('all')}
              >
                All Items ({totalProducts})
              </Button>
              <Button
                variant={filterStatus === 'low-stock' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('low-stock')}
              >
                <AlertTriangle className="h-4 w-4 mr-1" />
                Low Stock ({lowStockItems.length})
              </Button>
              <Button
                variant={filterStatus === 'out-of-stock' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('out-of-stock')}
              >
                Out of Stock ({outOfStockItems.length})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card className="rounded-sm">
        <CardHeader>
          <CardTitle>Product Inventory</CardTitle>
          <CardDescription>
            Complete list of products with stock levels and pricing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={filteredProducts}
            columns={productColumns}
            searchPlaceholder="Search products..."
            pageSize={15}
          />
        </CardContent>
      </Card>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </DialogTitle>
            <DialogDescription>
              Create or update product information and pricing
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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
            </div>

            <div className="grid grid-cols-2 gap-4">
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
                    <SelectItem value="branded_packet">Branded Packet</SelectItem>
                    <SelectItem value="loose_weight">Loose Weight</SelectItem>
                    <SelectItem value="unit_based">Unit Based</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="baseCost">Cost Price (PKR) *</Label>
                <Input
                  id="baseCost"
                  type="number"
                  step="0.01"
                  value={formData.baseCost}
                  onChange={(e) => setFormData({ ...formData, baseCost: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="basePrice">Selling Price (PKR) *</Label>
                <Input
                  id="basePrice"
                  type="number"
                  step="0.01"
                  value={formData.basePrice}
                  onChange={(e) => setFormData({ ...formData, basePrice: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="stock">Current Stock *</Label>
                <Input
                  id="stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="unit">Unit *</Label>
                <Input
                  id="unit"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  placeholder="kg, liter, piece, etc."
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="barcode">Barcode</Label>
              <Input
                id="barcode"
                value={formData.barcode || ''}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
              />
            </div>

            {/* Product Variants */}
            {formData.type === 'branded_packet' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Product Variants</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addVariant}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Variant
                  </Button>
                </div>

                {formData.variants?.map((variant, index) => (
                  <div key={variant.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Variant {index + 1}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeVariant(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Variant Name</Label>
                        <Input
                          value={variant.name}
                          onChange={(e) => updateVariant(index, { name: e.target.value })}
                          placeholder="e.g., 1kg Pack"
                        />
                      </div>
                      <div>
                        <Label>SKU</Label>
                        <Input
                          value={variant.sku}
                          onChange={(e) => updateVariant(index, { sku: e.target.value })}
                          placeholder="e.g., RICE-1KG"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <Label>Weight</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={variant.weight || ''}
                          onChange={(e) => updateVariant(index, { weight: parseFloat(e.target.value) || 0 })}
                        />
                      </div>
                      <div>
                        <Label>Unit</Label>
                        <Select
                          value={variant.weightUnit}
                          onValueChange={(value) => updateVariant(index, { weightUnit: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="kg">kg</SelectItem>
                            <SelectItem value="g">g</SelectItem>
                            <SelectItem value="L">L</SelectItem>
                            <SelectItem value="ml">ml</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Stock</Label>
                        <Input
                          type="number"
                          value={variant.stock}
                          onChange={(e) => updateVariant(index, { stock: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Cost Price</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={variant.cost}
                          onChange={(e) => updateVariant(index, { cost: parseFloat(e.target.value) || 0 })}
                        />
                      </div>
                      <div>
                        <Label>Selling Price</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={variant.price}
                          onChange={(e) => updateVariant(index, { price: parseFloat(e.target.value) || 0 })}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="lowStockThreshold">Low Stock Alert</Label>
                <Input
                  id="lowStockThreshold"
                  type="number"
                  value={formData.lowStockThreshold}
                  onChange={(e) => setFormData({ ...formData, lowStockThreshold: parseInt(e.target.value) || 10 })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingProduct ? 'Update Product' : 'Create Product'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
