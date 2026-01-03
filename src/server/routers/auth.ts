import { TRPCError } from '@trpc/server';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import { signUpSchema, signInSchema } from '@/lib/validators/auth';
import { hashPassword, verifyPassword } from '@/lib/auth/password';
import { signAccessToken, signRefreshToken } from '@/lib/auth/jwt';
import { z } from 'zod';

export const authRouter = router({
  signUp: publicProcedure.input(signUpSchema).mutation(async ({ ctx, input }) => {
    const existingUser = await ctx.prisma.user.findFirst({
      where: {
        OR: [{ email: input.email }, { employeeId: input.employeeId }],
      },
    });

    if (existingUser) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: 'User with this email or employee ID already exists',
      });
    }

    const passwordHash = await hashPassword(input.password);

    const user = await ctx.prisma.user.create({
      data: {
        employeeId: input.employeeId,
        email: input.email,
        passwordHash,
        role: input.role || 'EMPLOYEE',
        accountStatus: 'ACTIVE',
        emailVerified: true,
        employee: {
          create: {
            firstName: input.firstName,
            lastName: input.lastName,
            joinDate: new Date(),
            employmentType: 'FULL_TIME',
            employmentStatus: 'ACTIVE',
          },
        },
      },
      include: { employee: true },
    });

    // Create leave balances for the new employee
    const currentYear = new Date().getFullYear();
    const leavePolicies = await ctx.prisma.leavePolicy.findMany();
    
    await ctx.prisma.leaveBalance.createMany({
      data: leavePolicies.map((policy: { leaveType: string; annualQuota: number }) => ({
        employeeId: user.id,
        leaveType: policy.leaveType,
        year: currentYear,
        totalAllocated: policy.annualQuota,
        remaining: policy.annualQuota,
      })),
    });

    const accessToken = signAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      employeeId: user.employeeId,
    });

    const refreshToken = signRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      employeeId: user.employeeId,
    });

    await ctx.prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        employeeId: user.employeeId,
        employee: user.employee,
      },
    };
  }),

  signIn: publicProcedure.input(signInSchema).mutation(async ({ ctx, input }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { email: input.email },
      include: {
        employee: {
          include: {
            department: true,
            designation: true,
          },
        },
      },
    });

    if (!user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Invalid email or password',
      });
    }

    if (user.accountStatus !== 'ACTIVE') {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Your account is not active. Please contact HR.',
      });
    }

    const isValidPassword = await verifyPassword(input.password, user.passwordHash);

    if (!isValidPassword) {
      await ctx.prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: { increment: 1 },
        },
      });

      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Invalid email or password',
      });
    }

    const accessToken = signAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      employeeId: user.employeeId,
    });

    const refreshToken = signRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      employeeId: user.employeeId,
    });

    await ctx.prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    await ctx.prisma.user.update({
      where: { id: user.id },
      data: {
        lastLogin: new Date(),
        failedLoginAttempts: 0,
      },
    });

    return {
      accessToken,
      refreshToken,
      mustChangePassword: user.mustChangePassword,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        employeeId: user.employeeId,
        employee: user.employee,
      },
    };
  }),

  refreshToken: publicProcedure
    .input(z.object({ refreshToken: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const storedToken = await ctx.prisma.refreshToken.findUnique({
        where: { token: input.refreshToken },
        include: { user: true },
      });

      if (!storedToken || storedToken.revokedAt || storedToken.expiresAt < new Date()) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid or expired refresh token',
        });
      }

      const accessToken = signAccessToken({
        userId: storedToken.user.id,
        email: storedToken.user.email,
        role: storedToken.user.role,
        employeeId: storedToken.user.employeeId,
      });

      return { accessToken };
    }),

  logout: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.prisma.refreshToken.updateMany({
      where: { userId: ctx.user.id, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    return { success: true };
  }),

  me: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { id: ctx.user.id },
      include: {
        employee: {
          include: {
            department: true,
            designation: true,
            reportingManager: {
              include: {
                user: { select: { email: true } },
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'User not found',
      });
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      employeeId: user.employeeId,
      employee: user.employee,
      mustChangePassword: user.mustChangePassword,
    };
  }),

  changePassword: protectedProcedure
    .input(z.object({
      currentPassword: z.string().optional(),
      newPassword: z.string().min(8),
      confirmPassword: z.string().min(8),
    }))
    .mutation(async ({ ctx, input }) => {
      if (input.newPassword !== input.confirmPassword) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'New passwords do not match',
        });
      }

      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.user.id },
      });

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      // If not first login (mustChangePassword), verify current password
      if (!user.mustChangePassword && input.currentPassword) {
        const isValidPassword = await verifyPassword(input.currentPassword, user.passwordHash);
        if (!isValidPassword) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Current password is incorrect',
          });
        }
      }

      const newPasswordHash = await hashPassword(input.newPassword);

      await ctx.prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash: newPasswordHash,
          mustChangePassword: false,
        },
      });

      return { success: true };
    }),
});
