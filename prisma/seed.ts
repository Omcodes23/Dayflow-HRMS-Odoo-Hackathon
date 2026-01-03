import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create departments
  const departments = await Promise.all([
    prisma.department.upsert({
      where: { departmentCode: 'ENG' },
      update: {},
      create: { departmentName: 'Engineering', departmentCode: 'ENG', description: 'Software Development Team' },
    }),
    prisma.department.upsert({
      where: { departmentCode: 'HR' },
      update: {},
      create: { departmentName: 'Human Resources', departmentCode: 'HR', description: 'People Operations' },
    }),
    prisma.department.upsert({
      where: { departmentCode: 'FIN' },
      update: {},
      create: { departmentName: 'Finance', departmentCode: 'FIN', description: 'Financial Operations' },
    }),
    prisma.department.upsert({
      where: { departmentCode: 'MKT' },
      update: {},
      create: { departmentName: 'Marketing', departmentCode: 'MKT', description: 'Marketing & Sales' },
    }),
    prisma.department.upsert({
      where: { departmentCode: 'OPS' },
      update: {},
      create: { departmentName: 'Operations', departmentCode: 'OPS', description: 'Business Operations' },
    }),
  ]);

  console.log('✅ Departments created');

  // Create designations
  const designations = await Promise.all([
    prisma.designation.create({
      data: { designationName: 'Software Engineer', level: 1, description: 'Entry level developer' },
    }),
    prisma.designation.create({
      data: { designationName: 'Senior Software Engineer', level: 2, description: 'Experienced developer' },
    }),
    prisma.designation.create({
      data: { designationName: 'Lead Engineer', level: 3, description: 'Team lead' },
    }),
    prisma.designation.create({
      data: { designationName: 'Engineering Manager', level: 4, description: 'Engineering leadership' },
    }),
    prisma.designation.create({
      data: { designationName: 'HR Manager', level: 3, description: 'HR leadership' },
    }),
    prisma.designation.create({
      data: { designationName: 'HR Executive', level: 1, description: 'HR operations' },
    }),
    prisma.designation.create({
      data: { designationName: 'Finance Manager', level: 3, description: 'Finance leadership' },
    }),
    prisma.designation.create({
      data: { designationName: 'Accountant', level: 1, description: 'Finance operations' },
    }),
  ]);

  console.log('✅ Designations created');

  // Create leave policies
  await Promise.all([
    prisma.leavePolicy.upsert({
      where: { leaveType: 'PAID' },
      update: {},
      create: {
        leaveType: 'PAID',
        annualQuota: 20,
        carryForwardAllowed: true,
        maxCarryForward: 5,
        description: 'Paid annual leave',
      },
    }),
    prisma.leavePolicy.upsert({
      where: { leaveType: 'SICK' },
      update: {},
      create: {
        leaveType: 'SICK',
        annualQuota: 10,
        carryForwardAllowed: false,
        requiresDocumentation: true,
        description: 'Sick leave with medical certificate',
      },
    }),
    prisma.leavePolicy.upsert({
      where: { leaveType: 'CASUAL' },
      update: {},
      create: {
        leaveType: 'CASUAL',
        annualQuota: 10,
        carryForwardAllowed: true,
        maxCarryForward: 3,
        description: 'Casual leave for personal matters',
      },
    }),
    prisma.leavePolicy.upsert({
      where: { leaveType: 'UNPAID' },
      update: {},
      create: {
        leaveType: 'UNPAID',
        annualQuota: 30,
        carryForwardAllowed: false,
        description: 'Unpaid leave',
      },
    }),
    prisma.leavePolicy.upsert({
      where: { leaveType: 'MATERNITY' },
      update: {},
      create: {
        leaveType: 'MATERNITY',
        annualQuota: 180,
        carryForwardAllowed: false,
        requiresDocumentation: true,
        description: 'Maternity leave',
      },
    }),
    prisma.leavePolicy.upsert({
      where: { leaveType: 'PATERNITY' },
      update: {},
      create: {
        leaveType: 'PATERNITY',
        annualQuota: 14,
        carryForwardAllowed: false,
        description: 'Paternity leave',
      },
    }),
  ]);

  console.log('✅ Leave policies created');

  const adminPassword = await bcrypt.hash('Admin@123', 12);
  const websiteAdminPassword = await bcrypt.hash('WebAdmin@123', 12);
  const hrPassword = await bcrypt.hash('Hr@123456', 12);
  const empPassword = await bcrypt.hash('Employee@1', 12);

  // Create Website Admin user (Platform level admin)
  const websiteAdmin = await prisma.user.upsert({
    where: { email: 'webadmin@dayflow.com' },
    update: {},
    create: {
      employeeId: 'EMP000',
      email: 'webadmin@dayflow.com',
      passwordHash: websiteAdminPassword,
      role: 'WEBSITE_ADMIN',
      accountStatus: 'ACTIVE',
      emailVerified: true,
      mustChangePassword: false,
      employee: {
        create: {
          firstName: 'Website',
          lastName: 'Admin',
          phone: '+1234567800',
          gender: 'Male',
          joinDate: new Date('2019-01-01'),
          employmentType: 'FULL_TIME',
          employmentStatus: 'ACTIVE',
          departmentId: departments[0].id,
          designationId: designations[3].id,
        },
      },
    },
    include: { employee: true },
  });

  console.log('✅ Website Admin user created');

  // Create Admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@dayflow.com' },
    update: {},
    create: {
      employeeId: 'EMP001',
      email: 'admin@dayflow.com',
      passwordHash: adminPassword,
      role: 'COMPANY_ADMIN',
      accountStatus: 'ACTIVE',
      emailVerified: true,
      mustChangePassword: false,
      employee: {
        create: {
          firstName: 'Company',
          lastName: 'Admin',
          phone: '+1234567890',
          gender: 'Male',
          joinDate: new Date('2020-01-01'),
          employmentType: 'FULL_TIME',
          employmentStatus: 'ACTIVE',
          departmentId: departments[0].id,
          designationId: designations[3].id,
        },
      },
    },
    include: { employee: true },
  });

  console.log('✅ Company Admin user created');

  // Create HR user
  const hr = await prisma.user.upsert({
    where: { email: 'hr@dayflow.com' },
    update: {},
    create: {
      employeeId: 'EMP002',
      email: 'hr@dayflow.com',
      passwordHash: hrPassword,
      role: 'HR',
      accountStatus: 'ACTIVE',
      emailVerified: true,
      mustChangePassword: false,
      employee: {
        create: {
          firstName: 'Sarah',
          lastName: 'Wilson',
          phone: '+1234567891',
          gender: 'Female',
          joinDate: new Date('2021-03-15'),
          employmentType: 'FULL_TIME',
          employmentStatus: 'ACTIVE',
          departmentId: departments[1].id,
          designationId: designations[4].id,
        },
      },
    },
    include: { employee: true },
  });

  console.log('✅ HR user created');

  // Create multiple employees
  const employeeData = [
    { empId: 'EMP003', email: 'john.doe@dayflow.com', firstName: 'John', lastName: 'Doe', deptIdx: 0, desigIdx: 0, gender: 'Male' },
    { empId: 'EMP004', email: 'jane.smith@dayflow.com', firstName: 'Jane', lastName: 'Smith', deptIdx: 0, desigIdx: 1, gender: 'Female' },
    { empId: 'EMP005', email: 'mike.johnson@dayflow.com', firstName: 'Mike', lastName: 'Johnson', deptIdx: 0, desigIdx: 2, gender: 'Male' },
    { empId: 'EMP006', email: 'emily.brown@dayflow.com', firstName: 'Emily', lastName: 'Brown', deptIdx: 2, desigIdx: 6, gender: 'Female' },
    { empId: 'EMP007', email: 'david.lee@dayflow.com', firstName: 'David', lastName: 'Lee', deptIdx: 2, desigIdx: 7, gender: 'Male' },
    { empId: 'EMP008', email: 'lisa.wang@dayflow.com', firstName: 'Lisa', lastName: 'Wang', deptIdx: 3, desigIdx: 0, gender: 'Female' },
    { empId: 'EMP009', email: 'robert.chen@dayflow.com', firstName: 'Robert', lastName: 'Chen', deptIdx: 0, desigIdx: 0, gender: 'Male' },
    { empId: 'EMP010', email: 'anna.kim@dayflow.com', firstName: 'Anna', lastName: 'Kim', deptIdx: 1, desigIdx: 5, gender: 'Female' },
  ];

  const employees = [];
  for (const emp of employeeData) {
    const user = await prisma.user.upsert({
      where: { email: emp.email },
      update: {},
      create: {
        employeeId: emp.empId,
        email: emp.email,
        passwordHash: empPassword,
        role: 'EMPLOYEE',
        accountStatus: 'ACTIVE',
        emailVerified: true,
        mustChangePassword: false,
        employee: {
          create: {
            firstName: emp.firstName,
            lastName: emp.lastName,
            phone: `+1234567${employees.length + 892}`,
            gender: emp.gender,
            joinDate: new Date(`202${2 + Math.floor(employees.length / 3)}-0${(employees.length % 9) + 1}-${10 + employees.length}`),
            employmentType: 'FULL_TIME',
            employmentStatus: 'ACTIVE',
            departmentId: departments[emp.deptIdx].id,
            designationId: designations[emp.desigIdx].id,
            reportingManagerId: emp.deptIdx === 0 ? admin.id : undefined,
          },
        },
      },
      include: { employee: true },
    });
    employees.push(user);
  }

  console.log('✅ Employees created');

  // Create leave balances for all users
  const allUsers = [websiteAdmin, admin, hr, ...employees];
  const currentYear = new Date().getFullYear();
  const leavePolicies = await prisma.leavePolicy.findMany();

  for (const user of allUsers) {
    for (const policy of leavePolicies) {
      await prisma.leaveBalance.upsert({
        where: {
          employeeId_leaveType_year: {
            employeeId: user.id,
            leaveType: policy.leaveType,
            year: currentYear,
          },
        },
        update: {},
        create: {
          employeeId: user.id,
          leaveType: policy.leaveType,
          year: currentYear,
          totalAllocated: policy.annualQuota,
          remaining: policy.annualQuota,
        },
      });
    }
  }

  console.log('✅ Leave balances created');

  // Create salary structures
  const salaries = [
    { userId: websiteAdmin.id, basic: 20000 },
    { userId: admin.id, basic: 15000 },
    { userId: hr.id, basic: 8000 },
    ...employees.map((e, i) => ({ userId: e.id, basic: 5000 + i * 500 })),
  ];

  for (const sal of salaries) {
    await prisma.salaryStructure.upsert({
      where: { id: sal.userId },
      update: {},
      create: {
        employeeId: sal.userId,
        basicSalary: sal.basic,
        hra: sal.basic * 0.4,
        transportAllowance: 2000,
        medicalAllowance: 1500,
        specialAllowance: sal.basic * 0.1,
        providentFund: sal.basic * 0.12,
        professionalTax: 200,
        incomeTax: sal.basic * 0.1,
        effectiveFrom: new Date('2024-01-01'),
      },
    });
  }

  console.log('✅ Salary structures created');

  // Create attendance records for the past 30 days
  const today = new Date();
  for (let dayOffset = 30; dayOffset >= 0; dayOffset--) {
    const date = new Date(today);
    date.setDate(date.getDate() - dayOffset);
    date.setHours(0, 0, 0, 0);

    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    for (const user of allUsers) {
      // Random attendance (90% present)
      const isPresent = Math.random() > 0.1;
      if (isPresent) {
        const checkIn = new Date(date);
        checkIn.setHours(8 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60));
        
        const checkOut = new Date(date);
        checkOut.setHours(17 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60));
        
        const workHours = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);

        await prisma.attendance.upsert({
          where: {
            employeeId_date: {
              employeeId: user.id,
              date,
            },
          },
          update: {},
          create: {
            employeeId: user.id,
            date,
            checkIn,
            checkOut,
            status: 'PRESENT',
            workHours,
            overtimeHours: Math.max(0, workHours - 8),
          },
        });
      }
    }
  }

  console.log('✅ Attendance records created');

  // Create some leave requests
  const leaveTypes = ['PAID', 'SICK', 'CASUAL'] as const;
  for (let i = 0; i < 5; i++) {
    const randomUser = employees[Math.floor(Math.random() * employees.length)];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 30) + 1);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + Math.floor(Math.random() * 3) + 1);

    await prisma.leaveRequest.create({
      data: {
        employeeId: randomUser.id,
        leaveType: leaveTypes[Math.floor(Math.random() * leaveTypes.length)],
        startDate,
        endDate,
        daysRequested: Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1,
        reason: 'Personal leave request for family matters',
        status: i < 2 ? 'PENDING' : i < 4 ? 'APPROVED' : 'REJECTED',
        reviewedById: i >= 2 ? hr.id : undefined,
        reviewedAt: i >= 2 ? new Date() : undefined,
      },
    });
  }

  console.log('✅ Leave requests created');

  // Create notifications
  for (const user of allUsers) {
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: 'SYSTEM_ALERT',
        title: 'Welcome to Dayflow HRMS',
        message: 'Your account has been set up successfully. Explore the dashboard to get started!',
        link: '/dashboard',
      },
    });
  }

  console.log('✅ Notifications created');

  console.log('\n🎉 Database seeding completed successfully!');
  console.log('\n📝 Test Accounts:');
  console.log('  Website Admin: webadmin@dayflow.com / WebAdmin@123');
  console.log('  Company Admin: admin@dayflow.com / Admin@123');
  console.log('  HR: hr@dayflow.com / Hr@123456');
  console.log('  Employee: john.doe@dayflow.com / Employee@1');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
