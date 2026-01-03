'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/lib/trpc';
import {
  Users,
  Building2,
  Shield,
  Activity,
  TrendingUp,
  Database,
  Server,
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export function WebsiteAdminDashboard() {
  const stats = [
    { label: 'Total Companies', value: '1', icon: Building2, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900' },
    { label: 'Total Users', value: '11', icon: Users, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900' },
    { label: 'Active Sessions', value: '5', icon: Activity, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900' },
    { label: 'System Health', value: '100%', icon: Server, color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-900' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
            Website Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">Platform-level administration and monitoring</p>
        </div>
        <Link href="/website-admin">
          <Button>
            <Shield className="mr-2 h-4 w-4" />
            Platform Admin Panel
          </Button>
        </Link>
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
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bg}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Company Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/website-admin">
              <Button variant="outline" className="w-full justify-start">
                <Building2 className="mr-2 h-4 w-4" />
                View All Companies
              </Button>
            </Link>
            <Link href="/website-admin">
              <Button variant="outline" className="w-full justify-start">
                <Users className="mr-2 h-4 w-4" />
                Manage Company Admins
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              System Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <Database className="mr-2 h-4 w-4" />
              Database Backup
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Server className="mr-2 h-4 w-4" />
              System Settings
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">Version</p>
              <p className="font-semibold text-foreground">v1.0.0</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">Environment</p>
              <p className="font-semibold text-foreground">Development</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">Database</p>
              <p className="font-semibold text-foreground">PostgreSQL</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">Uptime</p>
              <p className="font-semibold text-foreground">99.9%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
