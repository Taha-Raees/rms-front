'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Settings,
  User,
  Bell,
  Shield,
  CreditCard,
  Store,
  Printer,
  Palette,
  Moon,
  Sun,
  Globe,
  Wifi
} from 'lucide-react';

type SettingsView = 'overview';

interface MobileSettingsManagerProps {
  initialView?: SettingsView;
}

export function MobileSettingsManager({
  initialView = 'overview'
}: MobileSettingsManagerProps) {
  const [currentView, setCurrentView] = useState<SettingsView>(initialView);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const settingsSections = [
    {
      title: 'Store',
      items: [
        { icon: Store, label: 'Store Information', description: 'Update business details', action: () => {} },
        { icon: User, label: 'Profile Settings', description: 'Manage your account', action: () => {} },
        { icon: CreditCard, label: 'Payment Methods', description: 'Configure payment options', action: () => {} },
      ]
    },
    {
      title: 'Notifications',
      items: [
        {
          icon: Bell,
          label: 'Push Notifications',
          description: 'Get notified about orders',
          action: null,
          toggle: { value: notifications, set: setNotifications }
        },
        { icon: Bell, label: 'Email Notifications', description: 'Receive email updates', action: () => {} },
      ]
    },
    {
      title: 'Display',
      items: [
        {
          icon: Moon,
          label: 'Dark Mode',
          description: 'Toggle dark theme',
          action: null,
          toggle: { value: darkMode, set: setDarkMode }
        },
        { icon: Palette, label: 'Theme Colors', description: 'Customize appearance', action: () => {} },
      ]
    },
    {
      title: 'System',
      items: [
        { icon: Shield, label: 'Security', description: 'Password and authentication', action: () => {} },
        { icon: Printer, label: 'Printer Settings', description: 'Configure receipt printer', action: () => {} },
        { icon: Wifi, label: 'Network', description: 'Connection and sync settings', action: () => {} },
        { icon: Globe, label: 'Language', description: 'Choose your language', action: () => {} },
      ]
    }
  ];

  if (currentView === 'overview') {
    return (
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="text-center py-4">
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Customize your retail management experience
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <User className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <p className="font-semibold text-sm">Account</p>
              <p className="text-xs text-muted-foreground">Profile & Security</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              {notifications ? (
                <Bell className="h-8 w-8 mx-auto mb-2 text-green-500" />
              ) : (
                <Bell className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              )}
              <p className="font-semibold text-sm">Notifications</p>
              <p className="text-xs text-muted-foreground">
                {notifications ? 'Enabled' : 'Disabled'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Settings Sections */}
        {settingsSections.map((section) => (
          <Card key={section.title}>
            <CardHeader>
              <CardTitle className="text-lg">{section.title}</CardTitle>
              <CardDescription>Configure {section.title.toLowerCase()} preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {section.items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <item.icon className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                  </div>

                  {item.toggle ? (
                    <Switch
                      checked={item.toggle.value}
                      onCheckedChange={item.toggle.set}
                    />
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={item.action}
                      className="h-8 w-8 p-0"
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        ))}

        {/* App Info */}
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Settings className="h-6 w-6 text-primary" />
              </div>
              <p className="font-semibold">Retail Management</p>
              <p className="text-sm text-muted-foreground">Version 1.0.0</p>
              <Badge variant="outline" className="mt-2">
                Mobile Optimized
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Quick Help */}
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Need help?</p>
              <Button variant="outline" size="sm">
                Contact Support
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
