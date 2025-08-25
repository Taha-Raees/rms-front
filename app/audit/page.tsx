'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ActivityDashboard } from '@/components/audit/ActivityDashboard';
import { UserActivityLog } from '@/components/audit/UserActivityLog';
import { EntityHistory } from '@/components/audit/EntityHistory';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { ExportDialog } from '@/components/audit/ExportDialog';
import { useAuth } from '@/contexts/AuthContext';

export default function AuditPage() {
  const { state } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (state.isLoading) {
    return <div>Loading...</div>;
  }

  if (!state.isAuthenticated || !state.user || !state.store) {
    return <div>Please log in to access audit trails.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit Trail</h1>
          <p className="text-muted-foreground">
            Monitor and track all system activities and user actions
          </p>
        </div>
        <ExportDialog
          trigger={
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Export Logs
            </Button>
          }
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="dashboard">Activity Dashboard</TabsTrigger>
          <TabsTrigger value="users">User Activity</TabsTrigger>
          <TabsTrigger value="entities">Entity History</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <ActivityDashboard storeId={state.store.id} />
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <UserActivityLog storeId={state.store.id} />
        </TabsContent>

        <TabsContent value="entities" className="space-y-4">
          <EntityHistory storeId={state.store.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
