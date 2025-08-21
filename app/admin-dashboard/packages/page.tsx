'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Plus, 
  Edit, 
  Trash2, 
  CreditCard,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AdminBreadcrumbs } from '@/components/layout/AdminBreadcrumbs';

interface SubscriptionPackage {
  id: string;
  name: string;
  price: number;
  currency: string;
  description: string;
  maxStores: number;
  maxProducts: number;
  maxUsers: number;
  features: string[];
  isActive: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function SubscriptionPackagesPage() {
  const { toast } = useToast();
  const [packages, setPackages] = useState<SubscriptionPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<SubscriptionPackage | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    currency: 'PKR',
    description: '',
    maxStores: 1,
    maxProducts: 100,
    maxUsers: 5,
    features: '',
    isActive: true,
    isDefault: false
  });

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

  // Fetch packages from API
  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`${API_BASE_URL}/admin/subscription-packages`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        setPackages(result.data || []);
      } else {
        const errorResult = await response.json();
        setError(errorResult.error || 'Failed to fetch subscription packages');
        setPackages([]);
      }
    } catch (err) {
      console.error('Error fetching packages:', err);
      setError('Failed to connect to server');
      setPackages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'maxStores' || name === 'maxProducts' || name === 'maxUsers' 
        ? Number(value) 
        : value
    }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingPackage 
        ? `${API_BASE_URL}/admin/subscription-packages/${editingPackage.id}`
        : `${API_BASE_URL}/admin/subscription-packages`;
      
      const method = editingPackage ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          features: formData.features.split('\n').filter(f => f.trim() !== '')
        }),
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: editingPackage ? "Package Updated" : "Package Created",
          description: editingPackage 
            ? "Subscription package has been updated successfully."
            : "New subscription package has been created successfully."
        });
        setIsDialogOpen(false);
        resetForm();
        fetchPackages(); // Refresh the package list
      } else {
        const errorResult = await response.json();
        toast({
          title: "Error",
          description: errorResult.error || "Failed to save subscription package.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error('Error saving package:', err);
      toast({
        title: "Error",
        description: "Failed to save subscription package.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (pkg: SubscriptionPackage) => {
    setEditingPackage(pkg);
    setFormData({
      name: pkg.name,
      price: pkg.price,
      currency: pkg.currency,
      description: pkg.description,
      maxStores: pkg.maxStores,
      maxProducts: pkg.maxProducts,
      maxUsers: pkg.maxUsers,
      features: pkg.features.join('\n'),
      isActive: pkg.isActive,
      isDefault: pkg.isDefault
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this subscription package?')) {
      setPackages(prev => prev.filter(p => p.id !== id));
      toast({
        title: "Package Deleted",
        description: "Subscription package has been deleted successfully.",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: 0,
      currency: 'PKR',
      description: '',
      maxStores: 1,
      maxProducts: 100,
      maxUsers: 5,
      features: '',
      isActive: true,
      isDefault: false
    });
    setEditingPackage(null);
  };

  const formatCurrency = (amount: number, currency: string = 'PKR') => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading subscription packages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Subscription Packages</h1>
          <p className="text-gray-600 mt-2">Manage subscription packages and pricing tiers</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add New Package
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPackage ? 'Edit Package' : 'Create New Package'}
              </DialogTitle>
              <DialogDescription>
                {editingPackage ? 'Update package details' : 'Fill in the details to create a new subscription package'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Package Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Basic, Premium, Enterprise"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price (Monthly) *</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="e.g., 500"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe this package..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxStores">Max Stores</Label>
                  <Input
                    id="maxStores"
                    name="maxStores"
                    type="number"
                    value={formData.maxStores}
                    onChange={handleInputChange}
                    placeholder="e.g., 1"
                    min="-1"
                  />
                  <p className="text-xs text-muted-foreground">-1 for unlimited</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxProducts">Max Products</Label>
                  <Input
                    id="maxProducts"
                    name="maxProducts"
                    type="number"
                    value={formData.maxProducts}
                    onChange={handleInputChange}
                    placeholder="e.g., 500"
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxUsers">Max Users</Label>
                  <Input
                    id="maxUsers"
                    name="maxUsers"
                    type="number"
                    value={formData.maxUsers}
                    onChange={handleInputChange}
                    placeholder="e.g., 3"
                    min="1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="features">Features (one per line)</Label>
                <Textarea
                  id="features"
                  name="features"
                  value={formData.features}
                  onChange={handleInputChange}
                  placeholder="Enter features, one per line&#10;e.g., Up to 500 products&#10;3 user accounts"
                  rows={6}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Active Status</Label>
                  <p className="text-sm text-muted-foreground">Make this package available for purchase</p>
                </div>
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => handleSwitchChange('isActive', checked)}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => {
                  setIsDialogOpen(false);
                  resetForm();
                }}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingPackage ? 'Update Package' : 'Create Package'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <Card key={pkg.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {pkg.name}
                    {pkg.isActive ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {pkg.description}
                  </CardDescription>
                </div>
                <Badge variant={pkg.isActive ? 'default' : 'secondary'}>
                  {pkg.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-3xl font-bold text-primary">
                  {formatCurrency(pkg.price, pkg.currency)}
                  <span className="text-lg font-normal text-muted-foreground">/month</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Max Stores:</span>
                    <span className="font-medium">
                      {pkg.maxStores === -1 ? 'Unlimited' : pkg.maxStores}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Max Products:</span>
                    <span className="font-medium">{pkg.maxProducts.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Max Users:</span>
                    <span className="font-medium">{pkg.maxUsers}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <h4 className="text-sm font-medium">Features:</h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {pkg.features.slice(0, 3).map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-1">•</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                    {pkg.features.length > 3 && (
                      <li className="text-primary">+{pkg.features.length - 3} more features</li>
                    )}
                  </ul>
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleEdit(pkg)}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleDelete(pkg.id)}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Packages Table for Better Overview */}
      <Card>
        <CardHeader>
          <CardTitle>All Packages Overview</CardTitle>
          <CardDescription>Detailed view of all subscription packages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Package</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stores</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead>Users</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {packages.map((pkg) => (
                  <TableRow key={pkg.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{pkg.name}</div>
                        <div className="text-sm text-muted-foreground">{pkg.description}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(pkg.price, pkg.currency)}/mo
                    </TableCell>
                    <TableCell>
                      {pkg.maxStores === -1 ? 'Unlimited' : pkg.maxStores}
                    </TableCell>
                    <TableCell>{pkg.maxProducts.toLocaleString()}</TableCell>
                    <TableCell>{pkg.maxUsers}</TableCell>
                    <TableCell>
                      <Badge variant={pkg.isActive ? 'default' : 'secondary'}>
                        {pkg.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEdit(pkg)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDelete(pkg.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
