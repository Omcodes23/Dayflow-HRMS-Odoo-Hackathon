'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  getDay,
} from 'date-fns';
import { motion } from 'framer-motion';

interface AttendanceRecord {
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'LEAVE' | 'HOLIDAY' | 'WEEKEND';
  checkIn?: string;
  checkOut?: string;
  workHours?: number;
}

interface AttendanceCalendarProps {
  attendanceData?: AttendanceRecord[];
  onDateSelect?: (date: Date) => void;
}

export function AttendanceCalendar({ attendanceData = [], onDateSelect }: AttendanceCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get day of week for first day (0 = Sunday)
  const startDayOfWeek = getDay(monthStart);

  // Create array with empty slots for proper calendar alignment
  const calendarDays = Array(startDayOfWeek).fill(null).concat(days);

  const getAttendanceForDate = (date: Date): AttendanceRecord | undefined => {
    return attendanceData.find((a) => isSameDay(new Date(a.date), date));
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'PRESENT':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'ABSENT':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'HALF_DAY':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'LEAVE':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'HOLIDAY':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'WEEKEND':
        return 'bg-gray-100 text-gray-500 border-gray-200';
      default:
        return 'bg-white border-gray-200';
    }
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Attendance Calendar</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="min-w-[140px] text-center font-medium">
              {format(currentMonth, 'MMMM yyyy')}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Week day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center text-sm font-medium text-muted-foreground py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => {
            if (!day) {
              return <div key={`empty-${index}`} className="aspect-square" />;
            }

            const attendance = getAttendanceForDate(day);
            const isCurrentDay = isToday(day);
            const isWeekend = getDay(day) === 0 || getDay(day) === 6;

            return (
              <motion.button
                key={day.toISOString()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onDateSelect?.(day)}
                className={`
                  aspect-square rounded-lg border-2 p-1 transition-all
                  ${getStatusColor(attendance?.status || (isWeekend ? 'WEEKEND' : undefined))}
                  ${isCurrentDay ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
                  hover:shadow-md cursor-pointer
                `}
              >
                <div className="flex flex-col items-center justify-center h-full">
                  <span className={`text-sm font-medium ${isCurrentDay ? 'text-blue-600' : ''}`}>
                    {format(day, 'd')}
                  </span>
                  {attendance?.workHours && (
                    <span className="text-xs text-muted-foreground">
                      {attendance.workHours.toFixed(1)}h
                    </span>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-green-500" />
            <span className="text-xs text-muted-foreground">Present</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500" />
            <span className="text-xs text-muted-foreground">Absent</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-yellow-500" />
            <span className="text-xs text-muted-foreground">Half Day</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-purple-500" />
            <span className="text-xs text-muted-foreground">Leave</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-blue-500" />
            <span className="text-xs text-muted-foreground">Holiday</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
