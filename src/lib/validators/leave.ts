import { z } from 'zod';

export const applyLeaveSchema = z.object({
  leaveType: z.enum(['PAID', 'SICK', 'UNPAID', 'CASUAL', 'MATERNITY', 'PATERNITY']),
  startDate: z.string(),
  endDate: z.string(),
  reason: z.string().min(10, 'Please provide a detailed reason (min 10 characters)'),
});

export const reviewLeaveSchema = z.object({
  requestId: z.string().uuid(),
  status: z.enum(['APPROVED', 'REJECTED']),
  comments: z.string().optional(),
});

export type ApplyLeaveInput = z.infer<typeof applyLeaveSchema>;
export type ReviewLeaveInput = z.infer<typeof reviewLeaveSchema>;
