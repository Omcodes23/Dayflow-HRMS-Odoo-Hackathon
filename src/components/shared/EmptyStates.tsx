'use client';

import { Button } from '@/components/ui/button';
import {
  Inbox,
  Search,
  FileText,
  Calendar,
  Users,
  DollarSign,
  Bell,
  AlertCircle,
  PlusCircle,
  RefreshCw,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface EmptyStateProps {
  type?: 'default' | 'search' | 'no-data' | 'error' | 'no-results';
  title?: string;
  description?: string;
  icon?: 'inbox' | 'search' | 'file' | 'calendar' | 'users' | 'dollar' | 'bell' | 'alert';
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

const icons = {
  inbox: Inbox,
  search: Search,
  file: FileText,
  calendar: Calendar,
  users: Users,
  dollar: DollarSign,
  bell: Bell,
  alert: AlertCircle,
};

export function EmptyState({
  type = 'default',
  title,
  description,
  icon = 'inbox',
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
}: EmptyStateProps) {
  const Icon = icons[icon];

  const getDefaults = () => {
    switch (type) {
      case 'search':
        return {
          title: 'No results found',
          description: 'Try adjusting your search or filters to find what you\'re looking for.',
          icon: Search,
        };
      case 'no-data':
        return {
          title: 'No data yet',
          description: 'Get started by adding your first item.',
          icon: Inbox,
        };
      case 'error':
        return {
          title: 'Something went wrong',
          description: 'An error occurred while loading the data. Please try again.',
          icon: AlertCircle,
        };
      case 'no-results':
        return {
          title: 'Nothing here yet',
          description: 'When you have items, they will appear here.',
          icon: FileText,
        };
      default:
        return {
          title: 'No items',
          description: 'There are no items to display.',
          icon: Inbox,
        };
    }
  };

  const defaults = getDefaults();
  const FinalIcon = Icon || defaults.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-12 px-4 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="h-20 w-20 bg-muted rounded-full flex items-center justify-center mb-6"
      >
        <FinalIcon className="h-10 w-10 text-muted-foreground" />
      </motion.div>

      <h3 className="text-xl font-semibold mb-2">
        {title || defaults.title}
      </h3>
      
      <p className="text-muted-foreground max-w-md mb-6">
        {description || defaults.description}
      </p>

      {(actionLabel || secondaryActionLabel) && (
        <div className="flex gap-3">
          {actionLabel && onAction && (
            <Button onClick={onAction}>
              <PlusCircle className="h-4 w-4 mr-2" />
              {actionLabel}
            </Button>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <Button variant="outline" onClick={onSecondaryAction}>
              <RefreshCw className="h-4 w-4 mr-2" />
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      )}
    </motion.div>
  );
}

// Pre-configured empty states for common use cases
export function NoDataEmptyState({ onAction }: { onAction?: () => void }) {
  return (
    <EmptyState
      type="no-data"
      title="No data available"
      description="There's no data to display yet. Data will appear here once available."
      icon="inbox"
      actionLabel={onAction ? "Refresh" : undefined}
      onAction={onAction}
    />
  );
}

export function SearchEmptyState({ query }: { query?: string }) {
  return (
    <EmptyState
      type="search"
      title="No results found"
      description={query ? `No results found for "${query}". Try different keywords.` : 'Try adjusting your search filters.'}
      icon="search"
    />
  );
}

export function ErrorEmptyState({ onRetry }: { onRetry?: () => void }) {
  return (
    <EmptyState
      type="error"
      title="Failed to load data"
      description="We couldn't load the data. Please check your connection and try again."
      icon="alert"
      actionLabel="Try Again"
      onAction={onRetry}
    />
  );
}

export function NoNotificationsEmptyState() {
  return (
    <EmptyState
      title="All caught up!"
      description="You have no new notifications."
      icon="bell"
    />
  );
}

export function NoEmployeesEmptyState({ onAdd }: { onAdd?: () => void }) {
  return (
    <EmptyState
      title="No employees found"
      description="Add your first employee to get started with managing your team."
      icon="users"
      actionLabel="Add Employee"
      onAction={onAdd}
    />
  );
}

export function NoLeavesEmptyState() {
  return (
    <EmptyState
      title="No leave requests"
      description="You haven't made any leave requests yet. Apply for leave to see them here."
      icon="calendar"
    />
  );
}

export function NoPendingLeavesEmptyState() {
  return (
    <EmptyState
      title="No pending requests"
      description="There are no leave requests waiting for your approval."
      icon="calendar"
    />
  );
}

export function NoAttendanceEmptyState() {
  return (
    <EmptyState
      title="No attendance records"
      description="You haven't checked in yet today. Start your day by checking in."
      icon="calendar"
    />
  );
}
