'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  Clock,
  TrendingUp,
  BarChart3,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Download,
} from 'lucide-react';
import { format, subMonths } from 'date-fns';
import { motion } from 'framer-motion';

export default function AttendanceReportPage() {
  const [selectedMonth, setSelectedMonth] = useState(() => format(new Date(), 'yyyy-MM'));
  
  const [year, month] = selectedMonth.split('-').map(Number);

  const { data: reportData, isLoading } = trpc.attendance.getMyAttendance.useQuery({
    month,
    year,
  });

  const months = Array.from({ length: 6 }, (_, i) => {
    const date = subMonths(new Date(), i);
    return {
      value: format(date, 'yyyy-MM'),
      label: format(date, 'MMMM yyyy'),
    };
  });

  const summary = reportData?.summary || {
    totalDays: 0,
    presentDays: 0,
    absentDays: 0,
    halfDays: 0,
    leaveDays: 0,
    totalWorkHours: 0,
    totalOvertimeHours: 0,
  };

  // Compute derived stats
  const stats = {
    ...summary,
    attendancePercentage: summary.totalDays > 0 
      ? Math.round((summary.presentDays / summary.totalDays) * 100) 
      : 0,
    averageWorkHours: summary.presentDays > 0 
      ? Math.round((summary.totalWorkHours / summary.presentDays) * 10) / 10 
      : 0,
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <motion.div
      className="p-6 space-y-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Attendance Report</h1>
          <p className="text-muted-foreground">Your attendance analytics and summary</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-48">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month.value} value={month.value}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </motion.div>

      {/* Summary Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 font-medium">Present Days</p>
                <h3 className="text-3xl font-bold text-green-800 mt-1">{stats.presentDays}</h3>
              </div>
              <div className="h-12 w-12 bg-green-200 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-700" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-700">
                {stats.attendancePercentage.toFixed(1)}% attendance rate
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-700 font-medium">Absent Days</p>
                <h3 className="text-3xl font-bold text-red-800 mt-1">{stats.absentDays}</h3>
              </div>
              <div className="h-12 w-12 bg-red-200 rounded-xl flex items-center justify-center">
                <XCircle className="h-6 w-6 text-red-700" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-700">
                {stats.halfDays} half days included
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 font-medium">Total Hours</p>
                <h3 className="text-3xl font-bold text-blue-800 mt-1">
                  {stats.totalWorkHours.toFixed(1)}
                </h3>
              </div>
              <div className="h-12 w-12 bg-blue-200 rounded-xl flex items-center justify-center">
                <Clock className="h-6 w-6 text-blue-700" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-blue-700">
                {stats.averageWorkHours.toFixed(1)}h avg per day
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700 font-medium">Leave Days</p>
                <h3 className="text-3xl font-bold text-purple-800 mt-1">{stats.leaveDays}</h3>
              </div>
              <div className="h-12 w-12 bg-purple-200 rounded-xl flex items-center justify-center">
                <Calendar className="h-6 w-6 text-purple-700" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              <span className="text-sm text-purple-700">
                {stats.totalOvertimeHours.toFixed(1)}h overtime
              </span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Detailed Records */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle>Daily Attendance Records</CardTitle>
            <CardDescription>
              Detailed breakdown of your attendance for {format(new Date(selectedMonth + '-01'), 'MMMM yyyy')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {reportData?.attendances && reportData.attendances.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Date</th>
                      <th className="text-left py-3 px-4 font-medium">Status</th>
                      <th className="text-left py-3 px-4 font-medium">Check In</th>
                      <th className="text-left py-3 px-4 font-medium">Check Out</th>
                      <th className="text-left py-3 px-4 font-medium">Work Hours</th>
                      <th className="text-left py-3 px-4 font-medium">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.attendances.map((record: any, index: number) => (
                      <motion.tr
                        key={record.id}
                        className="border-b hover:bg-muted/50 transition-colors"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <td className="py-3 px-4 font-medium">
                          {format(new Date(record.date), 'EEE, MMM d')}
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={
                              record.status === 'PRESENT'
                                ? 'default'
                                : record.status === 'ABSENT'
                                ? 'destructive'
                                : record.status === 'LEAVE'
                                ? 'secondary'
                                : 'outline'
                            }
                            className={
                              record.status === 'PRESENT'
                                ? 'bg-green-100 text-green-800'
                                : record.status === 'HALF_DAY'
                                ? 'bg-yellow-100 text-yellow-800'
                                : ''
                            }
                          >
                            {record.status.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {record.checkIn
                            ? format(new Date(record.checkIn), 'hh:mm a')
                            : '-'}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {record.checkOut
                            ? format(new Date(record.checkOut), 'hh:mm a')
                            : '-'}
                        </td>
                        <td className="py-3 px-4">
                          {record.workHours ? `${record.workHours.toFixed(1)}h` : '-'}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground text-sm">
                          {record.notes || '-'}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">No Records Found</h3>
                <p className="text-muted-foreground mt-1">
                  No attendance records for this period
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Performance Insights */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Performance Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Punctuality Score</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 transition-all duration-500"
                      style={{ width: `${Math.min(stats.attendancePercentage, 100)}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">
                    {stats.attendancePercentage.toFixed(0)}%
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Work Hours Target</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all duration-500"
                      style={{
                        width: `${Math.min((stats.totalWorkHours / (stats.presentDays * 8)) * 100, 100)}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium">
                    {((stats.totalWorkHours / Math.max(stats.presentDays * 8, 1)) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Overtime Hours</p>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-purple-500" />
                  <span className="text-lg font-bold">{stats.totalOvertimeHours.toFixed(1)}h</span>
                  <span className="text-sm text-muted-foreground">this month</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
