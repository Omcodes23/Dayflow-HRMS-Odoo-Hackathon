import { router } from '../trpc';
import { authRouter } from './auth';
import { employeeRouter } from './employee';
import { attendanceRouter } from './attendance';
import { leaveRouter } from './leave';
import { payrollRouter } from './payroll';
import { notificationRouter } from './notification';
import { dashboardRouter } from './dashboard';

export const appRouter = router({
  auth: authRouter,
  employee: employeeRouter,
  attendance: attendanceRouter,
  leave: leaveRouter,
  payroll: payrollRouter,
  notification: notificationRouter,
  dashboard: dashboardRouter,
});

export type AppRouter = typeof appRouter;
