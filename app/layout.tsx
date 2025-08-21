import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/contexts/AppContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { DashboardWrapper } from '@/components/layout/DashboardWrapper';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
  title: 'Retail Management System',
  description: 'Store-based retail management application for small shops in Pakistan',
    generator: 'v0.dev'
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <AppProvider>
            <DashboardWrapper>
              {children}
            </DashboardWrapper>
          </AppProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
