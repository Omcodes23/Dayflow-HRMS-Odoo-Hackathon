'use client';

import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

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

export default function LeaveHistoryPage() {
  const { data: leaves, isLoading } = trpc.leave.getMyLeaves.useQuery();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/leaves">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leave History</h1>
          <p className="text-gray-500">View all your leave requests</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Leave Requests</CardTitle>
          <CardDescription>Complete history of your leave applications</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : leaves?.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No leave requests found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Days</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reviewed By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaves?.map((leave) => (
                  <TableRow key={leave.id}>
                    <TableCell>
                      <Badge className={leaveTypeColors[leave.leaveType]}>{leave.leaveType}</Badge>
                    </TableCell>
                    <TableCell>{format(new Date(leave.startDate), 'MMM d, yyyy')}</TableCell>
                    <TableCell>{format(new Date(leave.endDate), 'MMM d, yyyy')}</TableCell>
                    <TableCell>{leave.daysRequested}</TableCell>
                    <TableCell className="max-w-xs truncate">{leave.reason}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[leave.status]}>{leave.status}</Badge>
                    </TableCell>
                    <TableCell>
                      {leave.reviewedBy ? leave.reviewedBy.email : '-'}
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
