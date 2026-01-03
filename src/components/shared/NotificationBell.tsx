'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Bell,
  Check,
  CheckCheck,
  Calendar,
  DollarSign,
  User,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

const notificationIcons: Record<string, any> = {
  LEAVE_APPROVED: CheckCircle2,
  LEAVE_REJECTED: XCircle,
  ATTENDANCE_ALERT: Clock,
  PAYROLL_GENERATED: DollarSign,
  PROFILE_UPDATED: User,
  SYSTEM_ALERT: AlertCircle,
};

const notificationColors: Record<string, string> = {
  LEAVE_APPROVED: 'text-green-600 bg-green-100',
  LEAVE_REJECTED: 'text-red-600 bg-red-100',
  ATTENDANCE_ALERT: 'text-orange-600 bg-orange-100',
  PAYROLL_GENERATED: 'text-blue-600 bg-blue-100',
  PROFILE_UPDATED: 'text-purple-600 bg-purple-100',
  SYSTEM_ALERT: 'text-gray-600 bg-gray-100',
};

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);

  const { data: notifications, refetch } = trpc.notification.getAll.useQuery(undefined, {
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const markAsReadMutation = trpc.notification.markAsRead.useMutation({
    onSuccess: () => refetch(),
  });

  const markAllAsReadMutation = trpc.notification.markAllAsRead.useMutation({
    onSuccess: () => refetch(),
  });

  const unreadCount = notifications?.filter((n: Notification) => !n.isRead).length || 0;

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsReadMutation.mutate({ notificationId: notification.id });
    }
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-1 -right-1"
              >
                <Badge
                  variant="destructive"
                  className="h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between p-3">
          <DropdownMenuLabel className="p-0 font-semibold">Notifications</DropdownMenuLabel>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto py-1 px-2 text-xs"
              onClick={() => markAllAsReadMutation.mutate()}
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Mark all as read
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[400px]">
          {notifications && notifications.length > 0 ? (
            <div className="space-y-1 p-1">
              {notifications.map((notification: Notification) => {
                const Icon = notificationIcons[notification.type] || Bell;
                const colorClass = notificationColors[notification.type] || 'text-gray-600 bg-gray-100';

                return (
                  <DropdownMenuItem
                    key={notification.id}
                    className={`flex gap-3 p-3 cursor-pointer ${!notification.isRead ? 'bg-blue-50/50' : ''}`}
                    onClick={() => handleNotificationClick(notification)}
                    asChild={!!notification.link}
                  >
                    {notification.link ? (
                      <Link href={notification.link}>
                        <NotificationContent
                          notification={notification}
                          Icon={Icon}
                          colorClass={colorClass}
                        />
                      </Link>
                    ) : (
                      <NotificationContent
                        notification={notification}
                        Icon={Icon}
                        colorClass={colorClass}
                      />
                    )}
                  </DropdownMenuItem>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Bell className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No notifications yet</p>
            </div>
          )}
        </ScrollArea>
        {notifications && notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Button variant="ghost" className="w-full" asChild>
                <Link href="/notifications">View all notifications</Link>
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function NotificationContent({
  notification,
  Icon,
  colorClass,
}: {
  notification: Notification;
  Icon: any;
  colorClass: string;
}) {
  return (
    <>
      <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium line-clamp-1 ${!notification.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
          {notification.title}
        </p>
        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
          {notification.message}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
        </p>
      </div>
      {!notification.isRead && (
        <div className="h-2 w-2 bg-blue-500 rounded-full flex-shrink-0" />
      )}
    </>
  );
}
