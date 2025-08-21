'use client';

import { AppProvider } from '@/contexts/AppContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { DashboardWrapper } from '@/components/layout/DashboardWrapper';
import { WebSocketClient } from '@/components/WebSocketClient';

interface DashboardLayoutProps {
  children: React.ReactNode;
  storeId?: string;
}

export default function DashboardLayout({ children, storeId }: DashboardLayoutProps) {
  return (
    <AuthProvider>
      <AppProvider>
        <DashboardWrapper>
          {children}
          {storeId && <WebSocketClient storeId={storeId} />}
        </DashboardWrapper>
      </AppProvider>
    </AuthProvider>
  );
}
