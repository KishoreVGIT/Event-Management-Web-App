'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card';
import { useAuth } from '@/lib/auth-context';
import { API_URL } from '@/lib/constants';
import { CalendarHeader } from '@/components/calendar/CalendarHeader';
import { MonthNavigation } from '@/components/calendar/MonthNavigation';
import { CalendarGrid } from '@/components/calendar/CalendarGrid';
import { MonthEventsList } from '@/components/calendar/MonthEventsList';

export default function EventsCalendarPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch(`${API_URL}/api/events`);
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const getEventsForDay = (day) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const dayDate = new Date(year, month, day);
    dayDate.setHours(0, 0, 0, 0);

    return events.filter((event) => {
      if (!event.startDate) return false;
      const eventDate = new Date(event.startDate);
      eventDate.setHours(0, 0, 0, 0);
      return eventDate.getTime() === dayDate.getTime();
    });
  };

  const previousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const days = [];
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }
  // Add cells for each day of the month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-full border-4 border-slate-700 border-t-blue-500 animate-spin" />
          <p className="text-sm font-medium text-slate-300">
            Loading calendar...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
      {/* Background Pattern */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-10" />

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <CalendarHeader />

        <Card className="bg-slate-950/70 border-slate-800/70 backdrop-blur-xl rounded-2xl shadow-2xl shadow-blue-900/20">
          <CardHeader className="border-b border-slate-800/70">
            <MonthNavigation
              monthName={monthName}
              onPrev={previousMonth}
              onNext={nextMonth}
              onToday={goToToday}
            />
          </CardHeader>
          <CardContent className="p-6">
            <CalendarGrid
              days={days}
              getEventsForDay={getEventsForDay}
              currentDate={currentDate}
            />

            <MonthEventsList
              events={events}
              currentDate={currentDate}
              monthName={monthName}
            />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
