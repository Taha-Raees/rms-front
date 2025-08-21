import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Login - Retail Management System',
  description: 'System manager login',
};

export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {children}
    </div>
  );
}
