'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Settings, 
  Save, 
  Database, 
  Shield, 
  Bell,
  CreditCard,
  Mail,
  Globe
} from 'lucide-react';

interface SystemSettings {
  general: {
    siteName: string;
    siteDescription: string;
    defaultCurrency: string;
    defaultTaxRate: number;
    timezone: string;
  };
  security: {
    passwordMinLength: number;
    sessionTimeout: number;
    twoFactorAuth: boolean;
    loginAttempts: number;
  };
  notifications: {
    emailEnabled: boolean;
    smsEnabled: boolean;
    pushEnabled: boolean;
    adminNotifications: boolean;
    storeNotifications: boolean;
  };
  payment: {
    defaultGateway: string;
    enableMultipleGateways: boolean;
    enableRefunds: boolean;
    refundPeriod: number;
  };
}

export default function SystemSettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>({
    general: {
      siteName: 'Retail Management System',
      siteDescription: 'Multi-store retail management platform',
      defaultCurrency: 'PKR',
      defaultTaxRate: 17,
      timezone: 'Asia/Karachi'
    },
    security: {
      passwordMinLength: 8,
      sessionTimeout: 24,
      twoFactorAuth: false,
      loginAttempts: 5
    },
    notifications: {
      emailEnabled: true,
      smsEnabled: false,
      pushEnabled: true,
      adminNotifications: true,
      storeNotifications: true
    },
    payment: {
      defaultGateway: 'cash',
      enableMultipleGateways: true,
      enableRefunds: true,
      refundPeriod: 30
    }
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

  // Fetch current settings from API
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      // Note: This would need a proper API endpoint to fetch settings
      // For now, we'll use the default settings
      setTimeout(() => {
        setLoading(false);
      }, 500);
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError('Failed to load settings');
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      // Note: This would need a proper API endpoint to save settings
      // For now, we'll simulate the save operation
      setTimeout(() => {
        setSuccess('Settings saved successfully!');
        setSaving(false);
      }, 1000);
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Failed to save settings');
      setSaving(false);
    }
  };

  const handleGeneralChange = (field: keyof SystemSettings['general'], value: string | number) => {
    setSettings(prev => ({
      ...prev,
      general: {
        ...prev.general,
        [field]: value
      }
    }));
  };

  const handleSecurityChange = (field: keyof SystemSettings['security'], value: string | number | boolean) => {
    setSettings(prev => ({
      ...prev,
      security: {
        ...prev.security,
        [field]: value
      }
    }));
  };

  const handleNotificationsChange = (field: keyof SystemSettings['notifications'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [field]: value
      }
    }));
  };

  const handlePaymentChange = (field: keyof SystemSettings['payment'], value: string | number | boolean) => {
    setSettings(prev => ({
      ...prev,
      payment: {
        ...prev.payment,
        [field]: value
      }
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-600 mt-2">Configure global system preferences and behavior</p>
        </div>
        <Button onClick={handleSaveSettings} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              General Settings
            </CardTitle>
            <CardDescription>Basic system configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="siteName">Site Name</Label>
              <Input
                id="siteName"
                value={settings.general.siteName}
                onChange={(e) => handleGeneralChange('siteName', e.target.value)}
                placeholder="Enter site name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="siteDescription">Site Description</Label>
              <Textarea
                id="siteDescription"
                value={settings.general.siteDescription}
                onChange={(e) => handleGeneralChange('siteDescription', e.target.value)}
                placeholder="Enter site description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="defaultCurrency">Default Currency</Label>
                <Select 
                  value={settings.general.defaultCurrency} 
                  onValueChange={(value) => handleGeneralChange('defaultCurrency', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PKR">PKR - Pakistani Rupee</SelectItem>
                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                    <SelectItem value="GBP">GBP - British Pound</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="defaultTaxRate">Default Tax Rate (%)</Label>
                <Input
                  id="defaultTaxRate"
                  type="number"
                  value={settings.general.defaultTaxRate}
                  onChange={(e) => handleGeneralChange('defaultTaxRate', parseFloat(e.target.value) || 0)}
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select 
                value={settings.general.timezone} 
                onValueChange={(value) => handleGeneralChange('timezone', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Asia/Karachi">Asia/Karachi (PKT)</SelectItem>
                  <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                  <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                  <SelectItem value="Asia/Tokyo">Asia/Tokyo (JST)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Settings
            </CardTitle>
            <CardDescription>Authentication and security policies</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="passwordMinLength">Minimum Password Length</Label>
              <Input
                id="passwordMinLength"
                type="number"
                value={settings.security.passwordMinLength}
                onChange={(e) => handleSecurityChange('passwordMinLength', parseInt(e.target.value) || 8)}
                min="6"
                max="50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sessionTimeout">Session Timeout (hours)</Label>
              <Input
                id="sessionTimeout"
                type="number"
                value={settings.security.sessionTimeout}
                onChange={(e) => handleSecurityChange('sessionTimeout', parseInt(e.target.value) || 24)}
                min="1"
                max="168"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="loginAttempts">Max Login Attempts</Label>
              <Input
                id="loginAttempts"
                type="number"
                value={settings.security.loginAttempts}
                onChange={(e) => handleSecurityChange('loginAttempts', parseInt(e.target.value) || 5)}
                min="1"
                max="20"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Two-Factor Authentication</Label>
                <p className="text-sm text-gray-600">Require 2FA for admin users</p>
              </div>
              <Switch
                checked={settings.security.twoFactorAuth}
                onCheckedChange={(checked) => handleSecurityChange('twoFactorAuth', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Settings
            </CardTitle>
            <CardDescription>Configure system notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Email Notifications</Label>
                <p className="text-sm text-gray-600">Send notifications via email</p>
              </div>
              <Switch
                checked={settings.notifications.emailEnabled}
                onCheckedChange={(checked) => handleNotificationsChange('emailEnabled', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>SMS Notifications</Label>
                <p className="text-sm text-gray-600">Send notifications via SMS</p>
              </div>
              <Switch
                checked={settings.notifications.smsEnabled}
                onCheckedChange={(checked) => handleNotificationsChange('smsEnabled', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Push Notifications</Label>
                <p className="text-sm text-gray-600">Send real-time push notifications</p>
              </div>
              <Switch
                checked={settings.notifications.pushEnabled}
                onCheckedChange={(checked) => handleNotificationsChange('pushEnabled', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Admin Notifications</Label>
                <p className="text-sm text-gray-600">Send notifications to system admins</p>
              </div>
              <Switch
                checked={settings.notifications.adminNotifications}
                onCheckedChange={(checked) => handleNotificationsChange('adminNotifications', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Store Notifications</Label>
                <p className="text-sm text-gray-600">Send notifications to store users</p>
              </div>
              <Switch
                checked={settings.notifications.storeNotifications}
                onCheckedChange={(checked) => handleNotificationsChange('storeNotifications', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Payment Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Settings
            </CardTitle>
            <CardDescription>Payment gateway and refund configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="defaultGateway">Default Payment Gateway</Label>
              <Select 
                value={settings.payment.defaultGateway} 
                onValueChange={(value) => handlePaymentChange('defaultGateway', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Credit/Debit Card</SelectItem>
                  <SelectItem value="jazzcash">JazzCash</SelectItem>
                  <SelectItem value="easypaisa">EasyPaisa</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Multiple Payment Gateways</Label>
                <p className="text-sm text-gray-600">Allow multiple payment methods per transaction</p>
              </div>
              <Switch
                checked={settings.payment.enableMultipleGateways}
                onCheckedChange={(checked) => handlePaymentChange('enableMultipleGateways', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Enable Refunds</Label>
                <p className="text-sm text-gray-600">Allow refund processing</p>
              </div>
              <Switch
                checked={settings.payment.enableRefunds}
                onCheckedChange={(checked) => handlePaymentChange('enableRefunds', checked)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="refundPeriod">Refund Period (days)</Label>
              <Input
                id="refundPeriod"
                type="number"
                value={settings.payment.refundPeriod}
                onChange={(e) => handlePaymentChange('refundPeriod', parseInt(e.target.value) || 30)}
                min="1"
                max="365"
                disabled={!settings.payment.enableRefunds}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Database Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Management
          </CardTitle>
          <CardDescription>System database configuration and maintenance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium text-gray-900">Backup Database</h3>
              <p className="text-sm text-gray-600 mt-1">Create a backup of the entire database</p>
              <Button variant="outline" className="mt-3 w-full">
                Create Backup
              </Button>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium text-gray-900">Restore Database</h3>
              <p className="text-sm text-gray-600 mt-1">Restore from a previous backup</p>
              <Button variant="outline" className="mt-3 w-full">
                Restore Backup
              </Button>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium text-gray-900">Clear Cache</h3>
              <p className="text-sm text-gray-600 mt-1">Clear system cache and temporary files</p>
              <Button variant="outline" className="mt-3 w-full">
                Clear Cache
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
