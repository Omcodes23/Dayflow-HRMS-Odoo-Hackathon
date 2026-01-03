'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { trpc } from '@/lib/trpc';
import {
  Clock,
  Calendar,
  IndianRupee,
  CheckCircle2,
  TrendingUp,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { formatINR } from '@/lib/utils/currency';

export function EmployeeDashboard() {
  const { data: employeeStats, isLoading } = trpc.dashboard.getEmployeeStats.useQuery();
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Dashboard</h1>
          <p className="text-muted-foreground mt-2">Track your work activities and performance</p>
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
                    <p className="text-2xl font-bold">{todayAttendance.workHours || '0'} hrs</p>
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Link href="/attendance">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Attendance</p>
                    <p className="text-2xl font-bold text-foreground mt-1">
                      {employeeStats?.attendance.thisMonth || 0}
                    </p>
                  </div>
                  <div className="p-3 rounded-full bg-blue-50 dark:bg-blue-950">
                    <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Link href="/leaves">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Leave Balance</p>
                    <p className="text-2xl font-bold text-foreground mt-1">
                      {employeeStats?.leaves.balances.reduce((sum: number, b: any) => sum + b.remaining, 0) || 0}
                    </p>
                  </div>
                  <div className="p-3 rounded-full bg-green-50 dark:bg-green-950">
                    <Calendar className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Link href="/leaves">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pending Requests</p>
                    <p className="text-2xl font-bold text-foreground mt-1">
                      {employeeStats?.leaves.pendingRequests || 0}
                    </p>
                  </div>
                  <div className="p-3 rounded-full bg-yellow-50 dark:bg-yellow-950">
                    <Calendar className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </motion.div>
      </div>

      {/* Leave Balance Cards */}
      {employeeStats?.leaves.balances && employeeStats.leaves.balances.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Leave Balances</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {employeeStats.leaves.balances.map((balance: any, index: number) => {
                const percentage = (balance.remaining / balance.totalAllocated) * 100;
                return (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground">{balance.leaveType}</span>
                      <span className="text-sm text-muted-foreground">
                        {balance.remaining} of {balance.totalAllocated} days
                      </span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5" />
              Leave Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/leaves">
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="mr-2 h-4 w-4" />
                Apply for Leave
              </Button>
            </Link>
            <Link href="/leaves/history">
              <Button variant="outline" className="w-full justify-start">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Leave History
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5" />
              Attendance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/attendance">
              <Button variant="outline" className="w-full justify-start">
                <Clock className="mr-2 h-4 w-4" />
                View Attendance
              </Button>
            </Link>
            <Link href="/attendance/report">
              <Button variant="outline" className="w-full justify-start">
                <TrendingUp className="mr-2 h-4 w-4" />
                Attendance Report
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5" />
              Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/profile">
              <Button variant="outline" className="w-full justify-start">
                <User className="mr-2 h-4 w-4" />
                View Profile
              </Button>
            </Link>
            <Link href="/payroll">
              <Button variant="outline" className="w-full justify-start">
                <IndianRupee className="mr-2 h-4 w-4" />
                Salary Details
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Leaves */}
      {employeeStats?.leaves.upcoming && employeeStats.leaves.upcoming.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Leaves</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {employeeStats.leaves.upcoming.map((leave: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">{leave.leaveType}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(leave.startDate), 'MMM dd')} - {format(new Date(leave.endDate), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <Badge>{leave.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
