import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { RestaurantProvider } from '@/context/RestaurantContext';
import { DashboardShell } from '@/components/layout/DashboardShell';

export const metadata: Metadata = {
  title: 'Karaikudi Mess – Hotel Billing & Management System',
  description: 'Fast, professional restaurant POS dashboard, order management, thermal billing and analytics for Karaikudi Mess.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <RestaurantProvider>
            <DashboardShell>{children}</DashboardShell>
          </RestaurantProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
