'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import { Calendar, Users, UserCircle } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export function EventsShowcase() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rsvpStatus, setRsvpStatus] = useState({});
  const [rsvpLoading, setRsvpLoading] = useState({});
  const { user, getToken } = useAuth();

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
      const response = await fetch(`${API_URL}/api/events`);
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

    const statusChecks = events.slice(0, 6).map(async (event) => {
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
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    };

    const timeOptions = {
      hour: '2-digit',
      minute: '2-digit',
    };

    if (end) {
      return `${start.toLocaleDateString(
        'en-US',
        formatOptions
      )} - ${end.toLocaleDateString('en-US', formatOptions)}`;
    }

    return start.toLocaleDateString('en-US', formatOptions);
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

  if (loading) {
    return (
      <div className="w-full py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden bg-slate-950/70 border-slate-800/70 backdrop-blur-xl rounded-2xl">
              <div className="h-48 bg-slate-800/50 animate-pulse" />
              <CardHeader>
                <div className="h-6 bg-slate-800/50 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-slate-800/50 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-slate-800/50 rounded"></div>
                  <div className="h-4 bg-slate-800/50 rounded w-5/6"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400 mb-4">
          No events available at the moment.
        </p>
        <Link href="/signup">
          <Button className="bg-blue-600 hover:bg-blue-500 text-white rounded-full">Get Started</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.slice(0, 6).map((event) => {
        const status = getEventStatus(event.startDate, event.endDate);
        return (
          <Card
            key={event.id}
            className="group hover:shadow-2xl hover:shadow-blue-900/20 transition-all duration-300 relative overflow-hidden bg-slate-950/70 border-slate-800/70 backdrop-blur-xl rounded-2xl">
            <div className="relative w-full h-48 overflow-hidden">
              {event.imageUrl ? (
                <Image
                  src={event.imageUrl}
                  alt={event.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-700 via-indigo-600 to-slate-900" />
              )}
              <div className="absolute top-4 right-4">
                <span
                  className={`px-3 py-1.5 text-xs font-semibold rounded-full backdrop-blur-sm ${
                    status === 'upcoming'
                      ? 'bg-blue-500/20 text-blue-300 ring-1 ring-blue-500/40'
                      : status === 'ongoing'
                      ? 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/40'
                      : 'bg-slate-500/20 text-slate-300 ring-1 ring-slate-500/40'
                  }`}>
                  {status}
                </span>
              </div>
            </div>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="line-clamp-1 text-slate-50">{event.title}</CardTitle>
                  <CardDescription className="mt-1 flex items-center text-slate-400">
                    <UserCircle className="w-3 h-3 mr-1 text-blue-400" />
                    by {event.user.organizationName || event.user.name}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <Calendar className="w-4 h-4 flex-shrink-0 text-blue-400" />
                  {formatEventDate(event.startDate, event.endDate)}
                </div>

                {event.description && (
                  <p className="text-sm text-slate-400 line-clamp-2">
                    {event.description}
                  </p>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-slate-800/70">
                  <div className="flex items-center gap-1 text-sm text-slate-300">
                    <Users className="w-4 h-4 text-blue-400" />
                    {event.attendeeCount}
                  </div>
                  <div className="flex gap-2">
                    {user && user.role === 'student' && (
                      rsvpStatus[event.id] ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCancelRsvp(event.id)}
                          disabled={rsvpLoading[event.id]}
                          className="border-slate-700 text-slate-300 bg-slate-950/70 hover:bg-slate-900 hover:border-slate-600 hover:text-slate-100 rounded-full transition-all">
                          {rsvpLoading[event.id] ? 'Cancelling...' : 'Cancel RSVP'}
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleRsvp(event.id)}
                          disabled={rsvpLoading[event.id]}
                          className="bg-blue-600 hover:bg-blue-500 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                          {rsvpLoading[event.id] ? 'RSVPing...' : 'RSVP'}
                        </Button>
                      )
                    )}
                    <Link href={`/events/${event.id}`}>
                      <Button size="sm" variant="outline" className="border-slate-700 text-slate-300 bg-slate-950/70 hover:bg-slate-900 hover:border-slate-600 hover:text-slate-100 rounded-full transition-all">
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
  );
}
