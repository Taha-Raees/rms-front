'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Building, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  Eye,
  CreditCard
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AdminBreadcrumbs } from '@/components/layout/AdminBreadcrumbs';

interface StoreData {
  id: string;
  name: string;
  businessType: string;
  street: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  owner: {
    id: string;
    name: string | null;
    email: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export default function StoresPage() {
  const { toast } = useToast();
  const [stores, setStores] = useState<StoreData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<StoreData | null>(null);
  const [activeTab, setActiveTab] = useState<'stores' | 'create'>('stores');
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

  // Fetch stores from API
  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`${API_BASE_URL}/admin/create-store`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        setStores(result.data || []);
      } else {
        const errorResult = await response.json();
        setError(errorResult.error || 'Failed to fetch stores');
        setStores([]);
      }
    } catch (err) {
      console.error('Error fetching stores:', err);
      setError('Failed to connect to server');
      setStores([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEditStore = (store: StoreData) => {
    setEditingStore(store);
    setActiveTab('create');
  };

  const handleDeleteStore = async (storeId: string) => {
    if (!confirm('Are you sure you want to delete this store? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/admin/create-store/${storeId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setStores(prev => prev.filter(store => store.id !== storeId));
        toast({
          title: "Store Deleted",
          description: "Store has been deleted successfully.",
        });
      } else {
        const errorResult = await response.json();
        toast({
          title: "Error",
          description: errorResult.error || "Failed to delete store.",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete store.",
        variant: "destructive",
      });
    }
  };

  const filteredStores = stores.filter(store => {
    const matchesSearch = store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (store.owner?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
                         (store.owner?.email?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    return matchesSearch;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getBusinessTypeBadge = (type: string) => {
    switch (type) {
      case 'GROCERY': return 'default';
      case 'ELECTRONICS': return 'secondary';
      case 'CLOTHING': return 'outline';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading stores...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminBreadcrumbs />
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Stores</h1>
          <p className="text-gray-600 mt-2">Manage all retail stores in the system</p>
        </div>
        <Button onClick={() => {
          setEditingStore(null);
          setActiveTab('create');
          setIsDialogOpen(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Create New Store
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 border-b">
        <Button
          variant={activeTab === 'stores' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('stores')}
          className="flex items-center space-x-2"
        >
          <Building className="h-4 w-4" />
          <span>Stores Overview</span>
        </Button>
        <Button
          variant={activeTab === 'create' ? 'default' : 'ghost'}
          onClick={() => {
            setEditingStore(null);
            setActiveTab('create');
            setIsDialogOpen(true);
          }}
          className="flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Create New</span>
        </Button>
      </div>

      {activeTab === 'stores' && (
        <>
          {/* Search */}
          <Card>
            <CardHeader>
              <CardTitle>Search Stores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search stores, owners, or emails..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stores Table */}
          <Card>
            <CardHeader>
              <CardTitle>Stores ({filteredStores.length})</CardTitle>
              <CardDescription>View and manage all retail stores</CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {filteredStores.length === 0 ? (
                <div className="text-center py-8">
                  <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No stores found</h3>
                  <p className="text-gray-600">Get started by creating a new store.</p>
                  <Button 
                    className="mt-4" 
                    onClick={() => {
                      setEditingStore(null);
                      setActiveTab('create');
                      setIsDialogOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Store
                  </Button>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Store</TableHead>
                        <TableHead>Owner</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStores.map((store) => (
                        <TableRow key={store.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{store.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {store.email || 'No email'}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{store.owner?.name || 'No owner'}</div>
                              <div className="text-sm text-muted-foreground">
                                {store.owner?.email || 'No email'}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getBusinessTypeBadge(store.businessType)}>
                              {store.businessType}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {store.city || 'No city'}
                              {store.city && store.state ? ', ' : ''}
                              {store.state || ''}
                            </div>
                          </TableCell>
                          <TableCell>{formatDate(store.createdAt)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleEditStore(store)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleDeleteStore(store.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Create Store Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) {
          setActiveTab('stores');
          setEditingStore(null);
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingStore ? 'Edit Store' : 'Create New Store'}
            </DialogTitle>
            <DialogDescription>
              {editingStore ? 'Update store information' : 'Fill in the details to create a new store'}
            </DialogDescription>
          </DialogHeader>
          <StoreForm 
            store={editingStore} 
            onSuccess={() => {
              setIsDialogOpen(false);
              setActiveTab('stores');
              fetchStores();
            }} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Store Form Component
function StoreForm({ store, onSuccess }: { store: StoreData | null; onSuccess: () => void }) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    storeName: store?.name || '',
    businessType: store?.businessType || '',
    ownerName: store?.owner?.name || '',
    ownerEmail: store?.owner?.email || '',
    ownerPhone: '',
    password: '',
    street: store?.street || '',
    city: store?.city || '',
    state: store?.state || '',
    postalCode: store?.postalCode || '',
    country: store?.country || 'Pakistan',
    phone: store?.phone || '',
    email: store?.email || '',
    website: store?.website || '',
    currency: 'PKR',
    taxRate: '17'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const url = store 
        ? `${API_BASE_URL}/admin/create-store/${store.id}`
        : `${API_BASE_URL}/admin/create-store`;
      
      const method = store ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          storeName: formData.storeName,
          businessType: formData.businessType,
          ownerName: formData.ownerName,
          ownerEmail: formData.ownerEmail,
          ownerPhone: formData.ownerPhone,
          password: formData.password,
          street: formData.street,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: formData.country,
          phone: formData.phone,
          email: formData.email,
          website: formData.website,
          currency: formData.currency,
          taxRate: formData.taxRate
        }),
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: store ? "Store Updated" : "Store Created",
          description: store ? "Store information has been updated successfully." : "New store has been created successfully.",
        });
        onSuccess();
      } else {
        const errorResult = await response.json();
        setError(errorResult.error || 'Failed to save store information');
        toast({
          title: "Error",
          description: errorResult.error || "Failed to save store information.",
          variant: "destructive",
        });
      }
    } catch (err) {
      setError('Error saving store information');
      toast({
        title: "Error",
        description: "Failed to save store information.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Store Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">Store Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="storeName">Store Name *</Label>
            <Input
              id="storeName"
              name="storeName"
              value={formData.storeName}
              onChange={handleInputChange}
              placeholder="e.g., Ahmed General Store"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="businessType">Business Type *</Label>
            <Select onValueChange={(value) => handleSelectChange('businessType', value)} value={formData.businessType}>
              <SelectTrigger>
                <SelectValue placeholder="Select business type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GROCERY">Grocery & General Store</SelectItem>
                <SelectItem value="ELECTRONICS">Electronics Store</SelectItem>
                <SelectItem value="CLOTHING">Clothing Store</SelectItem>
                <SelectItem value="PHARMACY">Pharmacy</SelectItem>
                <SelectItem value="HARDWARE">Hardware Store</SelectItem>
                <SelectItem value="GENERAL">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Owner Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">Owner Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="ownerName">Owner Name *</Label>
            <Input
              id="ownerName"
              name="ownerName"
              value={formData.ownerName}
              onChange={handleInputChange}
              placeholder="e.g., Ahmed Ali"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ownerEmail">Owner Email *</Label>
            <Input
              id="ownerEmail"
              name="ownerEmail"
              type="email"
              value={formData.ownerEmail}
              onChange={handleInputChange}
              placeholder="e.g., ahmed@store.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ownerPhone">Owner Phone *</Label>
            <Input
              id="ownerPhone"
              name="ownerPhone"
              value={formData.ownerPhone}
              onChange={handleInputChange}
              placeholder="e.g., +92-300-1234567"
              required
            />
          </div>
          {!store && (
            <div className="space-y-2">
              <Label htmlFor="password">Login Password *</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Store login password"
                required
              />
            </div>
          )}
        </div>
      </div>

      {/* Address Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">Address Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="street">Street Address *</Label>
            <Input
              id="street"
              name="street"
              value={formData.street}
              onChange={handleInputChange}
              placeholder="e.g., 123 Main Street"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              placeholder="e.g., Karachi"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">State/Province *</Label>
            <Input
              id="state"
              name="state"
              value={formData.state}
              onChange={handleInputChange}
              placeholder="e.g., Sindh"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="postalCode">Postal Code</Label>
            <Input
              id="postalCode"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleInputChange}
              placeholder="e.g., 74000"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              placeholder="Pakistan"
            />
          </div>
        </div>
      </div>

      {/* Contact & Settings */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">Contact & Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Store Phone</Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Store contact number"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Store Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Store contact email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="website">Website (Optional)</Label>
            <Input
              id="website"
              name="website"
              value={formData.website}
              onChange={handleInputChange}
              placeholder="www.example.com"
            />
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : store ? 'Update Store' : 'Create Store'}
        </Button>
      </div>
    </form>
  );
}
