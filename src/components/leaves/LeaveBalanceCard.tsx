'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Palmtree,
  HeartPulse,
  Coffee,
  Wallet,
  Baby,
  Heart,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface LeaveBalance {
  leaveType: string;
  totalAllocated: number;
  used: number;
  remaining: number;
  carriedForward?: number;
}

interface LeaveBalanceCardProps {
  balance: LeaveBalance;
  variant?: 'default' | 'compact';
}

const leaveTypeConfig = {
  PAID: {
    icon: Palmtree,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    progressColor: 'bg-green-500',
    label: 'Paid Leave',
  },
  SICK: {
    icon: HeartPulse,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    progressColor: 'bg-red-500',
    label: 'Sick Leave',
  },
  CASUAL: {
    icon: Coffee,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    progressColor: 'bg-orange-500',
    label: 'Casual Leave',
  },
  UNPAID: {
    icon: Wallet,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    progressColor: 'bg-gray-500',
    label: 'Unpaid Leave',
  },
  MATERNITY: {
    icon: Baby,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    progressColor: 'bg-pink-500',
    label: 'Maternity Leave',
  },
  PATERNITY: {
    icon: Heart,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    progressColor: 'bg-blue-500',
    label: 'Paternity Leave',
  },
};

export function LeaveBalanceCard({ balance, variant = 'default' }: LeaveBalanceCardProps) {
  const config = leaveTypeConfig[balance.leaveType as keyof typeof leaveTypeConfig] || {
    icon: Palmtree,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    progressColor: 'bg-gray-500',
    label: balance.leaveType,
  };

  const Icon = config.icon;
  const usedPercentage = balance.totalAllocated > 0 
    ? (balance.used / balance.totalAllocated) * 100 
    : 0;

  if (variant === 'compact') {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        className={`flex items-center justify-between p-4 rounded-lg ${config.bgColor} border`}
      >
        <div className="flex items-center gap-3">
          <Icon className={`h-5 w-5 ${config.color}`} />
          <span className="font-medium text-sm">{config.label}</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="font-bold">
            {balance.remaining}
          </Badge>
          <span className="text-xs text-muted-foreground">/ {balance.totalAllocated}</span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="overflow-hidden">
        <CardHeader className={`pb-2 ${config.bgColor}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-lg bg-white/80 ${config.color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <CardTitle className="text-base">{config.label}</CardTitle>
            </div>
            <Badge
              variant={balance.remaining <= 2 ? 'destructive' : 'secondary'}
              className="text-lg font-bold px-3 py-1"
            >
              {balance.remaining}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-3">
            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{balance.used} used</span>
                <span>{balance.remaining} remaining</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className={`h-full ${config.progressColor}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${usedPercentage}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
            </div>

            {/* Stats */}
            <div className="flex justify-between pt-2 border-t">
              <div className="text-center">
                <p className="text-lg font-bold">{balance.totalAllocated}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-orange-600">{balance.used}</p>
                <p className="text-xs text-muted-foreground">Used</p>
              </div>
              <div className="text-center">
                <p className={`text-lg font-bold ${balance.remaining <= 2 ? 'text-red-600' : 'text-green-600'}`}>
                  {balance.remaining}
                </p>
                <p className="text-xs text-muted-foreground">Available</p>
              </div>
            </div>

            {/* Carried Forward */}
            {balance.carriedForward && balance.carriedForward > 0 && (
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded py-1">
                <span>+{balance.carriedForward} carried forward</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface LeaveBalanceGridProps {
  balances: LeaveBalance[];
}

export function LeaveBalanceGrid({ balances }: LeaveBalanceGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {balances.map((balance, index) => (
        <motion.div
          key={balance.leaveType}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <LeaveBalanceCard balance={balance} />
        </motion.div>
      ))}
    </div>
  );
}
