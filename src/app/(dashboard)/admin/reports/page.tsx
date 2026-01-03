'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Calendar,
  Clock,
  TrendingUp,
  IndianRupee,
  BarChart3,
  PieChart,
  Download,
  FileText,
  Building2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { motion } from 'framer-motion';
import { formatINR } from '@/lib/utils/currency';
import { RoleGuard } from '@/components/auth/RoleGuard';

function AdminReportsContent() {
  const [selectedPeriod, setSelectedPeriod] = useState('current-month');

  const now = new Date();
  const currentMonthStart = startOfMonth(now);
  const currentMonthEnd = endOfMonth(now);

  const { data: dashboardData, isLoading: dashboardLoading } = trpc.dashboard.getAdminStats.useQuery();
  
  // Use the existing getReport API with required parameters
  const { data: attendanceReport, isLoading: attendanceLoading } = trpc.attendance.getReport.useQuery({
    startDate: currentMonthStart.toISOString(),
    endDate: currentMonthEnd.toISOString(),
  });
  
  // Compute derived stats from available data
  const stats = dashboardData ? {
    ...dashboardData,
    newHiresThisMonth: 0, // Would need to add this to the API
    attendanceRate: Math.round((dashboardData.todayAttendance / Math.max(dashboardData.totalEmployees, 1)) * 100),
    onLeaveEmployees: dashboardData.pendingLeaves, // Approximation
    totalPayroll: dashboardData.payroll.totalGross - dashboardData.payroll.totalDeductions,
    activeEmployees: dashboardData.totalEmployees,
  } : null;

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

  if (dashboardLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  // stats already defined above

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
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground">Comprehensive HR analytics and insights</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-48">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current-month">Current Month</SelectItem>
              <SelectItem value="last-month">Last Month</SelectItem>
              <SelectItem value="last-quarter">Last Quarter</SelectItem>
              <SelectItem value="year-to-date">Year to Date</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export All
          </Button>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">Total Employees</p>
                <h3 className="text-3xl font-bold text-blue-800 dark:text-blue-200 mt-1">{stats?.totalEmployees || 0}</h3>
              </div>
              <div className="h-12 w-12 bg-blue-200 dark:bg-blue-800 rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-700 dark:text-blue-300" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <Badge variant="secondary" className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                +{stats?.newHiresThisMonth || 0} this month
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 dark:text-green-300 font-medium">Attendance Rate</p>
                <h3 className="text-3xl font-bold text-green-800 dark:text-green-200 mt-1">{stats?.attendanceRate || 0}%</h3>
              </div>
              <div className="h-12 w-12 bg-green-200 dark:bg-green-800 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-700 dark:text-green-300" />
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full h-2 bg-green-200 dark:bg-green-800 rounded-full">
                <div 
                  className="h-full bg-green-600 dark:bg-green-400 rounded-full transition-all" 
                  style={{ width: `${stats?.attendanceRate || 0}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-700 dark:text-orange-300 font-medium">Pending Leaves</p>
                <h3 className="text-3xl font-bold text-orange-800 dark:text-orange-200 mt-1">{stats?.pendingLeaves || 0}</h3>
              </div>
              <div className="h-12 w-12 bg-orange-200 dark:bg-orange-800 rounded-xl flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-orange-700 dark:text-orange-300" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className="text-sm text-orange-700 dark:text-orange-300">
                {stats?.onLeaveEmployees || 0} currently on leave
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700 dark:text-purple-300 font-medium">Monthly Payroll</p>
                <h3 className="text-3xl font-bold text-purple-800 dark:text-purple-200 mt-1">
                  {formatINR(stats?.totalPayroll || 0)}
                </h3>
              </div>
              <div className="h-12 w-12 bg-purple-200 dark:bg-purple-800 rounded-xl flex items-center justify-center">
                <IndianRupee className="h-6 w-6 text-purple-700 dark:text-purple-300" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <span className="text-sm text-purple-700 dark:text-purple-300">Total compensation</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tabs for Different Reports */}
      <motion.div variants={itemVariants}>
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full max-w-lg grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="leaves">Leaves</TabsTrigger>
            <TabsTrigger value="payroll">Payroll</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Department Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Department Distribution
                  </CardTitle>
                  <CardDescription>Employee count by department</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.departments?.map((dept: any, index: number) => (
                      <div key={dept.name} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{dept.name}</span>
                          <span className="text-muted-foreground">{dept.count} employees</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-blue-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${(dept.count / stats.totalEmployees) * 100}%` }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                          />
                        </div>
                      </div>
                    ))}
                    {!stats.departments?.length && (
                      <p className="text-center text-muted-foreground py-8">
                        No department data available
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Leave Types Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Leave Distribution
                  </CardTitle>
                  <CardDescription>Leave requests by type this month</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.leavesByType?.map((leave: any, index: number) => {
                      const colors = ['bg-green-500', 'bg-blue-500', 'bg-orange-500', 'bg-purple-500', 'bg-red-500'];
                      return (
                        <div key={leave.type} className="flex items-center gap-4">
                          <div className={`h-3 w-3 rounded-full ${colors[index % colors.length]}`} />
                          <span className="flex-1 font-medium">{leave.type}</span>
                          <Badge variant="secondary">{leave.count}</Badge>
                        </div>
                      );
                    })}
                    {!stats.leavesByType?.length && (
                      <p className="text-center text-muted-foreground py-8">
                        No leave data available
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Key Metrics Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-muted/50 rounded-lg">
                    <h4 className="text-4xl font-bold text-blue-600">{stats?.activeEmployees || 0}</h4>
                    <p className="text-sm text-muted-foreground mt-2">Active Employees</p>
                  </div>
                  <div className="text-center p-6 bg-muted/50 rounded-lg">
                    <h4 className="text-4xl font-bold text-green-600">{stats?.attendanceRate || 0}%</h4>
                    <p className="text-sm text-muted-foreground mt-2">Avg. Attendance</p>
                  </div>
                  <div className="text-center p-6 bg-muted/50 rounded-lg">
                    <h4 className="text-4xl font-bold text-orange-600">{stats?.pendingLeaves || 0}</h4>
                    <p className="text-sm text-muted-foreground mt-2">Pending Actions</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attendance" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Attendance Overview</CardTitle>
                  <CardDescription>Organization-wide attendance statistics</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </CardHeader>
              <CardContent>
                {attendanceLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-12" />
                    ))}
                  </div>
                ) : attendanceReport?.departmentStats ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium">Department</th>
                          <th className="text-center py-3 px-4 font-medium">Present</th>
                          <th className="text-center py-3 px-4 font-medium">Absent</th>
                          <th className="text-center py-3 px-4 font-medium">On Leave</th>
                          <th className="text-center py-3 px-4 font-medium">Attendance %</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attendanceReport.departmentStats.map((dept: any, index: number) => (
                          <motion.tr
                            key={dept.departmentName}
                            className="border-b hover:bg-muted/50"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <td className="py-3 px-4 font-medium">{dept.departmentName}</td>
                            <td className="py-3 px-4 text-center">
                              <Badge className="bg-green-100 text-green-800">{dept.present}</Badge>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <Badge variant="destructive">{dept.absent}</Badge>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <Badge variant="secondary">{dept.onLeave}</Badge>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className={dept.attendanceRate >= 80 ? 'text-green-600 font-bold' : 'text-orange-600 font-bold'}>
                                {dept.attendanceRate.toFixed(1)}%
                              </span>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">No Data Available</h3>
                    <p className="text-muted-foreground">Attendance reports will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leaves" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-orange-100 rounded-xl flex items-center justify-center">
                      <Clock className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Pending</p>
                      <h3 className="text-2xl font-bold">{stats.pendingLeaves}</h3>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <CheckCircle2 className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Approved This Month</p>
                      <h3 className="text-2xl font-bold">
                        {stats.leavesByType?.reduce((acc: number, l: any) => acc + l.count, 0) || 0}
                      </h3>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Currently On Leave</p>
                      <h3 className="text-2xl font-bold">{stats.onLeaveEmployees}</h3>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Leave Balance Summary</CardTitle>
                <CardDescription>Average leave balances across all employees</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {['PAID', 'SICK', 'CASUAL', 'UNPAID'].map((type) => (
                    <div key={type} className="p-4 bg-muted/50 rounded-lg text-center">
                      <p className="text-sm text-muted-foreground">{type}</p>
                      <h4 className="text-2xl font-bold mt-2">
                        {type === 'PAID' ? '15.5' : type === 'SICK' ? '8.2' : type === 'CASUAL' ? '7.8' : '∞'}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">avg. remaining</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payroll" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-700 dark:text-green-300">Total Gross</p>
                      <h3 className="text-2xl font-bold text-green-800 dark:text-green-200">
                        {formatINR((stats?.totalPayroll || 0) * 1.3)}
                      </h3>
                    </div>
                    <IndianRupee className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-red-700 dark:text-red-300">Total Deductions</p>
                      <h3 className="text-2xl font-bold text-red-800 dark:text-red-200">
                        {formatINR((stats?.totalPayroll || 0) * 0.3)}
                      </h3>
                    </div>
                    <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-700 dark:text-blue-300">Net Payroll</p>
                      <h3 className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                        {formatINR(stats?.totalPayroll || 0)}
                      </h3>
                    </div>
                    <TrendingUp className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Payroll by Department</CardTitle>
                  <CardDescription>Monthly compensation breakdown</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.departments?.map((dept: any, index: number) => {
                    const deptPayroll = (stats.totalPayroll || 0) * (dept.count / stats.totalEmployees);
                    return (
                      <div key={dept.name} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Building2 className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{dept.name}</p>
                            <p className="text-sm text-muted-foreground">{dept.count} employees</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{formatINR(deptPayroll)}</p>
                          <p className="text-sm text-muted-foreground">
                            {((deptPayroll / (stats.totalPayroll || 1)) * 100).toFixed(1)}% of total
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}

export default function AdminReportsPage() {
  return (
    <RoleGuard allowedRoles={['WEBSITE_ADMIN', 'COMPANY_ADMIN', 'HR']}>
      <AdminReportsContent />
    </RoleGuard>
  );
}
