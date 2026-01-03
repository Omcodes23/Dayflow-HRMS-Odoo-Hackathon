'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { RoleGuard } from '@/components/auth/RoleGuard';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300',
  APPROVED: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300',
  REJECTED: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300',
  CANCELLED: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
};

const leaveTypeColors: Record<string, string> = {
  PAID: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300',
  SICK: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300',
  CASUAL: 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300',
  UNPAID: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
  MATERNITY: 'bg-pink-100 dark:bg-pink-900 text-pink-700 dark:text-pink-300',
  PATERNITY: 'bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300',
};

type LeaveRequest = {
  id: string;
  leaveType: string;
  startDate: Date;
  endDate: Date;
  daysRequested: number;
  reason: string;
  status: string;
  employee: {
    firstName: string;
    lastName: string;
    user: {
      email: string;
      employeeId: string;
    };
    department: {
      departmentName: string;
    } | null;
  };
};

function AdminLeavesContent() {
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
  const [reviewAction, setReviewAction] = useState<'APPROVED' | 'REJECTED'>('APPROVED');
  const [reviewComment, setReviewComment] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const { data: leaves, isLoading, refetch } = trpc.leave.getAll.useQuery();
  const reviewLeave = trpc.leave.review.useMutation({
    onSuccess: () => {
      toast.success(`Leave request ${reviewAction.toLowerCase()} successfully!`);
      setSelectedLeave(null);
      setReviewComment('');
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleReview = () => {
    if (!selectedLeave) return;

    reviewLeave.mutate({
      requestId: selectedLeave.id,
      status: reviewAction,
      comments: reviewComment || undefined,
    });
  };

  const filteredLeaves = leaves?.filter(
    (l) => statusFilter === 'ALL' || l.status === statusFilter
  );

  const pendingCount = leaves?.filter((l) => l.status === 'PENDING').length || 0;
  const approvedCount = leaves?.filter((l) => l.status === 'APPROVED').length || 0;
  const rejectedCount = leaves?.filter((l) => l.status === 'REJECTED').length || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Leave Management</h1>
        <p className="text-muted-foreground">Review and manage employee leave requests</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Requests</p>
                <p className="text-2xl font-bold text-foreground">{leaves?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-foreground">{pendingCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold text-foreground">{approvedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Rejected</p>
                <p className="text-2xl font-bold text-foreground">{rejectedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Filter by status:</span>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Leave Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Leave Requests</CardTitle>
          <CardDescription>{filteredLeaves?.length || 0} requests found</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredLeaves?.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No leave requests found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Days</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeaves?.map((leave) => (
                  <TableRow key={leave.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {leave.employee.firstName?.[0] || ''}
                            {leave.employee.lastName?.[0] || ''}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm text-foreground">
                            {leave.employee.firstName || ''} {leave.employee.lastName || ''}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {leave.employee.department?.departmentName || 'No dept'}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={leaveTypeColors[leave.leaveType]}>
                        {leave.leaveType}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {format(new Date(leave.startDate), 'MMM d')} -{' '}
                      {format(new Date(leave.endDate), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>{leave.daysRequested}</TableCell>
                    <TableCell className="max-w-xs truncate text-sm">{leave.reason}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[leave.status]}>{leave.status}</Badge>
                    </TableCell>
                    <TableCell>
                      {leave.status === 'PENDING' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedLeave(leave as LeaveRequest)}
                        >
                          Review
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

      {/* Review Dialog */}
      <Dialog open={!!selectedLeave} onOpenChange={() => setSelectedLeave(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Leave Request</DialogTitle>
            <DialogDescription>
              {selectedLeave && (
                <>
                  {selectedLeave.employee.firstName || ''} {selectedLeave.employee.lastName || ''}{' '}
                  requested {selectedLeave.daysRequested} day(s) of {selectedLeave.leaveType} leave
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {selectedLeave && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Start Date:</span>
                  <p className="font-medium text-foreground">
                    {format(new Date(selectedLeave.startDate), 'MMM d, yyyy')}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">End Date:</span>
                  <p className="font-medium text-foreground">
                    {format(new Date(selectedLeave.endDate), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>

              <div>
                <span className="text-sm text-muted-foreground">Reason:</span>
                <p className="mt-1 p-3 bg-muted rounded-lg text-sm text-foreground">{selectedLeave.reason}</p>
              </div>

              <div className="space-y-2">
                <span className="text-sm text-muted-foreground">Decision:</span>
                <div className="flex gap-2">
                  <Button
                    variant={reviewAction === 'APPROVED' ? 'default' : 'outline'}
                    className={
                      reviewAction === 'APPROVED'
                        ? 'bg-green-600 hover:bg-green-700'
                        : ''
                    }
                    onClick={() => setReviewAction('APPROVED')}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    variant={reviewAction === 'REJECTED' ? 'default' : 'outline'}
                    className={
                      reviewAction === 'REJECTED'
                        ? 'bg-red-600 hover:bg-red-700'
                        : ''
                    }
                    onClick={() => setReviewAction('REJECTED')}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-sm text-muted-foreground">Comment (optional):</span>
                <Textarea
                  placeholder="Add a comment for the employee..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedLeave(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleReview}
              disabled={reviewLeave.isPending}
              className={
                reviewAction === 'APPROVED'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
              }
            >
              {reviewLeave.isPending
                ? 'Processing...'
                : `Confirm ${reviewAction === 'APPROVED' ? 'Approval' : 'Rejection'}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AdminLeavesPage() {
  return (
    <RoleGuard allowedRoles={['WEBSITE_ADMIN', 'COMPANY_ADMIN', 'HR']}>
      <AdminLeavesContent />
    </RoleGuard>
  );
}
