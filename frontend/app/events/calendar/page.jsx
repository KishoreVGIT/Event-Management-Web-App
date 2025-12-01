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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white cursor-pointer">
                  Campus Connect
                </h1>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/events">
                <Button variant="outline">
                  <List className="w-4 h-4 mr-2" />
                  List View
                </Button>
              </Link>
              {user && user.role === 'organizer' && (
                <Link href="/organizer/dashboard">
                  <Button>Organizer Dashboard</Button>
                </Link>
              )}
              {!user ? (
                <>
                  <Link href="/signin">
                    <Button variant="outline">Sign In</Button>
                  </Link>
                  <Link href="/signup">
                    <Button>Sign Up</Button>
                  </Link>
                </>
              ) : (
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  Welcome, {user.name}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="w-6 h-6" />
                Events Calendar
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={goToToday}>
                  Today
                </Button>
                <Button variant="outline" size="icon" onClick={previousMonth}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <div className="min-w-[200px] text-center font-semibold">
                  {monthName}
                </div>
                <Button variant="outline" size="icon" onClick={nextMonth}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1">
              {/* Day headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div
                  key={day}
                  className="p-2 text-center font-semibold text-gray-600 dark:text-gray-400">
                  {day}
                </div>
              ))}

              {/* Calendar days */}
              {days.map((day, index) => {
                if (day === null) {
                  return <div key={`empty-${index}`} className="p-2 min-h-[100px]" />;
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
                    className={`p-2 min-h-[100px] border rounded-lg ${
                      isToday
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}>
                    <div
                      className={`text-sm font-semibold mb-1 ${
                        isToday ? 'text-blue-600 dark:text-blue-400' : ''
                      }`}>
                      {day}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 3).map((event) => (
                        <Link
                          key={event.id}
                          href={`/events/${event.id}`}
                          className="block">
                          <div className="text-xs p-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors truncate">
                            {event.title}
                          </div>
                        </Link>
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          +{dayEvents.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Events list for selected month */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">
                All Events in {monthName}
              </h3>
              <div className="space-y-2">
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
                      <div className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold">{event.title}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {new Date(event.startDate).toLocaleDateString('en-US', {
                                weekday: 'long',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                            {event.location && (
                              <p className="text-sm text-gray-500 mt-1">{event.location}</p>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            {event.category && (
                              <Badge variant="secondary">{event.category}</Badge>
                            )}
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {event.attendeeCount}{' '}
                              {event.capacity ? `/ ${event.capacity}` : ''} attending
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
