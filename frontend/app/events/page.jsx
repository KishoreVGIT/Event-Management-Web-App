'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function EventsPage() {
  const router = useRouter();
  const { user, signout, getToken } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, upcoming, ongoing, past
  const [rsvpStatus, setRsvpStatus] = useState({});
  const [rsvpLoading, setRsvpLoading] = useState({});

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (user && events.length > 0) {
      checkRsvpStatus();
    }
  }, [user, events]);

  const fetchEvents = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/events`
      );
      const data = await response.json();

      if (Array.isArray(data)) {
        setEvents(data);
      } else {
        console.error('API returned non-array data:', data);
        setEvents([]);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const checkRsvpStatus = async () => {
    if (!user) return;

    const token = getToken();
    if (!token) return;

    const statusChecks = events.map(async (event) => {
      try {
        const response = await fetch(
          `${API_URL}/api/rsvp/check/${event.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          return { eventId: event.id, hasRsvp: data.hasRsvp };
        }
      } catch (error) {
        console.error(`Error checking RSVP for event ${event.id}:`, error);
      }
      return { eventId: event.id, hasRsvp: false };
    });

    const results = await Promise.all(statusChecks);
    const statusMap = {};
    results.forEach((result) => {
      statusMap[result.eventId] = result.hasRsvp;
    });
    setRsvpStatus(statusMap);
  };

  const handleRsvp = async (eventId) => {
    if (!user) {
      toast.error('Please sign in to RSVP');
      return;
    }

    const token = getToken();
    if (!token) {
      toast.error('Please sign in to RSVP');
      return;
    }

    setRsvpLoading((prev) => ({ ...prev, [eventId]: true }));

    try {
      const response = await fetch(`${API_URL}/api/rsvp/${eventId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('RSVP successful!');
        setRsvpStatus((prev) => ({ ...prev, [eventId]: true }));
        fetchEvents(); // Refresh to update attendee count
      } else {
        toast.error(data.error || 'Failed to RSVP');
      }
    } catch (error) {
      console.error('Error RSVPing:', error);
      toast.error('Failed to RSVP. Please try again.');
    } finally {
      setRsvpLoading((prev) => ({ ...prev, [eventId]: false }));
    }
  };

  const handleCancelRsvp = async (eventId) => {
    const token = getToken();
    if (!token) return;

    setRsvpLoading((prev) => ({ ...prev, [eventId]: true }));

    try {
      const response = await fetch(`${API_URL}/api/rsvp/${eventId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success('RSVP cancelled');
        setRsvpStatus((prev) => ({ ...prev, [eventId]: false }));
        fetchEvents(); // Refresh to update attendee count
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to cancel RSVP');
      }
    } catch (error) {
      console.error('Error cancelling RSVP:', error);
      toast.error('Failed to cancel RSVP');
    } finally {
      setRsvpLoading((prev) => ({ ...prev, [eventId]: false }));
    }
  };

  const formatEventDate = (startDate, endDate) => {
    if (!startDate) return 'Date TBA';

    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : null;

    const formatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };

    const timeOptions = {
      hour: '2-digit',
      minute: '2-digit',
    };

    if (end) {
      const startDay = new Date(start);
      startDay.setHours(0, 0, 0, 0);
      const endDay = new Date(end);
      endDay.setHours(0, 0, 0, 0);

      if (endDay > startDay) {
        return `${start.toLocaleDateString(
          'en-US',
          formatOptions
        )} at ${start.toLocaleTimeString(
          'en-US',
          timeOptions
        )} - ${end.toLocaleDateString(
          'en-US',
          formatOptions
        )} at ${end.toLocaleTimeString('en-US', timeOptions)}`;
      } else {
        return `${start.toLocaleDateString(
          'en-US',
          formatOptions
        )}, ${start.toLocaleTimeString(
          'en-US',
          timeOptions
        )} - ${end.toLocaleTimeString('en-US', timeOptions)}`;
      }
    }

    return `${start.toLocaleDateString(
      'en-US',
      formatOptions
    )} at ${start.toLocaleTimeString('en-US', timeOptions)}`;
  };

  const handleSignOut = () => {
    signout();
    router.push('/signin');
  };

  const getEventStatus = (startDate, endDate) => {
    if (!startDate) return 'upcoming';
    
    const now = new Date();
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : start;
    
    if (now < start) return 'upcoming';
    if (now > end) return 'past';
    return 'ongoing';
  };

  const filteredEvents = useMemo(() => {
    let filtered = events;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(query) ||
          event.description?.toLowerCase().includes(query) ||
          event.user.name.toLowerCase().includes(query)
      );
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(
        (event) => getEventStatus(event.startDate, event.endDate) === filterStatus
      );
    }

    return filtered;
  }, [events, searchQuery, filterStatus]);

  const eventStats = useMemo(() => {
    const stats = {
      all: events.length,
      upcoming: 0,
      ongoing: 0,
      past: 0,
    };

    events.forEach((event) => {
      const status = getEventStatus(event.startDate, event.endDate);
      stats[status]++;
    });

    return stats;
  }, [events]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Campus Connect
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Welcome, {user.name}
                  </span>
                  {user.role === 'organizer' && (
                    <Button
                      onClick={() =>
                        router.push('/organizer/dashboard')
                      }>
                      Dashboard
                    </Button>
                  )}
                  <Button variant="outline" onClick={handleSignOut}>
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={() => router.push('/signin')}>
                    Sign In
                  </Button>
                  <Button onClick={() => router.push('/signup')}>
                    Sign Up
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Discover Campus Events
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Browse, search, and RSVP to events happening on campus
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search events by title, description, or organizer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filterStatus === 'all' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('all')}
              size="sm">
              All Events ({eventStats.all})
            </Button>
            <Button
              variant={filterStatus === 'upcoming' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('upcoming')}
              size="sm">
              Upcoming ({eventStats.upcoming})
            </Button>
            <Button
              variant={filterStatus === 'ongoing' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('ongoing')}
              size="sm">
              Ongoing ({eventStats.ongoing})
            </Button>
            <Button
              variant={filterStatus === 'past' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('past')}
              size="sm">
              Past ({eventStats.past})
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              Loading events...
            </p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              {searchQuery || filterStatus !== 'all'
                ? 'No events found matching your criteria.'
                : 'No events available yet.'}
            </p>
            {(searchQuery || filterStatus !== 'all') && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setFilterStatus('all');
                }}
                className="mt-4">
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => {
              const status = getEventStatus(event.startDate, event.endDate);
              return (
                <Card
                  key={event.id}
                  className="hover:shadow-lg transition-shadow relative overflow-hidden">
                  {event.imageUrl && (
                    <div className="w-full h-48 overflow-hidden">
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className={`absolute ${event.imageUrl ? 'top-4' : 'top-4'} right-4 z-10`}>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        status === 'upcoming'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          : status === 'ongoing'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                      }`}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </span>
                  </div>

                  <CardHeader>
                    <CardTitle className="pr-20">{event.title}</CardTitle>
                    <CardDescription>
                      Organized by {event.user.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <svg
                          className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {formatEventDate(
                            event.startDate,
                            event.endDate
                          )}
                        </p>
                      </div>
                      {event.description && (
                        <p className="text-sm line-clamp-2 text-gray-700 dark:text-gray-300">
                          {event.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between pt-3 border-t dark:border-gray-700">
                        <div className="flex items-center gap-2">
                          <svg
                            className="w-5 h-5 text-gray-500 dark:text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                            />
                          </svg>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {event.attendeeCount}{' '}
                            {event.attendeeCount === 1
                              ? 'attendee'
                              : 'attendees'}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          {user && user.role === 'student' && (
                            rsvpStatus[event.id] ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCancelRsvp(event.id)}
                                disabled={rsvpLoading[event.id]}>
                                {rsvpLoading[event.id] ? 'Cancelling...' : 'Cancel RSVP'}
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => handleRsvp(event.id)}
                                disabled={rsvpLoading[event.id]}>
                                {rsvpLoading[event.id] ? 'RSVPing...' : 'RSVP'}
                              </Button>
                            )
                          )}
                          <Link href={`/events/${event.id}`}>
                            <Button size="sm" variant="outline">
                              View
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Results Summary */}
        {!loading && filteredEvents.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing {filteredEvents.length} of {events.length} events
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
