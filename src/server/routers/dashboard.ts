import { router, adminProcedure, protectedProcedure } from '../trpc';
import { z } from 'zod';
import { startOfMonth, endOfMonth, subMonths } from 'date-fns';

export const dashboardRouter = router({
  // Get employee dashboard stats
  getEmployeeStats: protectedProcedure.query(async ({ ctx }) => {
    const now = new Date();
    const currentMonth = startOfMonth(now);
    const currentYear = now.getFullYear();

    // Get attendance for this month
    const attendances = await ctx.prisma.attendance.findMany({
      where: {
        employeeId: ctx.user.id,
        date: {
          gte: currentMonth,
          lte: endOfMonth(now),
        },
      },
    });

    // Get leave balance
    const leaveBalances = await ctx.prisma.leaveBalance.findMany({
      where: {
        employeeId: ctx.user.id,
        year: currentYear,
      },
    });

    // Get pending leave requests
    const pendingLeaves = await ctx.prisma.leaveRequest.count({
      where: {
        employeeId: ctx.user.id,
        status: 'PENDING',
      },
    });

    // Get upcoming leaves
    const upcomingLeaves = await ctx.prisma.leaveRequest.findMany({
      where: {
        employeeId: ctx.user.id,
        status: 'APPROVED',
        startDate: { gte: now },
      },
      take: 3,
      orderBy: { startDate: 'asc' },
    });

    // Get recent notifications
    const notifications = await ctx.prisma.notification.findMany({
      where: {
        userId: ctx.user.id,
        isRead: false,
      },
      take: 5,
      orderBy: { createdAt: 'desc' },
    });

    const presentDays = attendances.filter((a: { status: string }) => a.status === 'PRESENT').length;
    const totalWorkHours = attendances.reduce((sum: number, a: { workHours?: number | null }) => sum + (a.workHours || 0), 0);

    return {
      attendance: {
        presentDays,
        totalWorkHours: Math.round(totalWorkHours * 100) / 100,
        thisMonth: attendances.length,
      },
      leaves: {
        balances: leaveBalances,
        pendingRequests: pendingLeaves,
        upcoming: upcomingLeaves,
      },
      notifications,
    };
  }),

  // Get admin dashboard stats
  getAdminStats: adminProcedure.query(async ({ ctx }) => {
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Total employees
    const totalEmployees = await ctx.prisma.employee.count({
      where: { employmentStatus: 'ACTIVE' },
    });

    // Today's attendance
    const todayAttendance = await ctx.prisma.attendance.count({
      where: {
        date: today,
        status: 'PRESENT',
      },
    });

    // Pending leave requests
    const pendingLeaves = await ctx.prisma.leaveRequest.count({
      where: { status: 'PENDING' },
    });

    // Department-wise employee count
    const departmentStats = await ctx.prisma.department.findMany({
      include: {
        _count: {
          select: { employees: true },
        },
      },
    });

    // Monthly attendance trend (last 6 months)
    const attendanceTrend = [];
    for (let i = 5; i >= 0; i--) {
      const month = subMonths(now, i);
      const start = startOfMonth(month);
      const end = endOfMonth(month);

      const count = await ctx.prisma.attendance.count({
        where: {
          date: { gte: start, lte: end },
          status: 'PRESENT',
        },
      });

      attendanceTrend.push({
        month: start.toISOString(),
        count,
      });
    }

    // Leave type distribution
    const currentYear = now.getFullYear();
    const leavesByType = await ctx.prisma.leaveRequest.groupBy({
      by: ['leaveType'],
      _count: true,
      where: {
        status: 'APPROVED',
        startDate: { gte: new Date(currentYear, 0, 1) },
      },
    });

    // Payroll summary
    const payrollSummary = await ctx.prisma.salaryStructure.aggregate({
      where: { effectiveTo: null },
      _sum: {
        basicSalary: true,
        hra: true,
        transportAllowance: true,
        medicalAllowance: true,
        specialAllowance: true,
        providentFund: true,
        professionalTax: true,
        incomeTax: true,
      },
      _count: true,
    });

    return {
      totalEmployees,
      todayAttendance,
      pendingLeaves,
      departments: departmentStats.map((d: { departmentName: string; _count: { employees: number } }) => ({
        name: d.departmentName,
        count: d._count.employees,
      })),
      attendanceTrend,
      leavesByType: leavesByType.map((l: { leaveType: string; _count: number }) => ({
        type: l.leaveType,
        count: l._count,
      })),
      payroll: {
        totalGross:
          (payrollSummary._sum.basicSalary || 0) +
          (payrollSummary._sum.hra || 0) +
          (payrollSummary._sum.transportAllowance || 0) +
          (payrollSummary._sum.medicalAllowance || 0) +
          (payrollSummary._sum.specialAllowance || 0),
        totalDeductions:
          (payrollSummary._sum.providentFund || 0) +
          (payrollSummary._sum.professionalTax || 0) +
          (payrollSummary._sum.incomeTax || 0),
        employeesCount: payrollSummary._count,
      },
    };
  }),
});
