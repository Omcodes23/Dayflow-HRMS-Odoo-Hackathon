# 🚀 Dayflow - Human Resource Management System

<div align="center">

![Dayflow Logo](https://img.shields.io/badge/Dayflow-HRMS-blue?style=for-the-badge&logo=users)
![Version](https://img.shields.io/badge/version-1.0.0-green?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-yellow?style=for-the-badge)

**A modern, full-stack Human Resource Management System built with Next.js 16, TypeScript, Prisma, and PostgreSQL**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Installation](#-installation) • [Usage](#-usage) • [API](#-api-documentation)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [Database Setup](#-database-setup)
- [Running the Application](#-running-the-application)
- [User Roles & Permissions](#-user-roles--permissions)
- [Test Accounts](#-test-accounts)
- [API Documentation](#-api-documentation)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

Dayflow HRMS is a comprehensive Human Resource Management System designed to streamline HR operations for organizations of any size. It provides a complete solution for managing employees, attendance, leaves, payroll, and more with a beautiful, responsive UI and role-based access control.

### Key Highlights

- 🎨 **Modern UI/UX** - Beautiful, responsive design with dark mode support
- 🔐 **Role-Based Access Control** - 5 distinct user roles with granular permissions
- 📊 **Real-time Dashboard** - Role-specific dashboards with relevant statistics
- 📱 **Mobile Responsive** - Works seamlessly on all devices
- 🔒 **Secure** - JWT authentication with password hashing and force password change

---

## ✨ Features

### 👤 Employee Management
- Complete employee profiles with personal and professional details
- Department and designation assignment
- Employment status tracking (Active, On Leave, Resigned, Terminated)
- Employee search and filtering

### ⏰ Attendance Management
- Check-in/Check-out functionality
- Real-time attendance tracking
- Monthly attendance reports
- Work hours calculation
- Late arrival and early exit tracking

### 🏖️ Leave Management
- Multiple leave types (Paid, Sick, Casual, Maternity, Paternity, Unpaid)
- Leave balance tracking
- Leave request workflow with approval system
- Leave history and analytics

### 💰 Payroll Management
- Comprehensive salary structure
  - Basic Salary
  - House Rent Allowance (HRA)
  - Transport Allowance
  - Medical Allowance
  - Special Allowance
  - Deductions (PF, Professional Tax, Income Tax)
- Net salary calculation
- Payroll reports

### 📊 Reports & Analytics
- Department-wise reports
- Attendance analytics
- Leave statistics
- Payroll summaries
- Trend analysis

### 🔔 Notifications
- Real-time notifications
- Leave request alerts
- System notifications

### ⚙️ Settings
- Profile management
- Password change
- Theme preferences (Light/Dark mode)
- Email notifications toggle

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **Next.js 16.1.1** | React framework with App Router |
| **TypeScript** | Type-safe development |
| **Tailwind CSS** | Utility-first styling |
| **shadcn/ui** | Beautiful UI components |
| **Framer Motion** | Animations |
| **Lucide React** | Icons |
| **React Hook Form** | Form handling |
| **Zod** | Schema validation |

### Backend
| Technology | Purpose |
|------------|---------|
| **tRPC** | End-to-end typesafe API |
| **Prisma ORM** | Database management |
| **PostgreSQL** | Relational database |
| **bcryptjs** | Password hashing |
| **jose** | JWT authentication |

### Development Tools
| Tool | Purpose |
|------|---------|
| **ESLint** | Code linting |
| **Turbopack** | Fast bundling |
| **Docker** | Containerization |

---

## 📁 Project Structure

```
Dayflow-HRMS/
├── prisma/
│   ├── schema.prisma        # Database schema
│   ├── seed.ts              # Database seeding
│   └── migrations/          # Database migrations
│
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── (auth)/          # Authentication routes
│   │   │   ├── signin/
│   │   │   ├── signup/
│   │   │   └── change-password/
│   │   ├── (dashboard)/     # Protected dashboard routes
│   │   │   ├── dashboard/
│   │   │   ├── profile/
│   │   │   ├── attendance/
│   │   │   ├── leaves/
│   │   │   ├── payroll/
│   │   │   ├── settings/
│   │   │   ├── website-admin/
│   │   │   └── admin/
│   │   │       ├── employees/
│   │   │       ├── designations/
│   │   │       ├── leaves/
│   │   │       ├── attendance/
│   │   │       ├── payroll/
│   │   │       └── reports/
│   │   ├── (public)/        # Public landing page
│   │   └── api/trpc/        # tRPC API route
│   │
│   ├── components/
│   │   ├── ui/              # shadcn/ui components
│   │   ├── layout/          # Layout components
│   │   ├── dashboard/       # Role-specific dashboards
│   │   ├── attendance/      # Attendance components
│   │   ├── leaves/          # Leave components
│   │   ├── auth/            # Auth components (RoleGuard)
│   │   ├── providers/       # Context providers
│   │   └── shared/          # Shared components
│   │
│   ├── server/
│   │   ├── routers/         # tRPC routers
│   │   │   ├── _app.ts      # Main router
│   │   │   ├── auth.ts      # Authentication
│   │   │   ├── employee.ts  # Employee management
│   │   │   ├── attendance.ts # Attendance
│   │   │   ├── leave.ts     # Leave management
│   │   │   ├── payroll.ts   # Payroll
│   │   │   ├── dashboard.ts # Dashboard stats
│   │   │   └── notification.ts # Notifications
│   │   ├── trpc.ts          # tRPC setup
│   │   └── context.ts       # Request context
│   │
│   ├── lib/
│   │   ├── auth/            # Auth utilities
│   │   ├── validators/      # Zod schemas
│   │   ├── utils/           # Helper functions
│   │   ├── db.ts            # Prisma client
│   │   └── trpc.ts          # tRPC client
│   │
│   └── hooks/
│       └── useAuth.ts       # Auth state management
│
├── public/                  # Static assets
├── docker-compose.yml       # Docker configuration
├── package.json
└── README.md
```

---

## 🚀 Installation

### Prerequisites

- **Node.js** 18.x or higher
- **pnpm** (recommended) or npm
- **PostgreSQL** 14+ or Docker
- **Git**

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/dayflow-hrms.git
cd dayflow-hrms
```

### Step 2: Install Dependencies

```bash
pnpm install
# or
npm install
```

### Step 3: Set Up Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/dayflow_hrms?schema=public"

# JWT Secret (generate a secure random string)
JWT_SECRET="your-super-secure-jwt-secret-key-min-32-chars"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Step 4: Start PostgreSQL

**Option A: Using Docker (Recommended)**
```bash
docker-compose up -d
```

**Option B: Local PostgreSQL**
- Install PostgreSQL
- Create a database named `dayflow_hrms`
- Update the `DATABASE_URL` in `.env`

### Step 5: Set Up Database

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed the database with sample data
npm run db:seed
```

---

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `JWT_SECRET` | Secret key for JWT tokens (min 32 chars) | ✅ |
| `NEXT_PUBLIC_APP_URL` | Application URL | ✅ |

---

## 💾 Database Setup

### Schema Overview

The database includes the following main tables:

- **users** - User authentication and role
- **employees** - Employee profiles
- **departments** - Organization departments
- **designations** - Job designations/titles
- **attendance** - Daily attendance records
- **leave_requests** - Leave applications
- **leave_balances** - Employee leave balances
- **leave_policies** - Company leave policies
- **salary_structures** - Employee salary details
- **notifications** - System notifications

### Prisma Commands

```bash
# View database in Prisma Studio
npx prisma studio

# Reset database (caution: deletes all data)
npx prisma migrate reset

# Create new migration
npx prisma migrate dev --name <migration_name>

# Re-seed database
npm run db:seed
```

---

## 🏃 Running the Application

### Development Mode

```bash
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

### Docker Deployment

```bash
docker-compose up --build
```

---

## 👥 User Roles & Permissions

### Role Hierarchy

```
WEBSITE_ADMIN
    │
    └── COMPANY_ADMIN
            │
            └── HR
                │
                └── MANAGER
                    │
                    └── EMPLOYEE
```

### Permission Matrix

| Feature | Website Admin | Company Admin | HR | Manager | Employee |
|---------|:-------------:|:-------------:|:--:|:-------:|:--------:|
| Platform Admin | ✅ | ❌ | ❌ | ❌ | ❌ |
| Employee Management | ✅ | ✅ | ✅ | ❌ | ❌ |
| Designation CRUD | ✅ | ✅ | ✅ | ❌ | ❌ |
| Leave Approvals | ✅ | ✅ | ✅ | ❌ | ❌ |
| Payroll Management | ✅ | ✅ | ✅ | ❌ | ❌ |
| Reports & Analytics | ✅ | ✅ | ✅ | ❌ | ❌ |
| Attendance Report | ✅ | ✅ | ✅ | ❌ | ❌ |
| View Own Profile | ✅ | ✅ | ✅ | ✅ | ✅ |
| Manage Own Attendance | ✅ | ✅ | ✅ | ✅ | ✅ |
| Apply for Leave | ✅ | ✅ | ✅ | ✅ | ✅ |
| View Own Payroll | ✅ | ✅ | ✅ | ✅ | ✅ |

### Role Descriptions

| Role | Description | Sidebar Access |
|------|-------------|----------------|
| **WEBSITE_ADMIN** | Platform-level administrator with full system access | All sections + Platform Admin |
| **COMPANY_ADMIN** | Company-level administrator | All admin sections |
| **HR** | Human Resources manager | All admin sections |
| **MANAGER** | Department manager | Employee sections only |
| **EMPLOYEE** | Regular employee | Employee sections only |

---

## 🔑 Test Accounts

After seeding the database, use these accounts to test different roles:

| Role | Email | Password |
|------|-------|----------|
| **Website Admin** | webadmin@dayflow.com | WebAdmin@123 |
| **Company Admin** | admin@dayflow.com | Admin@123 |
| **HR** | hr@dayflow.com | Hr@123456 |
| **Employee** | john.doe@dayflow.com | Employee@1 |

> ⚠️ **Note**: New users created through the system are assigned a random password and must change it on first login.

---

## 📚 API Documentation

### tRPC Routers

The API is built with tRPC for end-to-end type safety.

#### Auth Router (`/api/trpc/auth.*`)

| Procedure | Type | Description |
|-----------|------|-------------|
| `login` | Mutation | Authenticate user |
| `register` | Mutation | Register new user |
| `logout` | Mutation | End session |
| `getSession` | Query | Get current session |
| `changePassword` | Mutation | Change user password |

#### Employee Router (`/api/trpc/employee.*`)

| Procedure | Type | Description | Access |
|-----------|------|-------------|--------|
| `getProfile` | Query | Get current user's profile | All |
| `updateProfile` | Mutation | Update own profile | All |
| `getAll` | Query | List all employees | Admin |
| `getById` | Query | Get employee by ID | Admin |
| `create` | Mutation | Create new employee | Admin |
| `updateStatus` | Mutation | Update employee status | Admin |
| `getDepartments` | Query | List all departments | All |
| `getDesignations` | Query | List all designations | All |
| `createDesignation` | Mutation | Create designation | HR+ |
| `updateDesignation` | Mutation | Update designation | HR+ |
| `deleteDesignation` | Mutation | Delete designation | HR+ |

#### Attendance Router (`/api/trpc/attendance.*`)

| Procedure | Type | Description | Access |
|-----------|------|-------------|--------|
| `checkIn` | Mutation | Record check-in | All |
| `checkOut` | Mutation | Record check-out | All |
| `getTodayStatus` | Query | Get today's attendance | All |
| `getMyAttendance` | Query | Get own attendance history | All |
| `getReport` | Query | Get attendance report | Admin |

#### Leave Router (`/api/trpc/leave.*`)

| Procedure | Type | Description | Access |
|-----------|------|-------------|--------|
| `applyLeave` | Mutation | Submit leave request | All |
| `getMyRequests` | Query | Get own leave requests | All |
| `getMyBalances` | Query | Get leave balances | All |
| `cancel` | Mutation | Cancel leave request | All |
| `getPending` | Query | Get pending approvals | Admin |
| `getAll` | Query | List all leave requests | Admin |
| `review` | Mutation | Approve/reject leave | Admin |

#### Payroll Router (`/api/trpc/payroll.*`)

| Procedure | Type | Description | Access |
|-----------|------|-------------|--------|
| `getMySalary` | Query | Get own salary details | All |
| `upsert` | Mutation | Create/update salary | Admin |
| `getAll` | Query | List all salaries | Admin |

#### Dashboard Router (`/api/trpc/dashboard.*`)

| Procedure | Type | Description | Access |
|-----------|------|-------------|--------|
| `getEmployeeStats` | Query | Employee dashboard stats | All |
| `getAdminStats` | Query | Admin dashboard stats | Admin |

---

## 🖼️ Screenshots

### Landing Page
Modern, responsive landing page with feature highlights and call-to-action buttons.

### Role-Specific Dashboards

- **Employee Dashboard**: Personal stats, check-in/out, leave balances
- **HR Dashboard**: HR-focused stats, pending actions, quick links
- **Company Admin Dashboard**: Company-wide statistics, quick actions
- **Website Admin Dashboard**: Platform-level statistics, system management

### Admin Features
- Employee management with search and filtering
- Designation CRUD operations
- Leave approval workflow
- Attendance reports with analytics
- Payroll management
- Comprehensive reports

---

## 🎨 Theming

Dayflow supports both light and dark themes:

- Toggle theme from the header
- System preference detection
- Persistent theme selection
- CSS variables for easy customization

### Customizing Colors

Edit `src/app/globals.css` to modify the color scheme:

```css
:root {
  --primary: 221.2 83.2% 53.3%;
  --secondary: 210 40% 96.1%;
  /* ... more variables */
}

.dark {
  --primary: 217.2 91.2% 59.8%;
  --secondary: 217.2 32.6% 17.5%;
  /* ... more variables */
}
```

---

## 🔧 Configuration

### Next.js Config (`next.config.ts`)

```typescript
const nextConfig = {
  // Enable strict mode
  reactStrictMode: true,
  
  // Image optimization domains
  images: {
    domains: ['localhost'],
  },
};
```

### Prisma Config (`prisma.config.ts`)

```typescript
export default {
  generator: {
    provider: 'prisma-client-js',
  },
  datasource: {
    provider: 'postgresql',
    url: process.env.DATABASE_URL,
  },
};
```

---

## 🐛 Troubleshooting

### Common Issues

#### Database Connection Error
```
Error: Can't reach database server
```
**Solution**: Ensure PostgreSQL is running and `DATABASE_URL` is correct.

#### JWT Error
```
Error: JWT secret must be at least 32 characters
```
**Solution**: Update `JWT_SECRET` in `.env` to be at least 32 characters.

#### Prisma Migration Error
```
Error: Migration failed
```
**Solution**: 
```bash
npx prisma migrate reset
npm run db:seed
```

#### Port Already in Use
```
Error: Port 3000 is already in use
```
**Solution**: Kill the process or use a different port:
```bash
npm run dev -- -p 3001
```

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use meaningful commit messages
- Write tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [Prisma](https://www.prisma.io/) - Next-generation ORM
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [tRPC](https://trpc.io/) - End-to-end typesafe APIs

---

<div align="center">

**Built with ❤️ by the Dayflow Team**

[⬆ Back to Top](#-dayflow---human-resource-management-system)

</div>
