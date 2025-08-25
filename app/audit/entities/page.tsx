'use client';

import { useAuth } from '@/contexts/AuthContext';
import { EntityHistory } from '@/components/audit/EntityHistory';

export default function EntityHistoryPage() {
  const { state } = useAuth();

  if (state.isLoading) {
    return <div>Loading...</div>;
  }

  if (!state.isAuthenticated || !state.user || !state.store) {
    return <div>Please log in to access entity history.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Entity History</h1>
        <p className="text-muted-foreground">
          View detailed change history for specific entities in the system
        </p>
      </div>

      <EntityHistory storeId={state.store.id} />
    </div>
  );
}
