'use client';

import { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  LogIn,
  LogOut,
  Clock,
  MapPin,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

interface CheckInButtonProps {
  onSuccess?: () => void;
}

export function CheckInButton({ onSuccess }: CheckInButtonProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [location, setLocation] = useState<string | null>(null);

  const { data: todayAttendance, refetch } = trpc.attendance.getToday.useQuery();

  const checkInMutation = trpc.attendance.checkIn.useMutation({
    onSuccess: () => {
      toast.success('Checked in successfully!', {
        description: `You checked in at ${format(new Date(), 'hh:mm a')}`,
        icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
      });
      refetch();
      onSuccess?.();
    },
    onError: (error) => {
      toast.error('Check-in failed', {
        description: error.message,
        icon: <AlertCircle className="h-4 w-4 text-red-500" />,
      });
    },
  });

  const checkOutMutation = trpc.attendance.checkOut.useMutation({
    onSuccess: () => {
      toast.success('Checked out successfully!', {
        description: `You checked out at ${format(new Date(), 'hh:mm a')}`,
        icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
      });
      refetch();
      onSuccess?.();
    },
    onError: (error) => {
      toast.error('Check-out failed', {
        description: error.message,
        icon: <AlertCircle className="h-4 w-4 text-red-500" />,
      });
    },
  });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const response = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&localityLanguage=en`
            );
            const data = await response.json();
            setLocation(data.city || data.locality || 'Unknown location');
          } catch {
            setLocation('Location detected');
          }
        },
        () => setLocation('Location unavailable'),
        { enableHighAccuracy: true }
      );
    }
  }, []);

  const hasCheckedIn = !!todayAttendance?.checkIn;
  const hasCheckedOut = !!todayAttendance?.checkOut;
  const isLoading = checkInMutation.isPending || checkOutMutation.isPending;

  const handleCheckIn = () => {
    checkInMutation.mutate({ location: location || undefined });
  };

  const handleCheckOut = () => {
    checkOutMutation.mutate({});
  };

  const getWorkDuration = () => {
    if (!todayAttendance?.checkIn) return null;
    const checkInTime = new Date(todayAttendance.checkIn);
    const now = todayAttendance.checkOut ? new Date(todayAttendance.checkOut) : new Date();
    const diff = now.getTime() - checkInTime.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        {/* Time Display */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
          <motion.div
            className="text-center"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <p className="text-blue-100 text-sm mb-1">Current Time</p>
            <h2 className="text-4xl font-bold tracking-tight">
              {format(currentTime, 'hh:mm:ss')}
            </h2>
            <p className="text-blue-200 mt-1">{format(currentTime, 'a')}</p>
            <p className="text-blue-100 text-sm mt-2">
              {format(currentTime, 'EEEE, MMMM d, yyyy')}
            </p>
          </motion.div>
        </div>

        {/* Status & Action */}
        <div className="p-6 space-y-4">
          {/* Current Status */}
          <AnimatePresence mode="wait">
            {todayAttendance && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                    hasCheckedOut ? 'bg-gray-100' : hasCheckedIn ? 'bg-green-100' : 'bg-orange-100'
                  }`}>
                    <Clock className={`h-5 w-5 ${
                      hasCheckedOut ? 'text-gray-600' : hasCheckedIn ? 'text-green-600' : 'text-orange-600'
                    }`} />
                  </div>
                  <div>
                    <p className="font-medium">
                      {hasCheckedOut ? 'Day Complete' : hasCheckedIn ? 'Currently Working' : 'Not Checked In'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {hasCheckedIn && todayAttendance.checkIn && (
                        <>In: {format(new Date(todayAttendance.checkIn), 'hh:mm a')}</>
                      )}
                      {hasCheckedOut && todayAttendance.checkOut && (
                        <> • Out: {format(new Date(todayAttendance.checkOut), 'hh:mm a')}</>
                      )}
                    </p>
                  </div>
                </div>
                {hasCheckedIn && (
                  <Badge variant={hasCheckedOut ? 'secondary' : 'default'} className={!hasCheckedOut ? 'bg-green-100 text-green-800' : ''}>
                    {getWorkDuration()}
                  </Badge>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Location */}
          {location && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{location}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {!hasCheckedIn ? (
              <Button
                onClick={handleCheckIn}
                disabled={isLoading}
                className="flex-1 bg-green-600 hover:bg-green-700"
                size="lg"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                ) : (
                  <LogIn className="h-5 w-5 mr-2" />
                )}
                Check In
              </Button>
            ) : !hasCheckedOut ? (
              <Button
                onClick={handleCheckOut}
                disabled={isLoading}
                variant="destructive"
                className="flex-1"
                size="lg"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                ) : (
                  <LogOut className="h-5 w-5 mr-2" />
                )}
                Check Out
              </Button>
            ) : (
              <Button disabled className="flex-1" size="lg" variant="secondary">
                <CheckCircle2 className="h-5 w-5 mr-2" />
                Day Complete
              </Button>
            )}
          </div>

          {/* Today's Status Badge */}
          {todayAttendance && (
            <div className="flex justify-center">
              <Badge
                variant={
                  todayAttendance.status === 'PRESENT'
                    ? 'default'
                    : todayAttendance.status === 'HALF_DAY'
                    ? 'secondary'
                    : 'destructive'
                }
                className={
                  todayAttendance.status === 'PRESENT'
                    ? 'bg-green-100 text-green-800'
                    : ''
                }
              >
                Status: {todayAttendance.status?.replace('_', ' ')}
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
