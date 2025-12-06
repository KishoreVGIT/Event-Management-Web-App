'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth-context';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, List } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

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
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const days = [];
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }
  // Add cells for each day of the month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-full border-4 border-slate-700 border-t-blue-500 animate-spin" />
          <p className="text-sm font-medium text-slate-300">Loading calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
      {/* Background Pattern */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-10" />

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-50 flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/30 rounded-xl flex items-center justify-center">
                  <CalendarIcon className="w-6 h-6 text-blue-400" />
                </div>
                Events Calendar
              </h1>
              <p className="text-slate-400">View all campus events in calendar format</p>
            </div>
            <Link href="/events">
              <Button
                variant="outline"
                className="border-slate-700 text-slate-300 bg-slate-950/70 hover:bg-slate-900 hover:border-slate-600 hover:text-slate-100 rounded-full">
                <List className="w-4 h-4 mr-2" />
                List View
              </Button>
            </Link>
          </div>
        </div>

        <Card className="bg-slate-950/70 border-slate-800/70 backdrop-blur-xl rounded-2xl shadow-2xl shadow-blue-900/20">
          <CardHeader className="border-b border-slate-800/70">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle className="text-slate-50 text-lg">
                {monthName}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={goToToday}
                  size="sm"
                  className="border-slate-700 text-slate-300 bg-slate-950/70 hover:bg-slate-900 hover:border-slate-600 hover:text-slate-100 rounded-full">
                  Today
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={previousMonth}
                  className="border-slate-700 text-slate-300 bg-slate-950/70 hover:bg-slate-900 hover:border-slate-600 hover:text-slate-100 rounded-full w-9 h-9 p-0">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={nextMonth}
                  className="border-slate-700 text-slate-300 bg-slate-950/70 hover:bg-slate-900 hover:border-slate-600 hover:text-slate-100 rounded-full w-9 h-9 p-0">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-7 gap-2">
              {/* Day headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div
                  key={day}
                  className="p-2 text-center font-semibold text-slate-400 text-sm">
                  {day}
                </div>
              ))}

              {/* Calendar days */}
              {days.map((day, index) => {
                if (day === null) {
                  return <div key={`empty-${index}`} className="p-2 min-h-[120px]" />;
                }

                const dayEvents = getEventsForDay(day);
                const currentDateObj = new Date(
                  currentDate.getFullYear(),
                  currentDate.getMonth(),
                  day
                );
                currentDateObj.setHours(0, 0, 0, 0);
                const isToday = currentDateObj.getTime() === today.getTime();

                return (
                  <div
                    key={day}
                    className={`p-2 min-h-[120px] border rounded-xl transition-all ${
                      isToday
                        ? 'bg-blue-500/10 border-blue-500/30 shadow-lg shadow-blue-900/20'
                        : 'bg-slate-900/30 border-slate-800/50 hover:border-slate-700'
                    }`}>
                    <div
                      className={`text-sm font-semibold mb-2 ${
                        isToday ? 'text-blue-400' : 'text-slate-300'
                      }`}>
                      {day}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 3).map((event) => (
                        <Link
                          key={event.id}
                          href={`/events/${event.id}`}
                          className="block">
                          <div className="text-xs p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors truncate shadow-sm">
                            {event.title}
                          </div>
                        </Link>
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="text-xs text-slate-400 pl-1">
                          +{dayEvents.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Events list for selected month */}
            <div className="mt-8 pt-8 border-t border-slate-800/70">
              <h3 className="text-lg font-semibold mb-4 text-slate-50 flex items-center gap-2">
                <List className="w-5 h-5 text-blue-400" />
                All Events in {monthName}
              </h3>
              <div className="space-y-3">
                {events
                  .filter((event) => {
                    if (!event.startDate) return false;
                    const eventDate = new Date(event.startDate);
                    return (
                      eventDate.getMonth() === currentDate.getMonth() &&
                      eventDate.getFullYear() === currentDate.getFullYear()
                    );
                  })
                  .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
                  .map((event) => (
                    <Link key={event.id} href={`/events/${event.id}`}>
                      <div className="p-4 border border-slate-800/50 rounded-xl hover:bg-slate-900/50 hover:border-slate-700 transition-all cursor-pointer group">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <h4 className="font-semibold text-slate-50 group-hover:text-blue-400 transition-colors">
                              {event.title}
                            </h4>
                            <p className="text-sm text-slate-400 mt-1">
                              {new Date(event.startDate).toLocaleDateString('en-US', {
                                weekday: 'long',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                            {event.location && (
                              <p className="text-sm text-slate-500 mt-1">{event.location}</p>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            {event.category && (
                              <span className="px-3 py-1 text-xs font-medium bg-blue-500/10 border border-blue-500/30 text-blue-300 rounded-full">
                                {event.category}
                              </span>
                            )}
                            <span className="text-sm text-slate-400">
                              {event.attendeeCount}{' '}
                              {event.capacity ? `/ ${event.capacity}` : ''} attending
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                {events.filter((event) => {
                  if (!event.startDate) return false;
                  const eventDate = new Date(event.startDate);
                  return (
                    eventDate.getMonth() === currentDate.getMonth() &&
                    eventDate.getFullYear() === currentDate.getFullYear()
                  );
                }).length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-slate-900/60 border border-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-4">
                      <CalendarIcon className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-slate-400">No events scheduled for this month</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
