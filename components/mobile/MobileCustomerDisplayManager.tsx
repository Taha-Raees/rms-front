'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Monitor, Settings, Wifi, WifiOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type CustomerDisplayView = 'overview';

interface MobileCustomerDisplayManagerProps {
  initialView?: CustomerDisplayView;
}

export function MobileCustomerDisplayManager({
  initialView = 'overview'
}: MobileCustomerDisplayManagerProps) {
  const [currentView, setCurrentView] = useState<CustomerDisplayView>(initialView);
  const [isConnected, setIsConnected] = useState(true);

  const toggleConnection = () => {
    setIsConnected(!isConnected);
  };

  if (currentView === 'overview') {
    return (
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="text-center py-4">
          <h1 className="text-2xl font-bold">Customer Display</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor and control customer-facing screens
          </p>
        </div>

        {/* Connection Status */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isConnected ? (
                  <Wifi className="h-5 w-5 text-green-500" />
                ) : (
                  <WifiOff className="h-5 w-5 text-red-500" />
                )}
                <div>
                  <p className="font-medium">
                    {isConnected ? 'Connected' : 'Disconnected'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isConnected ? 'Customer display is active' : 'Check connection settings'}
                  </p>
                </div>
              </div>
              <Badge
                variant={isConnected ? 'success' : 'destructive'}
                className="capitalize"
              >
                {isConnected ? 'Online' : 'Offline'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Display Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Display Control</CardTitle>
            <CardDescription>Manage customer display settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                disabled={!isConnected}
                className="flex flex-col items-center gap-2 h-20"
              >
                <Monitor className="h-6 w-6" />
                <span className="text-xs">Show Receipt</span>
              </Button>

              <Button
                variant="outline"
                disabled={!isConnected}
                className="flex flex-col items-center gap-2 h-20"
              >
                <Users className="h-6 w-6" />
                <span className="text-xs">Show Welcome</span>
              </Button>

              <Button
                variant="outline"
                disabled={!isConnected}
                className="flex flex-col items-center gap-2 h-20"
              >
                <Settings className="h-6 w-6" />
                <span className="text-xs">Display Settings</span>
              </Button>

              <Button
                onClick={toggleConnection}
                className="flex flex-col items-center gap-2 h-20"
              >
                {isConnected ? (
                  <WifiOff className="h-6 w-6" />
                ) : (
                  <Wifi className="h-6 w-6" />
                )}
                <span className="text-xs">
                  {isConnected ? 'Disconnect' : 'Connect'}
                </span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Display Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Display Preview</CardTitle>
            <CardDescription>What customers are seeing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 text-center">
              {isConnected ? (
                <>
                  <div className="text-2xl font-bold mb-2">Welcome!</div>
                  <div className="text-sm text-muted-foreground">
                    Ready to serve you
                  </div>
                </>
              ) : (
                <>
                  <Monitor className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <div className="text-sm text-muted-foreground">
                    Display not connected
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
            <CardDescription>Latest display interactions</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-8">
              No recent activity
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
