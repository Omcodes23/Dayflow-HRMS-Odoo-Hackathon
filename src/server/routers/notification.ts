import { router, protectedProcedure } from '../trpc';
import { z } from 'zod';

export const notificationRouter = router({
  // Get my notifications
  getAll: protectedProcedure
    .input(
      z
        .object({
          unreadOnly: z.boolean().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const notifications = await ctx.prisma.notification.findMany({
        where: {
          userId: ctx.user.id,
          ...(input?.unreadOnly && { isRead: false }),
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });

      return notifications;
    }),

  // Get unread count
  getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
    const count = await ctx.prisma.notification.count({
      where: {
        userId: ctx.user.id,
        isRead: false,
      },
    });

    return count;
  }),

  // Mark as read
  markAsRead: protectedProcedure
    .input(z.object({ notificationId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.notification.update({
        where: {
          id: input.notificationId,
          userId: ctx.user.id,
        },
        data: { isRead: true },
      });

      return { success: true };
    }),

  // Mark all as read
  markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.prisma.notification.updateMany({
      where: {
        userId: ctx.user.id,
        isRead: false,
      },
      data: { isRead: true },
    });

    return { success: true };
  }),
});
