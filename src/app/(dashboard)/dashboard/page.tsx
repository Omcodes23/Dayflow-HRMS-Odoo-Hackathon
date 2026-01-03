'use client';

import { useAuthStore } from '@/hooks/useAuth';
import { WebsiteAdminDashboard } from '@/components/dashboard/WebsiteAdminDashboard';
import { CompanyAdminDashboard } from '@/components/dashboard/CompanyAdminDashboard';
import { HRDashboard } from '@/components/dashboard/HRDashboard';
import { EmployeeDashboard } from '@/components/dashboard/EmployeeDashboard';

export default function DashboardPage() {
  const { user } = useAuthStore();

  // Render role-specific dashboard
  if (user?.role === 'WEBSITE_ADMIN') {
    return <WebsiteAdminDashboard />;
  }

  if (user?.role === 'COMPANY_ADMIN') {
    return <CompanyAdminDashboard />;
  }

  if (user?.role === 'HR') {
    return <HRDashboard />;
  }

  // Default to Employee Dashboard
  return <EmployeeDashboard />;
}
