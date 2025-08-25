'use client';

import { useAuth } from '@/contexts/AuthContext';
import { UserActivityLog } from '@/components/audit/UserActivityLog';

export default function UserActivityPage() {
  const { state } = useAuth();

  if (state.isLoading) {
    return <div>Loading...</div>;
  }

  if (!state.isAuthenticated || !state.user || !state.store) {
    return <div>Please log in to access user activity tracking.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Activity Tracking</h1>
        <p className="text-muted-foreground">
          Monitor individual user activities and actions across the system
        </p>
      </div>

      <UserActivityLog storeId={state.store.id} />
    </div>
  );
}
