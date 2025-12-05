'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
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
  const { user, getToken } = useAuth();
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Discover Campus Events
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Browse, search, and RSVP to events happening on campus
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-10 space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <Input
              type="text"
              placeholder="Search events by title, description, or organizer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 h-14 text-lg bg-white dark:bg-gray-800 border-2 focus:border-blue-500 dark:focus:border-blue-400 rounded-xl shadow-sm"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-3">
            <Button
              variant={filterStatus === 'all' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('all')}
              className={`rounded-full px-6 py-2 transition-all ${
                filterStatus === 'all'
                  ? 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}>
              All Events <span className="ml-2 opacity-75">({eventStats.all})</span>
            </Button>
            <Button
              variant={filterStatus === 'upcoming' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('upcoming')}
              className={`rounded-full px-6 py-2 transition-all ${
                filterStatus === 'upcoming'
                  ? 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}>
              Upcoming <span className="ml-2 opacity-75">({eventStats.upcoming})</span>
            </Button>
            <Button
              variant={filterStatus === 'ongoing' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('ongoing')}
              className={`rounded-full px-6 py-2 transition-all ${
                filterStatus === 'ongoing'
                  ? 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}>
              Ongoing <span className="ml-2 opacity-75">({eventStats.ongoing})</span>
            </Button>
            <Button
              variant={filterStatus === 'past' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('past')}
              className={`rounded-full px-6 py-2 transition-all ${
                filterStatus === 'past'
                  ? 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}>
              Past <span className="ml-2 opacity-75">({eventStats.past})</span>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event) => {
              const status = getEventStatus(event.startDate, event.endDate);
              return (
                <Card
                  key={event.id}
                  className="group hover:shadow-2xl transition-all duration-300 relative overflow-hidden border-2 hover:border-blue-200 dark:hover:border-blue-800 bg-white dark:bg-gray-800 rounded-2xl">
                  {event.imageUrl && (
                    <div className="w-full h-56 overflow-hidden relative">
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="absolute top-4 right-4 z-10">
                    <span
                      className={`px-3 py-1.5 text-xs font-bold rounded-full backdrop-blur-sm shadow-lg ${
                        status === 'upcoming'
                          ? 'bg-blue-500/90 text-white'
                          : status === 'ongoing'
                          ? 'bg-green-500/90 text-white'
                          : 'bg-gray-500/90 text-white'
                      }`}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </span>
                  </div>

                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl pr-20 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {event.title}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Organized by <span className="font-semibold">{event.user.name}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <svg
                          className="w-5 h-5 text-blue-500 dark:text-blue-400 mt-0.5 flex-shrink-0"
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
                        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                          {formatEventDate(
                            event.startDate,
                            event.endDate
                          )}
                        </p>
                      </div>
                      {event.description && (
                        <p className="text-sm line-clamp-2 text-gray-700 dark:text-gray-300 leading-relaxed">
                          {event.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between pt-4 border-t-2 dark:border-gray-700">
                        <div className="flex items-center gap-2">
                          <svg
                            className="w-5 h-5 text-purple-500 dark:text-purple-400"
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
                          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            {event.attendeeCount}{' '}
                            {event.attendeeCount === 1
                              ? 'attendee'
                              : 'attendees'}
                          </span>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          {user && user.role === 'student' && (
                            rsvpStatus[event.id] ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCancelRsvp(event.id)}
                                disabled={rsvpLoading[event.id]}
                                className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20">
                                {rsvpLoading[event.id] ? 'Cancelling...' : 'Cancel RSVP'}
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => handleRsvp(event.id)}
                                disabled={rsvpLoading[event.id]}
                                className="bg-blue-600 hover:bg-blue-700">
                                {rsvpLoading[event.id] ? 'RSVPing...' : 'RSVP'}
                              </Button>
                            )
                          )}
                          <Link href={`/events/${event.id}`}>
                            <Button size="sm" variant="outline" className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 dark:hover:bg-blue-900/20 dark:hover:text-blue-400">
                              View Details
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
      </div>
    </div>
  );
}
