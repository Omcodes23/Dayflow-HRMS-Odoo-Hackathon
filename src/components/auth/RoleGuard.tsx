'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldX, Home, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

type UserRole = 'EMPLOYEE' | 'MANAGER' | 'HR' | 'COMPANY_ADMIN' | 'WEBSITE_ADMIN';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallback?: React.ReactNode;
}

// Define route role requirements
export const routeRoles: Record<string, UserRole[]> = {
  // Employee routes - all roles
  '/dashboard': ['EMPLOYEE', 'MANAGER', 'HR', 'COMPANY_ADMIN', 'WEBSITE_ADMIN'],
  '/profile': ['EMPLOYEE', 'MANAGER', 'HR', 'COMPANY_ADMIN', 'WEBSITE_ADMIN'],
  '/attendance': ['EMPLOYEE', 'MANAGER', 'HR', 'COMPANY_ADMIN', 'WEBSITE_ADMIN'],
  '/leaves': ['EMPLOYEE', 'MANAGER', 'HR', 'COMPANY_ADMIN', 'WEBSITE_ADMIN'],
  '/payroll': ['EMPLOYEE', 'MANAGER', 'HR', 'COMPANY_ADMIN', 'WEBSITE_ADMIN'],
  '/settings': ['EMPLOYEE', 'MANAGER', 'HR', 'COMPANY_ADMIN', 'WEBSITE_ADMIN'],
  
  // Admin and HR routes
  '/admin/employees': ['HR', 'COMPANY_ADMIN', 'WEBSITE_ADMIN'],
  '/admin/leaves': ['HR', 'COMPANY_ADMIN', 'WEBSITE_ADMIN'],
  '/admin/attendance': ['HR', 'COMPANY_ADMIN', 'WEBSITE_ADMIN'],
  '/admin/payroll': ['HR', 'COMPANY_ADMIN', 'WEBSITE_ADMIN'],
  '/admin/reports': ['HR', 'COMPANY_ADMIN', 'WEBSITE_ADMIN'],
  
  // Website Admin only routes
  '/website-admin': ['WEBSITE_ADMIN'],
};

export function RoleGuard({ children, allowedRoles, fallback }: RoleGuardProps) {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setAuthorized(false);
      return;
    }

    const userRole = user?.role as UserRole;
    const hasAccess = allowedRoles.includes(userRole);
    setAuthorized(hasAccess);
  }, [user, isAuthenticated, allowedRoles]);

  // Loading state
  if (authorized === null) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Not authorized
  if (!authorized) {
    if (fallback) return <>{fallback}</>;
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-center min-h-[60vh] p-4"
      >
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mb-4">
              <ShieldX className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle className="text-2xl">Access Denied</CardTitle>
            <CardDescription>
              You don&apos;t have permission to access this page. This area is restricted to{' '}
              {allowedRoles.join(' or ')} roles.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Button onClick={() => router.push('/dashboard')} className="w-full">
              <Home className="mr-2 h-4 w-4" />
              Go to Dashboard
            </Button>
            <Button variant="outline" onClick={() => router.back()} className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return <>{children}</>;
}

// Hook to check user role
export function useRole() {
  const { user } = useAuthStore();
  const userRole = user?.role as UserRole;

  return {
    role: userRole,
    isWebsiteAdmin: userRole === 'WEBSITE_ADMIN',
    isCompanyAdmin: userRole === 'COMPANY_ADMIN',
    isHR: userRole === 'HR',
    isManager: userRole === 'MANAGER',
    isEmployee: userRole === 'EMPLOYEE',
    hasAdminAccess: userRole === 'WEBSITE_ADMIN' || userRole === 'COMPANY_ADMIN' || userRole === 'HR',
    canManageEmployees: userRole === 'WEBSITE_ADMIN' || userRole === 'COMPANY_ADMIN' || userRole === 'HR',
    canApproveLeaves: userRole === 'WEBSITE_ADMIN' || userRole === 'COMPANY_ADMIN' || userRole === 'HR' || userRole === 'MANAGER',
    canViewReports: userRole === 'WEBSITE_ADMIN' || userRole === 'COMPANY_ADMIN' || userRole === 'HR',
    canManagePayroll: userRole === 'WEBSITE_ADMIN' || userRole === 'COMPANY_ADMIN' || userRole === 'HR',
  };
}

// HOC for protecting pages
export function withRoleGuard<P extends object>(
  Component: React.ComponentType<P>,
  allowedRoles: UserRole[]
) {
  return function ProtectedComponent(props: P) {
    return (
      <RoleGuard allowedRoles={allowedRoles}>
        <Component {...props} />
      </RoleGuard>
    );
  };
}
