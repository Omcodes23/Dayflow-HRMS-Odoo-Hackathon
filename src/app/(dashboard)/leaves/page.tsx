'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { trpc } from '@/lib/trpc';
import { applyLeaveSchema, type ApplyLeaveInput } from '@/lib/validators/leave';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Calendar, Plus, AlertCircle, CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { toast } from 'sonner';
import Link from 'next/link';

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  CANCELLED: 'bg-gray-100 text-gray-700',
};

const leaveTypeColors: Record<string, string> = {
  PAID: 'bg-blue-100 text-blue-700',
  SICK: 'bg-red-100 text-red-700',
  CASUAL: 'bg-purple-100 text-purple-700',
  UNPAID: 'bg-gray-100 text-gray-700',
  MATERNITY: 'bg-pink-100 text-pink-700',
  PATERNITY: 'bg-teal-100 text-teal-700',
};

export default function LeavesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: balances, isLoading: loadingBalances } = trpc.leave.getMyBalances.useQuery();
  const { data: leaves, isLoading: loadingLeaves, refetch } = trpc.leave.getMyLeaves.useQuery();
  const utils = trpc.useUtils();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ApplyLeaveInput>({
    resolver: zodResolver(applyLeaveSchema),
  });

  const applyMutation = trpc.leave.applyLeave.useMutation({
    onSuccess: () => {
      toast.success('Leave request submitted successfully');
      setIsDialogOpen(false);
      reset();
      refetch();
      utils.leave.getMyBalances.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const cancelMutation = trpc.leave.cancel.useMutation({
    onSuccess: () => {
      toast.success('Leave request cancelled');
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const startDate = watch('startDate');
  const endDate = watch('endDate');
  const daysRequested =
    startDate && endDate
      ? Math.max(1, differenceInDays(new Date(endDate), new Date(startDate)) + 1)
      : 0;

  const onSubmit = (data: ApplyLeaveInput) => {
    applyMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leave Management</h1>
          <p className="text-gray-500">Apply for leave and track your requests</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Apply Leave
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Apply for Leave</DialogTitle>
              <DialogDescription>Submit a new leave request</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label>Leave Type</Label>
                <Select onValueChange={(value) => setValue('leaveType', value as ApplyLeaveInput['leaveType'])}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select leave type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PAID">Paid Leave</SelectItem>
                    <SelectItem value="SICK">Sick Leave</SelectItem>
                    <SelectItem value="CASUAL">Casual Leave</SelectItem>
                    <SelectItem value="UNPAID">Unpaid Leave</SelectItem>
                  </SelectContent>
                </Select>
                {errors.leaveType && (
                  <p className="text-sm text-red-500">{errors.leaveType.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input id="startDate" type="date" {...register('startDate')} />
                  {errors.startDate && (
                    <p className="text-sm text-red-500">{errors.startDate.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input id="endDate" type="date" {...register('endDate')} />
                  {errors.endDate && (
                    <p className="text-sm text-red-500">{errors.endDate.message}</p>
                  )}
                </div>
              </div>

              {daysRequested > 0 && (
                <p className="text-sm text-gray-600">
                  Requesting <span className="font-semibold">{daysRequested}</span> day(s)
                </p>
              )}

              <div className="space-y-2">
                <Label htmlFor="reason">Reason</Label>
                <Textarea
                  id="reason"
                  rows={3}
                  placeholder="Please provide a reason for your leave..."
                  {...register('reason')}
                />
                {errors.reason && (
                  <p className="text-sm text-red-500">{errors.reason.message}</p>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={applyMutation.isPending}>
                  {applyMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Request'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Leave Balance Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {loadingBalances ? (
          [...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))
        ) : (
          balances?.map((balance) => {
            const percentage = (balance.remaining / balance.totalAllocated) * 100;
            return (
              <Card key={balance.leaveType}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={leaveTypeColors[balance.leaveType]}>{balance.leaveType}</Badge>
                    <span className="text-sm text-gray-500">
                      {balance.used} / {balance.totalAllocated}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{balance.remaining}</p>
                  <p className="text-sm text-gray-500">days remaining</p>
                  <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        percentage > 50
                          ? 'bg-green-500'
                          : percentage > 25
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Leave Requests Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>My Leave Requests</CardTitle>
            <CardDescription>View and manage your leave applications</CardDescription>
          </div>
          <Link href="/leaves/history">
            <Button variant="outline" size="sm">
              View All History
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {loadingLeaves ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : leaves?.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No leave requests yet</p>
              <Button className="mt-4" onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Apply for Leave
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Days</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaves?.slice(0, 10).map((leave) => (
                  <TableRow key={leave.id}>
                    <TableCell>
                      <Badge className={leaveTypeColors[leave.leaveType]}>{leave.leaveType}</Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(leave.startDate), 'MMM d')} -{' '}
                      {format(new Date(leave.endDate), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>{leave.daysRequested}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[leave.status]}>{leave.status}</Badge>
                    </TableCell>
                    <TableCell>
                      {leave.status === 'PENDING' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => cancelMutation.mutate({ requestId: leave.id })}
                          disabled={cancelMutation.isPending}
                        >
                          Cancel
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
