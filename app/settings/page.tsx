'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Save, Store, CreditCard, SettingsIcon, Info } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

// Interfaces matching the backend Prisma schema (with settings object)
interface Store {
  id: string;
  name: string;
  businessType: string;
  currency: string;
  currencySymbol: string;
  // Settings as object with individual boolean fields (matching API response)
  settings?: {
    lowStockAlerts?: boolean;
    autoReorder?: boolean;
    discountEnabled?: boolean;
    multiplePaymentMethods?: boolean;
    receiptPrinting?: boolean;
    barcodeScanning?: boolean;
  };
  // Tax rate separate field
  taxRate?: number;
  subscriptionPaymentMethod?: string;
  // Owner info from relation (may not be included in store response)
  owner?: {
    name?: string;
    email?: string;
  };
  // Contact fields as flat strings
  phone?: string;
  email?: string;
  website?: string;
  // Address fields as flat strings
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  subscription?: {
    plan: string;
    status: string;
    expiresAt?: string;
  };
  isActive?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface StoreSettingsFormData {
  name: string;
  businessType: string;
  currency: string;
  currencySymbol: string;
  // Settings as individual boolean fields
  lowStockAlerts: boolean;
  autoReorder: boolean;
  discountEnabled: boolean;
  multiplePaymentMethods: boolean;
  receiptPrinting: boolean;
  barcodeScanning: boolean;
  // Tax rate separate field
  taxRate: number;
  subscriptionPaymentMethod: string;
  // Owner info
  owner?: {
    name?: string;
    email?: string;
  };
  // Contact fields as flat strings
  phone?: string;
  email?: string;
  // Address fields as flat strings
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export default function SettingsPage() {
  const { state, dispatch } = useApp();
  const { store } = state;
  const { state: authState } = useAuth();
  const { user } = authState;
  const { toast } = useToast();

  const [formData, setFormData] = useState<StoreSettingsFormData>({
    name: '',
    businessType: '',
    currency: '',
    currencySymbol: '',
    lowStockAlerts: false,
    autoReorder: false,
    discountEnabled: false,
    multiplePaymentMethods: false,
    receiptPrinting: false,
    barcodeScanning: false,
    taxRate: 0,
    subscriptionPaymentMethod: '',
    owner: { name: '', email: '' },
    phone: '',
    email: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Initialize form data with current store state
    if (store) {
      setFormData({
        name: store.name,
        businessType: store.businessType,
        currency: store.currency,
        currencySymbol: store.currencySymbol,
        lowStockAlerts: store.settings?.lowStockAlerts || false,
        autoReorder: store.settings?.autoReorder || false,
        discountEnabled: store.settings?.discountEnabled || false,
        multiplePaymentMethods: store.settings?.multiplePaymentMethods || false,
        receiptPrinting: store.settings?.receiptPrinting || false,
        barcodeScanning: store.settings?.barcodeScanning || false,
        taxRate: store.taxRate || 0,
        subscriptionPaymentMethod: store.subscriptionPaymentMethod || '',
        // Use logged-in user info for owner, fallback to store.owner if exists
        owner: {
          name: store.owner?.name || '',
          email: user?.email || store.owner?.email || ''
        },
        phone: store.phone || '',
        email: store.email || '',
        street: store.street || '',
        city: store.city || '',
        state: store.state || '',
        postalCode: store.postalCode || '',
        country: store.country || '',
      });
    }
  }, [store, user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSelectChange = (id: keyof StoreSettingsFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSettingsToggleChange = (id: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [id]: checked,
    }));
  };

  const handleTaxRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      taxRate: parseFloat(e.target.value) || 0,
    }));
  };

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/store`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...formData, id: store?.id }),
      });

      const result = await response.json();

      if (result.success) {
        // Update global app state with the new store data
        dispatch({ type: 'UPDATE_STORE', payload: result.data });
        toast({
          title: "Success",
          description: "Store settings updated successfully!",
          variant: "default",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update settings.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while saving settings.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Store Details */}
        <Card className="rounded-sm"> {/* Added rounded-sm */}
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Store Details
            </CardTitle>
            <CardDescription>Update your store's basic information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Store Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="businessType">Business Type</Label>
                <Input
                  id="businessType"
                  value={formData.businessType}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ownerName">Owner Name</Label>
                <Input
                  id="ownerName"
                  value={formData.owner?.name || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    owner: { ...prev.owner, name: e.target.value }
                  }))}
                  disabled // Read-only, updated from another app
                />
              </div>
              <div>
                <Label htmlFor="ownerEmail">Owner Email</Label>
                <Input
                  id="ownerEmail"
                  value={formData.owner?.email || ''}
                  disabled // Read-only
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="email">Store Email</Label>
                <Input
                  id="email"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Address Fields */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="street">Street Address</Label>
                <Input
                  id="street"
                  value={formData.street}
                  onChange={handleInputChange}
                  placeholder="123 Main Street"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Karachi"
                  />
                </div>
                <div>
                  <Label htmlFor="state">State/Province</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="Sindh"
                  />
                </div>
                <div>
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    id="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    placeholder="74000"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  placeholder="Pakistan"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="currency">Currency</Label>
                <Select value={formData.currency} onValueChange={(value) => handleSelectChange('currency', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PKR">PKR (Pakistani Rupee)</SelectItem>
                    <SelectItem value="USD">USD (US Dollar)</SelectItem>
                    <SelectItem value="EUR">EUR (Euro)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="currencySymbol">Currency Symbol</Label>
                <Input
                  id="currencySymbol"
                  value={formData.currencySymbol}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business Settings */}
        <Card className="rounded-sm"> {/* Added rounded-sm */}
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5" />
              Business Operations
            </CardTitle>
            <CardDescription>Configure operational settings for your store.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="lowStockAlerts">Low Stock Alerts</Label>
                <Switch
                  id="lowStockAlerts"
                  checked={formData.lowStockAlerts}
                  onCheckedChange={(checked) => handleSettingsToggleChange('lowStockAlerts', checked)}
                />
              </div>
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="autoReorder">Automatic Reorder</Label>
                <Switch
                  id="autoReorder"
                  checked={formData.autoReorder}
                  onCheckedChange={(checked) => handleSettingsToggleChange('autoReorder', checked)}
                />
              </div>
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="discountEnabled">Enable Discounts</Label>
                <Switch
                  id="discountEnabled"
                  checked={formData.discountEnabled}
                  onCheckedChange={(checked) => handleSettingsToggleChange('discountEnabled', checked)}
                />
              </div>
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="multiplePaymentMethods">Multiple Payment Methods</Label>
                <Switch
                  id="multiplePaymentMethods"
                  checked={formData.multiplePaymentMethods}
                  onCheckedChange={(checked) => handleSettingsToggleChange('multiplePaymentMethods', checked)}
                />
              </div>
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="receiptPrinting">Receipt Printing</Label>
                <Switch
                  id="receiptPrinting"
                  checked={formData.receiptPrinting}
                  onCheckedChange={(checked) => handleSettingsToggleChange('receiptPrinting', checked)}
                />
              </div>
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="barcodeScanning">Barcode Scanning</Label>
                <Switch
                  id="barcodeScanning"
                  checked={formData.barcodeScanning}
                  onCheckedChange={(checked) => handleSettingsToggleChange('barcodeScanning', checked)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="taxRate">Tax Rate (%)</Label>
              <Input
                id="taxRate"
                type="number"
                step="0.01"
                value={formData.taxRate * 100} // Display as percentage
                onChange={handleTaxRateChange}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Store Information
            </CardTitle>
            <CardDescription>Read-only information managed by system administrator.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Store ID</Label>
                <Input value={store?.id || ''} disabled />
              </div>
              <div>
                <Label>Created Date</Label>
                <Input value={store?.createdAt ? new Date(store.createdAt).toLocaleDateString() : ''} disabled />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Status</Label>
                <Input value={store?.isActive ? 'Active' : 'Inactive'} disabled />
              </div>
              <div>
                <Label>Last Updated</Label>
                <Input value={store?.updatedAt ? new Date(store.updatedAt).toLocaleDateString() : ''} disabled />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subscription & Billing */}
        <Card className="rounded-sm"> {/* Added rounded-sm */}
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Subscription & Billing
            </CardTitle>
            <CardDescription>Manage your subscription plan and payment method for this service.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Current Plan</Label>
              <p className="text-lg font-semibold">{store?.subscription?.plan || 'Basic Plan'}</p>
              <p className="text-sm text-muted-foreground">Status: {store?.subscription?.status || 'Active'} • Expires: {store?.subscription?.expiresAt ? new Date(store.subscription.expiresAt).toLocaleDateString() : 'Never'}</p>
            </div>
            <div>
              <Label htmlFor="subscriptionPaymentMethod">Payment Method</Label>
              <Select value={formData.subscriptionPaymentMethod} onValueChange={(value) => handleSelectChange('subscriptionPaymentMethod', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Credit Card (**** 1234)">Credit Card (**** 1234)</SelectItem>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  <SelectItem value="PayPal">PayPal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-sm text-muted-foreground">
              To update billing details or change your plan, please contact support.
            </p>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <>
                <span className="animate-spin mr-2">⚙️</span> Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
