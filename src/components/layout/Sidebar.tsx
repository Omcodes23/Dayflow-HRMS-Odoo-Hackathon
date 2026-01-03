'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/hooks/useAuth';
import {
  LayoutDashboard,
  User,
  Clock,
  CalendarDays,
  IndianRupee,
  Users,
  ClipboardCheck,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  X,
  Shield,
  Briefcase,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

// Navigation items for each role
const getNavItems = (role: string) => {
  // Common items for ALL users
  const commonItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/profile', label: 'My Profile', icon: User },
  ];

  // Employee-only items (basic employee features)
  const employeeItems = [
    { href: '/attendance', label: 'My Attendance', icon: Clock },
    { href: '/leaves', label: 'My Leaves', icon: CalendarDays },
    { href: '/payroll', label: 'My Payroll', icon: IndianRupee },
  ];

  // Admin items (HR, Company Admin, Website Admin)
  const adminItems = [
    { href: '/admin/employees', label: 'Employees', icon: Users },
    { href: '/admin/designations', label: 'Designations', icon: Briefcase },
    { href: '/admin/leaves', label: 'Leave Approvals', icon: ClipboardCheck },
    { href: '/admin/attendance', label: 'Attendance Report', icon: FileText },
    { href: '/admin/payroll', label: 'Payroll Management', icon: IndianRupee },
    { href: '/admin/reports', label: 'Reports', icon: BarChart3 },
  ];

  // Website Admin platform item
  const platformItems = [
    { href: '/website-admin', label: 'Platform Admin', icon: Shield },
  ];

  switch (role) {
    case 'WEBSITE_ADMIN':
      return {
        main: commonItems,
        admin: adminItems,
        platform: platformItems,
      };
    case 'COMPANY_ADMIN':
    case 'HR':
      return {
        main: commonItems,
        admin: adminItems,
        platform: [],
      };
    case 'MANAGER':
    case 'EMPLOYEE':
    default:
      return {
        main: [...commonItems, ...employeeItems],
        admin: [],
        platform: [],
      };
  }
};

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = getNavItems(user?.role || 'EMPLOYEE');
  
  const getDisplayRole = (role: string) => {
    switch (role) {
      case 'WEBSITE_ADMIN': return 'Website Admin';
      case 'COMPANY_ADMIN': return 'Company Admin';
      case 'HR': return 'HR Manager';
      case 'MANAGER': return 'Manager';
      case 'EMPLOYEE': return 'Employee';
      default: return role;
    }
  };

  const renderNavLink = (item: { href: string; label: string; icon: any }, colorClass: string = 'blue') => {
    const Icon = item.icon;
    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
    const activeClass = colorClass === 'purple' 
      ? 'bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 font-medium'
      : 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-medium';
    
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={() => onClose?.()}
        className={cn(
          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
          isActive ? activeClass : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        )}
        title={collapsed ? item.label : undefined}
      >
        <Icon className="h-5 w-5 flex-shrink-0" />
        {!collapsed && <span>{item.label}</span>}
      </Link>
    );
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen border-r bg-background transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b px-4">
          {!collapsed && (
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold">
                D
              </div>
              <span className="text-xl font-bold text-foreground">Dayflow</span>
            </Link>
          )}
          {/* Desktop collapse button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="h-8 w-8 hidden lg:flex"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
          {/* Mobile close button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 lg:hidden"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-2 overflow-y-auto">
          {/* Main Menu */}
          {!collapsed && (
            <p className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase">Menu</p>
          )}
          {navItems.main.map((item) => renderNavLink(item))}

          {/* Admin Section */}
          {navItems.admin.length > 0 && (
            <>
              {!collapsed && (
                <p className="px-3 py-2 mt-4 text-xs font-semibold text-muted-foreground uppercase">
                  Administration
                </p>
              )}
              {navItems.admin.map((item) => renderNavLink(item))}
            </>
          )}

          {/* Platform Section (Website Admin only) */}
          {navItems.platform.length > 0 && (
            <>
              {!collapsed && (
                <p className="px-3 py-2 mt-4 text-xs font-semibold text-muted-foreground uppercase">
                  Platform
                </p>
              )}
              {navItems.platform.map((item) => renderNavLink(item, 'purple'))}
            </>
          )}
        </nav>

        {/* User info */}
        {!collapsed && user && (
          <div className="border-t p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 font-medium">
                {user.employee?.firstName?.[0]}
                {user.employee?.lastName?.[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {user.employee?.firstName} {user.employee?.lastName}
                </p>
                <p className="text-xs text-muted-foreground truncate">{getDisplayRole(user.role)}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
