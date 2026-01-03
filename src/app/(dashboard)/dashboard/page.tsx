'use client';

import { trpc } from '@/lib/trpc';
import { useAuthStore } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Clock,
  Calendar,
  DollarSign,
  Users,
  TrendingUp,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  color = 'blue',
}: {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ElementType;
  trend?: { value: number; label: string };
  color?: 'blue' | 'green' | 'yellow' | 'purple';
}) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
            {trend && (
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600">+{trend.value}%</span>
                <span className="text-sm text-gray-500">{trend.label}</span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-xl ${colors[color]}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function LeaveBalanceCard({ balance }: { balance: { leaveType: string; remaining: number; totalAllocated: number } }) {
  const percentage = (balance.remaining / balance.totalAllocated) * 100;
  const colorClass =
    percentage > 50 ? 'bg-green-500' : percentage > 25 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="flex items-center justify-between py-3 border-b last:border-0">
      <div>
        <p className="font-medium text-gray-900">{balance.leaveType}</p>
        <p className="text-sm text-gray-500">
          {balance.remaining} of {balance.totalAllocated} days left
        </p>
      </div>
      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full ${colorClass}`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'HR';

  const { data: employeeStats, isLoading: loadingEmployee } =
    trpc.dashboard.getEmployeeStats.useQuery();

  const { data: adminStats, isLoading: loadingAdmin } = trpc.dashboard.getAdminStats.useQuery(
    undefined,
    { enabled: isAdmin }
  );

  const { data: todayAttendance } = trpc.attendance.getToday.useQuery();

  const checkInMutation = trpc.attendance.checkIn.useMutation();
  const checkOutMutation = trpc.attendance.checkOut.useMutation();

  const handleCheckIn = () => {
    checkInMutation.mutate(
      { location: 'Office' },
      {
        onSuccess: () => {
          window.location.reload();
        },
      }
    );
  };

  const handleCheckOut = () => {
    checkOutMutation.mutate(
      {},
      {
        onSuccess: () => {
          window.location.reload();
        },
      }
    );
  };

  if (loadingEmployee) {
    return (
      <div className="space-y-6">
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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">Overview of your HR activities</p>
        </div>
        <div className="flex items-center gap-2">
          {!todayAttendance?.checkIn ? (
            <Button onClick={handleCheckIn} disabled={checkInMutation.isPending} className="bg-green-600 hover:bg-green-700">
              <Clock className="mr-2 h-4 w-4" />
              Check In
            </Button>
          ) : !todayAttendance?.checkOut ? (
            <Button onClick={handleCheckOut} disabled={checkOutMutation.isPending} variant="destructive">
              <Clock className="mr-2 h-4 w-4" />
              Check Out
            </Button>
          ) : (
            <Badge variant="secondary" className="px-4 py-2">
              <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
              Day Complete
            </Badge>
          )}
        </div>
      </div>

      {/* Today's Status */}
      {todayAttendance && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold opacity-90">Today&apos;s Attendance</h3>
                  <p className="text-3xl font-bold mt-1">
                    {todayAttendance.checkIn
                      ? format(new Date(todayAttendance.checkIn), 'hh:mm a')
                      : '--:--'}
                    {' - '}
                    {todayAttendance.checkOut
                      ? format(new Date(todayAttendance.checkOut), 'hh:mm a')
                      : '--:--'}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-sm opacity-75">Work Hours</p>
                    <p className="text-2xl font-bold">
                      {todayAttendance.workHours?.toFixed(1) || '0'} hrs
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm opacity-75">Status</p>
                    <Badge variant="secondary" className="mt-1">
                      {todayAttendance.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <StatCard
            title="Present Days"
            value={employeeStats?.attendance.presentDays || 0}
            description="This month"
            icon={CheckCircle2}
            color="green"
          />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <StatCard
            title="Work Hours"
            value={`${employeeStats?.attendance.totalWorkHours || 0} hrs`}
            description="This month"
            icon={Clock}
            color="blue"
          />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <StatCard
            title="Pending Leaves"
            value={employeeStats?.leaves.pendingRequests || 0}
            description="Awaiting approval"
            icon={AlertCircle}
            color="yellow"
          />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <StatCard
            title="Notifications"
            value={employeeStats?.notifications.length || 0}
            description="Unread"
            icon={Calendar}
            color="purple"
          />
        </motion.div>
      </div>

      {/* Admin Stats */}
      {isAdmin && adminStats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Employees"
            value={adminStats.totalEmployees}
            icon={Users}
            color="blue"
          />
          <StatCard
            title="Today's Attendance"
            value={adminStats.todayAttendance}
            description={`${Math.round((adminStats.todayAttendance / adminStats.totalEmployees) * 100)}% present`}
            icon={CheckCircle2}
            color="green"
          />
          <StatCard
            title="Pending Approvals"
            value={adminStats.pendingLeaves}
            icon={AlertCircle}
            color="yellow"
          />
          <StatCard
            title="Monthly Payroll"
            value={`$${adminStats.payroll.totalGross.toLocaleString()}`}
            description={`${adminStats.payroll.employeesCount} employees`}
            icon={DollarSign}
            color="purple"
          />
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Leave Balance */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg">Leave Balance</CardTitle>
              <CardDescription>Your available leave days</CardDescription>
            </div>
            <Link href="/leaves">
              <Button variant="ghost" size="sm">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {employeeStats?.leaves.balances.map((balance) => (
              <LeaveBalanceCard key={balance.leaveType} balance={balance} />
            ))}
          </CardContent>
        </Card>

        {/* Upcoming Leaves */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg">Upcoming Leaves</CardTitle>
              <CardDescription>Your approved leaves</CardDescription>
            </div>
            <Link href="/leaves/history">
              <Button variant="ghost" size="sm">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {employeeStats?.leaves.upcoming.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                <p>No upcoming leaves</p>
              </div>
            ) : (
              <div className="space-y-3">
                {employeeStats?.leaves.upcoming.map((leave) => (
                  <div
                    key={leave.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{leave.leaveType}</p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(leave.startDate), 'MMM d')} -{' '}
                        {format(new Date(leave.endDate), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <Badge variant="secondary">{leave.daysRequested} days</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
            <CardDescription>Frequently used features</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/attendance">
                <Button variant="outline" className="w-full justify-start h-auto py-4">
                  <Clock className="mr-2 h-5 w-5 text-blue-600" />
                  <div className="text-left">
                    <p className="font-medium">Attendance</p>
                    <p className="text-xs text-gray-500">View records</p>
                  </div>
                </Button>
              </Link>
              <Link href="/leaves">
                <Button variant="outline" className="w-full justify-start h-auto py-4">
                  <Calendar className="mr-2 h-5 w-5 text-green-600" />
                  <div className="text-left">
                    <p className="font-medium">Apply Leave</p>
                    <p className="text-xs text-gray-500">Request time off</p>
                  </div>
                </Button>
              </Link>
              <Link href="/payroll">
                <Button variant="outline" className="w-full justify-start h-auto py-4">
                  <DollarSign className="mr-2 h-5 w-5 text-purple-600" />
                  <div className="text-left">
                    <p className="font-medium">Payroll</p>
                    <p className="text-xs text-gray-500">View salary</p>
                  </div>
                </Button>
              </Link>
              <Link href="/profile">
                <Button variant="outline" className="w-full justify-start h-auto py-4">
                  <Users className="mr-2 h-5 w-5 text-orange-600" />
                  <div className="text-left">
                    <p className="font-medium">Profile</p>
                    <p className="text-xs text-gray-500">Edit info</p>
                  </div>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent Notifications */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg">Recent Notifications</CardTitle>
              <CardDescription>Stay updated</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {employeeStats?.notifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle2 className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                <p>All caught up!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {employeeStats?.notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="p-2 bg-blue-100 rounded-full">
                      <AlertCircle className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm">{notif.title}</p>
                      <p className="text-xs text-gray-500 truncate">{notif.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
