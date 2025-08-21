import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login - Retail Management System',
  description: 'Login to your retail management system',
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {children}
    </div>
  );
}
