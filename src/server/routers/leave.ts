import { TRPCError } from '@trpc/server';
import { router, protectedProcedure, adminProcedure } from '../trpc';
import { applyLeaveSchema, reviewLeaveSchema } from '@/lib/validators/leave';
import { z } from 'zod';
import { differenceInDays, isWeekend, eachDayOfInterval } from 'date-fns';

// Calculate business days between two dates
function calculateLeaveDays(startDate: Date, endDate: Date): number {
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  return days.filter((day) => !isWeekend(day)).length;
}

export const leaveRouter = router({
  // Apply for leave
  applyLeave: protectedProcedure.input(applyLeaveSchema).mutation(async ({ ctx, input }) => {
    const startDate = new Date(input.startDate);
    const endDate = new Date(input.endDate);

    if (startDate > endDate) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Start date cannot be after end date',
      });
    }

    const daysRequested = calculateLeaveDays(startDate, endDate);

    // Check leave balance
    const currentYear = new Date().getFullYear();
    const balance = await ctx.prisma.leaveBalance.findUnique({
      where: {
        employeeId_leaveType_year: {
          employeeId: ctx.user.id,
          leaveType: input.leaveType,
          year: currentYear,
        },
      },
    });

    if (!balance) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Leave balance not found for this leave type',
      });
    }

    if (balance.remaining < daysRequested) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: `Insufficient leave balance. Available: ${balance.remaining} days, Requested: ${daysRequested} days`,
      });
    }

    // Check for overlapping leave requests
    const overlapping = await ctx.prisma.leaveRequest.findFirst({
      where: {
        employeeId: ctx.user.id,
        status: { in: ['PENDING', 'APPROVED'] },
        OR: [
          {
            startDate: { lte: endDate },
            endDate: { gte: startDate },
          },
        ],
      },
    });

    if (overlapping) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: 'You already have a leave request for this period',
      });
    }

    const leaveRequest = await ctx.prisma.leaveRequest.create({
      data: {
        employeeId: ctx.user.id,
        leaveType: input.leaveType,
        startDate,
        endDate,
        daysRequested,
        reason: input.reason,
        status: 'PENDING',
      },
      include: {
        employee: {
          include: {
            user: { select: { email: true, employeeId: true } },
          },
        },
      },
    });

    // Create notification for HR/Admin
    const admins = await ctx.prisma.user.findMany({
      where: { role: { in: ['ADMIN', 'HR'] } },
    });

    await ctx.prisma.notification.createMany({
      data: admins.map((admin: { id: string }) => ({
        userId: admin.id,
        type: 'SYSTEM_ALERT',
        title: 'New Leave Request',
        message: `${leaveRequest.employee.firstName} ${leaveRequest.employee.lastName} has requested ${daysRequested} days of ${input.leaveType.toLowerCase()} leave`,
        link: `/admin/leaves`,
      })),
    });

    return leaveRequest;
  }),

  // Get my leave requests
  getMyLeaves: protectedProcedure
    .input(
      z
        .object({
          status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED']).optional(),
          year: z.number().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const year = input?.year ?? new Date().getFullYear();

      const leaves = await ctx.prisma.leaveRequest.findMany({
        where: {
          employeeId: ctx.user.id,
          ...(input?.status && { status: input.status }),
          startDate: {
            gte: new Date(year, 0, 1),
            lte: new Date(year, 11, 31),
          },
        },
        orderBy: { createdAt: 'desc' },
        include: {
          reviewedBy: {
            select: { email: true, employeeId: true },
          },
        },
      });

      return leaves;
    }),

  // Get my leave balances
  getMyBalances: protectedProcedure.query(async ({ ctx }) => {
    const currentYear = new Date().getFullYear();

    const balances = await ctx.prisma.leaveBalance.findMany({
      where: {
        employeeId: ctx.user.id,
        year: currentYear,
      },
    });

    // Get leave policies for descriptions
    const policies = await ctx.prisma.leavePolicy.findMany();

    return balances.map((balance: { leaveType: string; remaining: number; totalAllocated: number; used: number }) => ({
      ...balance,
      policy: policies.find((p: { leaveType: string }) => p.leaveType === balance.leaveType),
    }));
  }),

  // Cancel leave request
  cancel: protectedProcedure.input(z.object({ requestId: z.string().uuid() })).mutation(async ({ ctx, input }) => {
    const request = await ctx.prisma.leaveRequest.findUnique({
      where: { id: input.requestId },
    });

    if (!request) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Leave request not found',
      });
    }

    if (request.employeeId !== ctx.user.id) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You can only cancel your own leave requests',
      });
    }

    if (request.status !== 'PENDING') {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Only pending leave requests can be cancelled',
      });
    }

    const updated = await ctx.prisma.leaveRequest.update({
      where: { id: input.requestId },
      data: { status: 'CANCELLED' },
    });

    return updated;
  }),

  // Admin: Get all pending leave requests
  getPending: adminProcedure.query(async ({ ctx }) => {
    const requests = await ctx.prisma.leaveRequest.findMany({
      where: { status: 'PENDING' },
      include: {
        employee: {
          include: {
            user: { select: { email: true, employeeId: true } },
            department: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return requests;
  }),

  // Admin: Get all leave requests
  getAll: adminProcedure
    .input(
      z
        .object({
          status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED']).optional(),
          employeeId: z.string().uuid().optional(),
          departmentId: z.string().uuid().optional(),
          startDate: z.string().optional(),
          endDate: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const requests = await ctx.prisma.leaveRequest.findMany({
        where: {
          ...(input?.status && { status: input.status }),
          ...(input?.employeeId && { employeeId: input.employeeId }),
          ...(input?.departmentId && { employee: { departmentId: input.departmentId } }),
          ...(input?.startDate && {
            startDate: { gte: new Date(input.startDate) },
          }),
          ...(input?.endDate && {
            endDate: { lte: new Date(input.endDate) },
          }),
        },
        include: {
          employee: {
            include: {
              user: { select: { email: true, employeeId: true } },
              department: true,
            },
          },
          reviewedBy: {
            select: { email: true, employeeId: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return requests;
    }),

  // Admin: Review leave request
  review: adminProcedure.input(reviewLeaveSchema).mutation(async ({ ctx, input }) => {
    const request = await ctx.prisma.leaveRequest.findUnique({
      where: { id: input.requestId },
      include: { employee: true },
    });

    if (!request) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Leave request not found',
      });
    }

    if (request.status !== 'PENDING') {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'This leave request has already been reviewed',
      });
    }

    // Update leave request
    const updated = await ctx.prisma.leaveRequest.update({
      where: { id: input.requestId },
      data: {
        status: input.status,
        reviewedById: ctx.user.id,
        reviewedAt: new Date(),
        reviewerComments: input.comments,
      },
    });

    // If approved, update leave balance
    if (input.status === 'APPROVED') {
      const year = request.startDate.getFullYear();
      await ctx.prisma.leaveBalance.update({
        where: {
          employeeId_leaveType_year: {
            employeeId: request.employeeId,
            leaveType: request.leaveType,
            year,
          },
        },
        data: {
          used: { increment: request.daysRequested },
          remaining: { decrement: request.daysRequested },
        },
      });

      // Mark attendance as LEAVE for those days
      const days = eachDayOfInterval({
        start: request.startDate,
        end: request.endDate,
      }).filter((day) => !isWeekend(day));

      for (const day of days) {
        await ctx.prisma.attendance.upsert({
          where: {
            employeeId_date: {
              employeeId: request.employeeId,
              date: day,
            },
          },
          create: {
            employeeId: request.employeeId,
            date: day,
            status: 'LEAVE',
            notes: `${request.leaveType} leave`,
          },
          update: {
            status: 'LEAVE',
            notes: `${request.leaveType} leave`,
          },
        });
      }
    }

    // Create notification for employee
    await ctx.prisma.notification.create({
      data: {
        userId: request.employeeId,
        type: input.status === 'APPROVED' ? 'LEAVE_APPROVED' : 'LEAVE_REJECTED',
        title: `Leave Request ${input.status}`,
        message: `Your ${request.leaveType.toLowerCase()} leave request from ${request.startDate.toDateString()} to ${request.endDate.toDateString()} has been ${input.status.toLowerCase()}`,
        link: '/leaves/history',
      },
    });

    return updated;
  }),

  // Get leave policies
  getPolicies: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.leavePolicy.findMany();
  }),
});
