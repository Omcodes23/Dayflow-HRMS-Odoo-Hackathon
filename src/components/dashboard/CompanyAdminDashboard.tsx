'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { trpc } from '@/lib/trpc';
import {
  Users,
  Clock,
  Calendar,
  BarChart3,
  TrendingUp,
  UserCheck,
  UserX,
  Building2,
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export function CompanyAdminDashboard() {
  const { data: adminStats, isLoading } = trpc.dashboard.getAdminStats.useQuery();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: 'Total Employees',
      value: adminStats?.totalEmployees || 0,
      icon: Users,
      color: 'blue' as const,
      link: '/admin/employees',
    },
    {
      label: 'Present Today',
      value: adminStats?.todayAttendance || 0,
      icon: UserCheck,
      color: 'green' as const,
      link: '/admin/attendance',
    },
    {
      label: 'Pending Leaves',
      value: adminStats?.pendingLeaves || 0,
      icon: Calendar,
      color: 'yellow' as const,
      link: '/admin/leaves',
    },
    {
      label: 'Departments',
      value: adminStats?.departments?.length || 0,
      icon: Building2,
      color: 'purple' as const,
      link: '/admin/reports',
    },
  ];

  const colors = {
    blue: { bg: 'bg-blue-50 dark:bg-blue-950', text: 'text-blue-600 dark:text-blue-400' },
    green: { bg: 'bg-green-50 dark:bg-green-950', text: 'text-green-600 dark:text-green-400' },
    yellow: { bg: 'bg-yellow-50 dark:bg-yellow-950', text: 'text-yellow-600 dark:text-yellow-400' },
    purple: { bg: 'bg-purple-50 dark:bg-purple-950', text: 'text-purple-600 dark:text-purple-400' },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Company Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">Manage your organization and employees</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link href={stat.link}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-full ${colors[stat.color].bg}`}>
                      <stat.icon className={`h-6 w-6 ${colors[stat.color].text}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5" />
              Employee Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/admin/employees">
              <Button variant="outline" className="w-full justify-start">
                <Users className="mr-2 h-4 w-4" />
                Manage Employees
              </Button>
            </Link>
            <Link href="/admin/employees">
              <Button variant="outline" className="w-full justify-start">
                <UserCheck className="mr-2 h-4 w-4" />
                Add New Employee
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5" />
              Attendance & Leaves
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/admin/attendance">
              <Button variant="outline" className="w-full justify-start">
                <Clock className="mr-2 h-4 w-4" />
                View Attendance
              </Button>
            </Link>
            <Link href="/admin/leaves">
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="mr-2 h-4 w-4" />
                Leave Requests
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="h-5 w-5" />
              Reports & Analytics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/admin/reports">
              <Button variant="outline" className="w-full justify-start">
                <BarChart3 className="mr-2 h-4 w-4" />
                View Reports
              </Button>
            </Link>
            <Link href="/admin/payroll">
              <Button variant="outline" className="w-full justify-start">
                <TrendingUp className="mr-2 h-4 w-4" />
                Payroll Management
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
