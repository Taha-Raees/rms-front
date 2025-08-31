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
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/hooks/use-toast';
import { Save, Store, CreditCard, SettingsIcon, Info } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

// Interfaces matching the backend Prisma schema
interface Store {
  id: string;
  name: string;
  businessType: string;
  currency: string;
  currencySymbol: string;
  settings: {
    lowStockAlerts: boolean;
    autoReorder: boolean;
    taxRate: number;
    discountEnabled: boolean;
    multiplePaymentMethods: boolean;
    receiptPrinting: boolean;
    barcodeScanning: boolean;
  };
  subscriptionPaymentMethod?: string; // Made optional
  owner: {
    name?: string;
    email?: string;
  };
  contact: {
    phone?: string;
    email?: string;
  };
  address: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
  };
  subscription?: { // Made optional to prevent runtime errors
    plan: string;
    status: string;
    expiresAt?: string;
  };
  isActive?: boolean; // Added for status display
  createdAt: Date;
  updatedAt: Date;
}

interface StoreSettingsFormData {
  name: string;
  businessType: string;
  currency: string;
  currencySymbol: string;
  settings: {
    lowStockAlerts: boolean;
    autoReorder: boolean;
    taxRate: number;
    discountEnabled: boolean;
    multiplePaymentMethods: boolean;
    receiptPrinting: boolean;
    barcodeScanning: boolean;
  };
  subscriptionPaymentMethod: string;
  owner?: {
    name?: string;
    email?: string;
  };
  contact?: {
    phone?: string;
    email?: string;
  };
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
  };
}

export default function SettingsPage() {
  const { state, dispatch } = useApp();
  const { store } = state;
  const { toast } = useToast();

  const [formData, setFormData] = useState<StoreSettingsFormData>({
    name: '',
    businessType: '',
    currency: '',
    currencySymbol: '',
    settings: {
      lowStockAlerts: false,
      autoReorder: false,
      taxRate: 0,
      discountEnabled: false,
      multiplePaymentMethods: false,
      receiptPrinting: false,
      barcodeScanning: false,
    },
    subscriptionPaymentMethod: '',
    owner: { name: '', email: '' },
    contact: { phone: '', email: '' },
    address: { street: '', city: '', state: '', postalCode: '' },
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
        settings: {
          lowStockAlerts: store.settings?.lowStockAlerts || false,
          autoReorder: store.settings?.autoReorder || false,
          taxRate: (store.settings as any)?.taxRate || 0, // Handle missing taxRate property
          discountEnabled: store.settings?.discountEnabled || false,
          multiplePaymentMethods: store.settings?.multiplePaymentMethods || false,
          receiptPrinting: store.settings?.receiptPrinting || false,
          barcodeScanning: store.settings?.barcodeScanning || false,
        },
        subscriptionPaymentMethod: (store as any).subscriptionPaymentMethod || '',
        owner: { ...store.owner },
        contact: { ...store.contact },
        address: { ...store.address },
      });
    }
  }, [store]);

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
      settings: {
        ...prev.settings,
        [id]: checked,
      },
    }));
  };

  const handleTaxRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        taxRate: parseFloat(e.target.value) || 0,
      },
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
      <Breadcrumbs />

      <h2 className="text-3xl font-bold tracking-tight">Store Settings</h2>
      <p className="text-muted-foreground">Manage your store's details, business operations, and subscription.</p>

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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.contact?.phone || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    contact: { ...prev.contact, phone: e.target.value }
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="email">Store Email</Label>
                <Input
                  id="email"
                  value={formData.contact?.email || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    contact: { ...prev.contact, email: e.target.value }
                  }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={`${formData.address?.street || ''}, ${formData.address?.city || ''}, ${formData.address?.state || ''} ${formData.address?.postalCode || ''}`}
                disabled // Read-only, complex address editing would be in another app
                rows={3}
              />
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
                  checked={formData.settings.lowStockAlerts}
                  onCheckedChange={(checked) => handleSettingsToggleChange('lowStockAlerts', checked)}
                />
              </div>
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="autoReorder">Automatic Reorder</Label>
                <Switch
                  id="autoReorder"
                  checked={formData.settings.autoReorder}
                  onCheckedChange={(checked) => handleSettingsToggleChange('autoReorder', checked)}
                />
              </div>
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="discountEnabled">Enable Discounts</Label>
                <Switch
                  id="discountEnabled"
                  checked={formData.settings.discountEnabled}
                  onCheckedChange={(checked) => handleSettingsToggleChange('discountEnabled', checked)}
                />
              </div>
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="multiplePaymentMethods">Multiple Payment Methods</Label>
                <Switch
                  id="multiplePaymentMethods"
                  checked={formData.settings.multiplePaymentMethods}
                  onCheckedChange={(checked) => handleSettingsToggleChange('multiplePaymentMethods', checked)}
                />
              </div>
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="receiptPrinting">Receipt Printing</Label>
                <Switch
                  id="receiptPrinting"
                  checked={formData.settings.receiptPrinting}
                  onCheckedChange={(checked) => handleSettingsToggleChange('receiptPrinting', checked)}
                />
              </div>
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="barcodeScanning">Barcode Scanning</Label>
                <Switch
                  id="barcodeScanning"
                  checked={formData.settings.barcodeScanning}
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
                value={formData.settings.taxRate * 100} // Display as percentage
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
