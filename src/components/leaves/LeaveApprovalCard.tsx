'use client';

import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  User,
  FileText,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

interface LeaveRequest {
  id: string;
  employee: {
    firstName: string;
    lastName: string;
    profilePictureUrl?: string;
    department?: {
      departmentName: string;
    };
    designation?: {
      designationName: string;
    };
  };
  leaveType: string;
  startDate: string;
  endDate: string;
  daysRequested: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  createdAt: string;
  attachmentUrl?: string;
}

interface LeaveApprovalCardProps {
  request: LeaveRequest;
  onAction?: () => void;
}

const leaveTypeColors: Record<string, string> = {
  PAID: 'bg-green-100 text-green-800',
  SICK: 'bg-red-100 text-red-800',
  CASUAL: 'bg-orange-100 text-orange-800',
  UNPAID: 'bg-gray-100 text-gray-800',
  MATERNITY: 'bg-pink-100 text-pink-800',
  PATERNITY: 'bg-blue-100 text-blue-800',
};

export function LeaveApprovalCard({ request, onAction }: LeaveApprovalCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [action, setAction] = useState<'APPROVED' | 'REJECTED'>('APPROVED');
  const [comments, setComments] = useState('');

  const reviewMutation = trpc.leave.review.useMutation({
    onSuccess: () => {
      toast.success(`Leave ${action.toLowerCase()} successfully!`);
      setIsDialogOpen(false);
      setComments('');
      onAction?.();
    },
    onError: (error) => {
      toast.error('Failed to process leave request', {
        description: error.message,
      });
    },
  });

  const handleAction = (selectedAction: 'APPROVED' | 'REJECTED') => {
    setAction(selectedAction);
    setIsDialogOpen(true);
  };

  const confirmAction = () => {
    reviewMutation.mutate({
      requestId: request.id,
      status: action,
      comments: comments || undefined,
    });
  };

  const initials = `${request.employee.firstName?.[0] || ''}${request.employee.lastName?.[0] || ''}`;
  const daysDiff = differenceInDays(new Date(request.endDate), new Date(request.startDate)) + 1;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="overflow-hidden hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 border-2 border-white shadow">
                  <AvatarImage src={request.employee.profilePictureUrl} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-base">
                    {request.employee.firstName} {request.employee.lastName}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {request.employee.designation?.designationName || 'Employee'} • {request.employee.department?.departmentName || 'Unknown Dept'}
                  </p>
                </div>
              </div>
              <Badge className={leaveTypeColors[request.leaveType] || 'bg-gray-100'}>
                {request.leaveType}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Date Range */}
            <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {format(new Date(request.startDate), 'MMM d, yyyy')}
                  </span>
                  <span className="text-muted-foreground">→</span>
                  <span className="text-sm font-medium">
                    {format(new Date(request.endDate), 'MMM d, yyyy')}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {request.daysRequested} day{request.daysRequested > 1 ? 's' : ''} requested
                </p>
              </div>
            </div>

            {/* Reason */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                <span>Reason</span>
              </div>
              <p className="text-sm bg-muted/30 p-3 rounded-lg line-clamp-2">
                {request.reason}
              </p>
            </div>

            {/* Request Time */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>Requested {format(new Date(request.createdAt), 'MMM d, yyyy \'at\' hh:mm a')}</span>
            </div>
          </CardContent>

          <CardFooter className="bg-muted/30 pt-4 gap-3">
            <Button
              variant="outline"
              className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={() => handleAction('REJECTED')}
              disabled={reviewMutation.isPending}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
            <Button
              className="flex-1 bg-green-600 hover:bg-green-700"
              onClick={() => handleAction('APPROVED')}
              disabled={reviewMutation.isPending}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Approve
            </Button>
          </CardFooter>
        </Card>
      </motion.div>

      {/* Confirmation Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {action === 'APPROVED' ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  Approve Leave Request
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-red-600" />
                  Reject Leave Request
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {action === 'APPROVED'
                ? `Are you sure you want to approve ${request.daysRequested} day(s) of ${request.leaveType.toLowerCase()} leave for ${request.employee.firstName} ${request.employee.lastName}?`
                : `Please provide a reason for rejecting this leave request.`}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Textarea
              placeholder={action === 'APPROVED' ? 'Add a comment (optional)' : 'Reason for rejection (required)'}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={reviewMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant={action === 'APPROVED' ? 'default' : 'destructive'}
              onClick={confirmAction}
              disabled={reviewMutation.isPending || (action === 'REJECTED' && !comments.trim())}
              className={action === 'APPROVED' ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              {reviewMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : action === 'APPROVED' ? (
                <CheckCircle2 className="h-4 w-4 mr-2" />
              ) : (
                <XCircle className="h-4 w-4 mr-2" />
              )}
              {action === 'APPROVED' ? 'Approve' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

interface LeaveApprovalListProps {
  requests: LeaveRequest[];
  onAction?: () => void;
}

export function LeaveApprovalList({ requests, onAction }: LeaveApprovalListProps) {
  if (requests.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-12"
      >
        <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium">All Caught Up!</h3>
        <p className="text-muted-foreground">No pending leave requests to review</p>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <AnimatePresence>
        {requests.map((request, index) => (
          <motion.div
            key={request.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ delay: index * 0.1 }}
          >
            <LeaveApprovalCard request={request} onAction={onAction} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
