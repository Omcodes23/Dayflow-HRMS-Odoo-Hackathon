'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Clock, CheckCircle, XCircle, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const statusColors: Record<string, string> = {
  PRESENT: 'bg-green-100 text-green-700',
  ABSENT: 'bg-red-100 text-red-700',
  HALF_DAY: 'bg-yellow-100 text-yellow-700',
  LEAVE: 'bg-blue-100 text-blue-700',
  HOLIDAY: 'bg-purple-100 text-purple-700',
  WEEKEND: 'bg-gray-100 text-gray-700',
};

export default function AttendancePage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const { data: todayAttendance, refetch: refetchToday } = trpc.attendance.getToday.useQuery();
  const { data: attendanceData, isLoading } = trpc.attendance.getMyAttendance.useQuery({
    month,
    year,
  });

  const checkInMutation = trpc.attendance.checkIn.useMutation({
    onSuccess: () => {
      toast.success('Checked in successfully!');
      refetchToday();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const checkOutMutation = trpc.attendance.checkOut.useMutation({
    onSuccess: () => {
      toast.success('Checked out successfully!');
      refetchToday();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
          <p className="text-gray-500">Track your daily attendance</p>
        </div>
        <div className="flex items-center gap-2">
          {!todayAttendance?.checkIn ? (
            <Button
              onClick={() => checkInMutation.mutate({ location: 'Office' })}
              disabled={checkInMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              <Clock className="mr-2 h-4 w-4" />
              Check In
            </Button>
          ) : !todayAttendance?.checkOut ? (
            <Button
              onClick={() => checkOutMutation.mutate({})}
              disabled={checkOutMutation.isPending}
              variant="destructive"
            >
              <Clock className="mr-2 h-4 w-4" />
              Check Out
            </Button>
          ) : (
            <Badge variant="secondary" className="px-4 py-2">
              <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
              Day Complete
            </Badge>
          )}
        </div>
      </div>

      {/* Today's Card */}
      <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold opacity-90">Today&apos;s Attendance</h3>
              <p className="text-sm opacity-75">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-sm opacity-75">Check In</p>
                <p className="text-xl font-bold">
                  {todayAttendance?.checkIn
                    ? format(new Date(todayAttendance.checkIn), 'hh:mm a')
                    : '--:--'}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm opacity-75">Check Out</p>
                <p className="text-xl font-bold">
                  {todayAttendance?.checkOut
                    ? format(new Date(todayAttendance.checkOut), 'hh:mm a')
                    : '--:--'}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm opacity-75">Work Hours</p>
                <p className="text-xl font-bold">
                  {todayAttendance?.workHours?.toFixed(1) || '0'} hrs
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Present</p>
                <p className="text-2xl font-bold">{attendanceData?.summary.presentDays || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Absent</p>
                <p className="text-2xl font-bold">{attendanceData?.summary.absentDays || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Leave Days</p>
                <p className="text-2xl font-bold">{attendanceData?.summary.leaveDays || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Hours</p>
                <p className="text-2xl font-bold">
                  {attendanceData?.summary.totalWorkHours?.toFixed(0) || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Attendance History</CardTitle>
            <CardDescription>View your attendance records</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={month.toString()} onValueChange={(v) => setMonth(parseInt(v))}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map((m, i) => (
                  <SelectItem key={i} value={(i + 1).toString()}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={year.toString()} onValueChange={(v) => setYear(parseInt(v))}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[2024, 2025, 2026].map((y) => (
                  <SelectItem key={y} value={y.toString()}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : attendanceData?.attendances.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No attendance records for this month</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Check In</TableHead>
                  <TableHead>Check Out</TableHead>
                  <TableHead>Work Hours</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendanceData?.attendances.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">
                      {format(new Date(record.date), 'EEE, MMM d')}
                    </TableCell>
                    <TableCell>
                      {record.checkIn ? format(new Date(record.checkIn), 'hh:mm a') : '-'}
                    </TableCell>
                    <TableCell>
                      {record.checkOut ? format(new Date(record.checkOut), 'hh:mm a') : '-'}
                    </TableCell>
                    <TableCell>{record.workHours?.toFixed(1) || '-'} hrs</TableCell>
                    <TableCell>
                      <Badge className={statusColors[record.status]}>{record.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
