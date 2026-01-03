import { TRPCError } from '@trpc/server';
import { router, protectedProcedure, adminProcedure } from '../trpc';
import { updateProfileSchema, createEmployeeSchema } from '@/lib/validators/employee';
import { hashPassword } from '@/lib/auth/password';
import { z } from 'zod';

export const employeeRouter = router({
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const employee = await ctx.prisma.employee.findUnique({
      where: { id: ctx.user.id },
      include: {
        user: {
          select: {
            email: true,
            role: true,
            employeeId: true,
            lastLogin: true,
            createdAt: true,
          },
        },
        department: true,
        designation: true,
        reportingManager: {
          include: {
            user: { select: { email: true, employeeId: true } },
          },
        },
        salaryStructures: {
          where: { effectiveTo: null },
          take: 1,
        },
      },
    });

    if (!employee) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Employee profile not found',
      });
    }

    return employee;
  }),

  updateProfile: protectedProcedure.input(updateProfileSchema).mutation(async ({ ctx, input }) => {
    const employee = await ctx.prisma.employee.update({
      where: { id: ctx.user.id },
      data: {
        ...input,
        dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : undefined,
        updatedById: ctx.user.id,
      },
      include: {
        department: true,
        designation: true,
      },
    });

    return employee;
  }),

  // Admin: Get all employees
  getAll: adminProcedure
    .input(
      z
        .object({
          search: z.string().optional(),
          departmentId: z.string().uuid().optional(),
          status: z.enum(['ACTIVE', 'ON_LEAVE', 'TERMINATED', 'RESIGNED']).optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const where = {
        ...(input?.search && {
          OR: [
            { firstName: { contains: input.search, mode: 'insensitive' as const } },
            { lastName: { contains: input.search, mode: 'insensitive' as const } },
            { user: { email: { contains: input.search, mode: 'insensitive' as const } } },
            { user: { employeeId: { contains: input.search, mode: 'insensitive' as const } } },
          ],
        }),
        ...(input?.departmentId && { departmentId: input.departmentId }),
        ...(input?.status && { employmentStatus: input.status }),
      };

      const employees = await ctx.prisma.employee.findMany({
        where,
        include: {
          user: {
            select: {
              email: true,
              role: true,
              employeeId: true,
              accountStatus: true,
              lastLogin: true,
            },
          },
          department: true,
          designation: true,
          salaryStructures: {
            where: { effectiveTo: null },
            take: 1,
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      // Transform to include salary directly
      return employees.map((emp) => ({
        ...emp,
        salary: emp.salaryStructures[0]
          ? {
              basicSalary: emp.salaryStructures[0].basicSalary,
              houseRentAllowance: emp.salaryStructures[0].hra,
              conveyanceAllowance: emp.salaryStructures[0].transportAllowance,
              medicalAllowance: emp.salaryStructures[0].medicalAllowance,
              specialAllowance: emp.salaryStructures[0].specialAllowance,
              providentFund: emp.salaryStructures[0].providentFund,
              professionalTax: emp.salaryStructures[0].professionalTax,
              incomeTax: emp.salaryStructures[0].incomeTax,
              effectiveFrom: emp.salaryStructures[0].effectiveFrom,
            }
          : null,
      }));
    }),

  // Admin: Get single employee
  getById: adminProcedure.input(z.object({ id: z.string().uuid() })).query(async ({ ctx, input }) => {
    const employee = await ctx.prisma.employee.findUnique({
      where: { id: input.id },
      include: {
        user: {
          select: {
            email: true,
            role: true,
            employeeId: true,
            accountStatus: true,
            lastLogin: true,
            createdAt: true,
          },
        },
        department: true,
        designation: true,
        reportingManager: {
          include: {
            user: { select: { email: true, employeeId: true } },
          },
        },
        salaryStructures: {
          orderBy: { effectiveFrom: 'desc' },
        },
        leaveBalances: {
          where: { year: new Date().getFullYear() },
        },
        attendances: {
          take: 30,
          orderBy: { date: 'desc' },
        },
      },
    });

    if (!employee) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Employee not found',
      });
    }

    return employee;
  }),

  // Admin: Create new employee
  create: adminProcedure.input(createEmployeeSchema).mutation(async ({ ctx, input }) => {
    // Generate employee ID if not provided
    const employeeCount = await ctx.prisma.user.count();
    const generatedEmployeeId = input.employeeId || `EMP${String(employeeCount + 1).padStart(5, '0')}`;

    const existingUser = await ctx.prisma.user.findFirst({
      where: {
        OR: [{ email: input.email }, { employeeId: generatedEmployeeId }],
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
        employeeId: generatedEmployeeId,
        email: input.email,
        passwordHash,
        role: input.role,
        accountStatus: 'ACTIVE',
        emailVerified: true,
        mustChangePassword: true,
        employee: {
          create: {
            firstName: input.firstName,
            lastName: input.lastName,
            phone: input.phone,
            joinDate: input.dateOfJoining,
            departmentId: input.departmentId,
            designationId: input.designationId,
            employmentType: input.employmentType,
            employmentStatus: 'ACTIVE',
            createdById: ctx.user.id,
          },
        },
      },
      include: {
        employee: {
          include: {
            department: true,
            designation: true,
          },
        },
      },
    });

    // Create leave balances
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

    // Create salary structure if provided
    if (input.basicSalary) {
      await ctx.prisma.salaryStructure.create({
        data: {
          employeeId: user.id,
          basicSalary: input.basicSalary,
          hra: input.basicSalary * 0.4,
          transportAllowance: 2000,
          medicalAllowance: 1500,
          specialAllowance: input.basicSalary * 0.1,
          providentFund: input.basicSalary * 0.12,
          professionalTax: 200,
          incomeTax: input.basicSalary * 0.1,
          effectiveFrom: input.dateOfJoining,
        },
      });
    }

    return user;
  }),

  // Admin: Update employee status
  updateStatus: adminProcedure
    .input(
      z.object({
        employeeId: z.string().uuid(),
        status: z.enum(['ACTIVE', 'ON_LEAVE', 'TERMINATED', 'RESIGNED']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const employee = await ctx.prisma.employee.update({
        where: { id: input.employeeId },
        data: {
          employmentStatus: input.status,
          ...(input.status === 'RESIGNED' && { resignationDate: new Date() }),
          ...(input.status === 'TERMINATED' && { terminationDate: new Date() }),
          updatedById: ctx.user.id,
        },
      });

      // Update user account status
      await ctx.prisma.user.update({
        where: { id: input.employeeId },
        data: {
          accountStatus: input.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE',
        },
      });

      return employee;
    }),

  // Get departments list
  getDepartments: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.department.findMany({
      orderBy: { departmentName: 'asc' },
    });
  }),

  // Get designations list
  getDesignations: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.designation.findMany({
      orderBy: { level: 'asc' },
      include: {
        _count: {
          select: { employees: true },
        },
      },
    });
  }),

  // Create designation (HR and COMPANY_ADMIN only)
  createDesignation: protectedProcedure
    .input(
      z.object({
        designationName: z.string().min(1, 'Designation name is required'),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user has permission
      if (!['HR', 'COMPANY_ADMIN'].includes(ctx.user.role)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only HR and Company Admin can create designations',
        });
      }

      // Get the highest level to increment
      const highestDesignation = await ctx.prisma.designation.findFirst({
        orderBy: { level: 'desc' },
      });

      const designation = await ctx.prisma.designation.create({
        data: {
          designationName: input.designationName,
          description: input.description,
          level: (highestDesignation?.level || 0) + 1,
          createdById: ctx.user.id,
        },
      });

      return designation;
    }),

  // Update designation (HR and COMPANY_ADMIN only)
  updateDesignation: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        designationName: z.string().min(1, 'Designation name is required').optional(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user has permission
      if (!['HR', 'COMPANY_ADMIN'].includes(ctx.user.role)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only HR and Company Admin can update designations',
        });
      }

      const { id, ...data } = input;
      const designation = await ctx.prisma.designation.update({
        where: { id },
        data: {
          ...data,
          updatedById: ctx.user.id,
        },
      });

      return designation;
    }),

  // Delete designation (HR and COMPANY_ADMIN only)
  deleteDesignation: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if user has permission
      if (!['HR', 'COMPANY_ADMIN'].includes(ctx.user.role)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only HR and Company Admin can delete designations',
        });
      }

      // Check if designation is being used
      const employeeCount = await ctx.prisma.employee.count({
        where: { designationId: input.id },
      });

      if (employeeCount > 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Cannot delete designation. ${employeeCount} employee(s) are assigned to this designation.`,
        });
      }

      await ctx.prisma.designation.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),
});
