import { TRPCError } from '@trpc/server';
import { router, protectedProcedure, adminProcedure } from '../trpc';
import { z } from 'zod';

interface SalaryRecord {
  basicSalary: number;
  hra: number;
  transportAllowance: number;
  medicalAllowance: number;
  specialAllowance: number;
  providentFund: number;
  professionalTax: number;
  incomeTax: number;
}

export const payrollRouter = router({
  // Get my salary details
  getMySalary: protectedProcedure.query(async ({ ctx }) => {
    const salary = await ctx.prisma.salaryStructure.findFirst({
      where: {
        employeeId: ctx.user.id,
        effectiveTo: null,
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

    if (!salary) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Salary structure not found',
      });
    }

    // Calculate derived values
    const grossSalary =
      salary.basicSalary +
      salary.hra +
      salary.transportAllowance +
      salary.medicalAllowance +
      salary.specialAllowance;

    const totalDeductions = salary.providentFund + salary.professionalTax + salary.incomeTax;

    const netSalary = grossSalary - totalDeductions;

    return {
      ...salary,
      grossSalary,
      totalDeductions,
      netSalary,
    };
  }),

  // Get my salary history
  getMySalaryHistory: protectedProcedure.query(async ({ ctx }) => {
    const salaries = await ctx.prisma.salaryStructure.findMany({
      where: { employeeId: ctx.user.id },
      orderBy: { effectiveFrom: 'desc' },
    });

    return salaries.map((salary: SalaryRecord) => {
      const grossSalary =
        salary.basicSalary +
        salary.hra +
        salary.transportAllowance +
        salary.medicalAllowance +
        salary.specialAllowance;

      const totalDeductions = salary.providentFund + salary.professionalTax + salary.incomeTax;

      const netSalary = grossSalary - totalDeductions;

      return {
        ...salary,
        grossSalary,
        totalDeductions,
        netSalary,
      };
    });
  }),

  // Admin: Get all salaries
  getAll: adminProcedure
    .input(
      z
        .object({
          departmentId: z.string().uuid().optional(),
          search: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const salaries = await ctx.prisma.salaryStructure.findMany({
        where: {
          effectiveTo: null,
          ...(input?.departmentId && {
            employee: { departmentId: input.departmentId },
          }),
          ...(input?.search && {
            employee: {
              OR: [
                { firstName: { contains: input.search, mode: 'insensitive' } },
                { lastName: { contains: input.search, mode: 'insensitive' } },
                { user: { employeeId: { contains: input.search, mode: 'insensitive' } } },
              ],
            },
          }),
        },
        include: {
          employee: {
            include: {
              user: { select: { email: true, employeeId: true } },
              department: true,
              designation: true,
            },
          },
        },
        orderBy: { employee: { firstName: 'asc' } },
      });

      return salaries.map((salary: SalaryRecord & { employee: unknown }) => {
        const grossSalary =
          salary.basicSalary +
          salary.hra +
          salary.transportAllowance +
          salary.medicalAllowance +
          salary.specialAllowance;

        const totalDeductions = salary.providentFund + salary.professionalTax + salary.incomeTax;

        const netSalary = grossSalary - totalDeductions;

        return {
          ...salary,
          grossSalary,
          totalDeductions,
          netSalary,
        };
      });
    }),

  // Admin: Create/Update salary structure
  upsert: adminProcedure
    .input(
      z.object({
        employeeId: z.string().uuid(),
        basicSalary: z.number().min(0),
        hra: z.number().min(0).optional(),
        transportAllowance: z.number().min(0).optional(),
        medicalAllowance: z.number().min(0).optional(),
        specialAllowance: z.number().min(0).optional(),
        providentFund: z.number().min(0).optional(),
        professionalTax: z.number().min(0).optional(),
        incomeTax: z.number().min(0).optional(),
        effectiveFrom: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // End current salary structure if exists
      await ctx.prisma.salaryStructure.updateMany({
        where: {
          employeeId: input.employeeId,
          effectiveTo: null,
        },
        data: {
          effectiveTo: new Date(input.effectiveFrom),
        },
      });

      // Create new salary structure
      const salary = await ctx.prisma.salaryStructure.create({
        data: {
          employeeId: input.employeeId,
          basicSalary: input.basicSalary,
          hra: input.hra ?? input.basicSalary * 0.4,
          transportAllowance: input.transportAllowance ?? 2000,
          medicalAllowance: input.medicalAllowance ?? 1500,
          specialAllowance: input.specialAllowance ?? input.basicSalary * 0.1,
          providentFund: input.providentFund ?? input.basicSalary * 0.12,
          professionalTax: input.professionalTax ?? 200,
          incomeTax: input.incomeTax ?? input.basicSalary * 0.1,
          effectiveFrom: new Date(input.effectiveFrom),
        },
        include: {
          employee: {
            include: {
              user: { select: { email: true, employeeId: true } },
            },
          },
        },
      });

      // Notify employee
      await ctx.prisma.notification.create({
        data: {
          userId: input.employeeId,
          type: 'PAYROLL_GENERATED',
          title: 'Salary Updated',
          message: 'Your salary structure has been updated. Please check your payroll details.',
          link: '/payroll',
        },
      });

      return salary;
    }),

  // Admin: Get salary by employee
  getByEmployee: adminProcedure.input(z.object({ employeeId: z.string().uuid() })).query(async ({ ctx, input }) => {
    const salaries = await ctx.prisma.salaryStructure.findMany({
      where: { employeeId: input.employeeId },
      orderBy: { effectiveFrom: 'desc' },
      include: {
        employee: {
          include: {
            department: true,
            designation: true,
          },
        },
      },
    });

    return salaries.map((salary: SalaryRecord & { employee: unknown }) => {
      const grossSalary =
        salary.basicSalary +
        salary.hra +
        salary.transportAllowance +
        salary.medicalAllowance +
        salary.specialAllowance;

      const totalDeductions = salary.providentFund + salary.professionalTax + salary.incomeTax;

      const netSalary = grossSalary - totalDeductions;

      return {
        ...salary,
        grossSalary,
        totalDeductions,
        netSalary,
      };
    });
  }),

  // Get payroll summary for dashboard
  getSummary: adminProcedure.query(async ({ ctx }) => {
    const salaries = await ctx.prisma.salaryStructure.findMany({
      where: { effectiveTo: null },
    });

    const totalGross = salaries.reduce((sum: number, s: SalaryRecord) => {
      return sum + s.basicSalary + s.hra + s.transportAllowance + s.medicalAllowance + s.specialAllowance;
    }, 0);

    const totalDeductions = salaries.reduce((sum: number, s: SalaryRecord) => {
      return sum + s.providentFund + s.professionalTax + s.incomeTax;
    }, 0);

    const totalNet = totalGross - totalDeductions;

    return {
      totalEmployees: salaries.length,
      totalGross,
      totalDeductions,
      totalNet,
      averageSalary: salaries.length > 0 ? totalNet / salaries.length : 0,
    };
  }),
});
