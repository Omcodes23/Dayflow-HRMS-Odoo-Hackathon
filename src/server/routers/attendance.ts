import { TRPCError } from '@trpc/server';
import { router, protectedProcedure, adminProcedure } from '../trpc';
import { checkInSchema, checkOutSchema } from '@/lib/validators/attendance';
import { z } from 'zod';
import { startOfMonth, endOfMonth, format, differenceInMinutes } from 'date-fns';

export const attendanceRouter = router({
  // Check in
  checkIn: protectedProcedure.input(checkInSchema).mutation(async ({ ctx, input }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already checked in today
    const existingAttendance = await ctx.prisma.attendance.findUnique({
      where: {
        employeeId_date: {
          employeeId: ctx.user.id,
          date: today,
        },
      },
    });

    if (existingAttendance?.checkIn) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: 'You have already checked in today',
      });
    }

    const attendance = await ctx.prisma.attendance.upsert({
      where: {
        employeeId_date: {
          employeeId: ctx.user.id,
          date: today,
        },
      },
      create: {
        employeeId: ctx.user.id,
        date: today,
        checkIn: new Date(),
        status: 'PRESENT',
        location: input.location,
        notes: input.notes,
      },
      update: {
        checkIn: new Date(),
        status: 'PRESENT',
        location: input.location,
        notes: input.notes,
      },
    });

    return attendance;
  }),

  // Check out
  checkOut: protectedProcedure.input(checkOutSchema).mutation(async ({ ctx, input }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await ctx.prisma.attendance.findUnique({
      where: {
        employeeId_date: {
          employeeId: ctx.user.id,
          date: today,
        },
      },
    });

    if (!attendance) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'No check-in record found for today',
      });
    }

    if (!attendance.checkIn) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'You must check in before checking out',
      });
    }

    if (attendance.checkOut) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: 'You have already checked out today',
      });
    }

    const checkOut = new Date();
    const workHours = differenceInMinutes(checkOut, attendance.checkIn) / 60;
    const overtimeHours = Math.max(0, workHours - 8);

    const updated = await ctx.prisma.attendance.update({
      where: { id: attendance.id },
      data: {
        checkOut,
        workHours,
        overtimeHours,
        notes: input.notes ? `${attendance.notes || ''}\n${input.notes}` : attendance.notes,
      },
    });

    return updated;
  }),

  // Get today's attendance
  getToday: protectedProcedure.query(async ({ ctx }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await ctx.prisma.attendance.findUnique({
      where: {
        employeeId_date: {
          employeeId: ctx.user.id,
          date: today,
        },
      },
    });

    return attendance;
  }),

  // Get my attendance history
  getMyAttendance: protectedProcedure
    .input(
      z
        .object({
          month: z.number().min(1).max(12).optional(),
          year: z.number().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const now = new Date();
      const month = input?.month ?? now.getMonth() + 1;
      const year = input?.year ?? now.getFullYear();

      const startDate = startOfMonth(new Date(year, month - 1));
      const endDate = endOfMonth(new Date(year, month - 1));

      const attendances = await ctx.prisma.attendance.findMany({
        where: {
          employeeId: ctx.user.id,
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: { date: 'desc' },
      });

      // Calculate summary
      const summary = {
        totalDays: attendances.length,
        presentDays: attendances.filter((a: { status: string }) => a.status === 'PRESENT').length,
        absentDays: attendances.filter((a: { status: string }) => a.status === 'ABSENT').length,
        halfDays: attendances.filter((a: { status: string }) => a.status === 'HALF_DAY').length,
        leaveDays: attendances.filter((a: { status: string }) => a.status === 'LEAVE').length,
        totalWorkHours: attendances.reduce((sum: number, a: { workHours?: number | null }) => sum + (a.workHours || 0), 0),
        totalOvertimeHours: attendances.reduce((sum: number, a: { overtimeHours?: number | null }) => sum + (a.overtimeHours || 0), 0),
      };

      return { attendances, summary };
    }),

  // Admin: Get all attendance for a date
  getAllByDate: adminProcedure
    .input(z.object({ date: z.string() }))
    .query(async ({ ctx, input }) => {
      const date = new Date(input.date);
      date.setHours(0, 0, 0, 0);

      const attendances = await ctx.prisma.attendance.findMany({
        where: { date },
        include: {
          employee: {
            include: {
              user: {
                select: { email: true, employeeId: true },
              },
              department: true,
            },
          },
        },
        orderBy: { checkIn: 'asc' },
      });

      return attendances;
    }),

  // Admin: Get attendance report
  getReport: adminProcedure
    .input(
      z.object({
        startDate: z.string(),
        endDate: z.string(),
        departmentId: z.string().uuid().optional(),
        employeeId: z.string().uuid().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const where = {
        date: {
          gte: new Date(input.startDate),
          lte: new Date(input.endDate),
        },
        ...(input.employeeId && { employeeId: input.employeeId }),
        ...(input.departmentId && {
          employee: { departmentId: input.departmentId },
        }),
      };

      const attendances = await ctx.prisma.attendance.findMany({
        where,
        include: {
          employee: {
            include: {
              user: { select: { email: true, employeeId: true } },
              department: true,
            },
          },
        },
        orderBy: [{ date: 'asc' }, { checkIn: 'asc' }],
      });

      // Group by employee for summary
      const employeeSummary = attendances.reduce(
        (acc, att) => {
          if (!acc[att.employeeId]) {
            acc[att.employeeId] = {
              employee: att.employee,
              present: 0,
              absent: 0,
              halfDay: 0,
              leave: 0,
              totalWorkHours: 0,
              totalOvertimeHours: 0,
            };
          }
          if (att.status === 'PRESENT') acc[att.employeeId].present++;
          if (att.status === 'ABSENT') acc[att.employeeId].absent++;
          if (att.status === 'HALF_DAY') acc[att.employeeId].halfDay++;
          if (att.status === 'LEAVE') acc[att.employeeId].leave++;
          acc[att.employeeId].totalWorkHours += att.workHours || 0;
          acc[att.employeeId].totalOvertimeHours += att.overtimeHours || 0;
          return acc;
        },
        {} as Record<string, unknown>
      );

      return {
        attendances,
        summary: Object.values(employeeSummary),
      };
    }),
});
