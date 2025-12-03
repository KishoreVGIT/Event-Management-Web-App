'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth-context';
import { Calendar, MapPin, Users, Tag } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function MyEventsPage() {
  const router = useRouter();
  const { user, getToken } = useAuth();
  const [rsvps, setRsvps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/signin');
      return;
    }
    fetchMyRsvps();
  }, [user]);

  const fetchMyRsvps = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/api/rsvp/my-rsvps`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRsvps(data);
      } else {
        console.error('Failed to fetch RSVPs');
      }
    } catch (error) {
      console.error('Error fetching RSVPs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRsvp = async (eventId) => {
    if (!confirm('Are you sure you want to cancel your RSVP?')) {
      return;
    }

    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/api/rsvp/${eventId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setRsvps(rsvps.filter((rsvp) => rsvp.eventId !== eventId));
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to cancel RSVP');
      }
    } catch (error) {
      console.error('Error cancelling RSVP:', error);
      alert('Failed to cancel RSVP');
    }
  };

  const formatEventDate = (startDate, endDate) => {
    if (!startDate) return 'Date TBA';

    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : null;

    const formatOptions = {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
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
        return `${start.toLocaleDateString('en-US', formatOptions)} - ${end.toLocaleDateString('en-US', formatOptions)}`;
      } else {
        return `${start.toLocaleDateString('en-US', formatOptions)} ${start.toLocaleTimeString('en-US', timeOptions)} - ${end.toLocaleTimeString('en-US', timeOptions)}`;
      }
    }

    return `${start.toLocaleDateString('en-US', formatOptions)} at ${start.toLocaleTimeString('en-US', timeOptions)}`;
  };

  const getEventStatus = (startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : null;

    if (end && now > end) {
      return { status: 'past', label: 'Past', color: 'bg-gray-500' };
    } else if (now >= start && (!end || now <= end)) {
      return {
        status: 'ongoing',
        label: 'Ongoing',
        color: 'bg-green-500',
      };
    } else {
      return {
        status: 'upcoming',
        label: 'Upcoming',
        color: 'bg-blue-500',
      };
    }
  };

  const groupEventsByStatus = (rsvps) => {
    const upcoming = [];
    const ongoing = [];
    const past = [];

    rsvps.forEach((rsvp) => {
      const { status } = getEventStatus(
        rsvp.event.startDate,
        rsvp.event.endDate
      );
      if (status === 'upcoming') upcoming.push(rsvp);
      else if (status === 'ongoing') ongoing.push(rsvp);
      else past.push(rsvp);
    });

    return { upcoming, ongoing, past };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  const { upcoming, ongoing, past } = groupEventsByStatus(rsvps);

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
                <Button variant="outline">Browse Events</Button>
              </Link>
              <Link href="/student/dashboard">
                <Button variant="outline">Dashboard</Button>
              </Link>
              {user && (
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  Welcome, {user.name}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            My Events
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            View and manage your event RSVPs
          </p>
        </div>

        {rsvps.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                You haven&apos;t RSVP&apos;d to any events yet.
              </p>
              <Link href="/events">
                <Button>Browse Events</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {ongoing.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Ongoing Events ({ongoing.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {ongoing.map((rsvp) => (
                    <EventCard
                      key={rsvp.id}
                      rsvp={rsvp}
                      onCancel={handleCancelRsvp}
                      formatDate={formatEventDate}
                      getStatus={getEventStatus}
                    />
                  ))}
                </div>
              </div>
            )}

            {upcoming.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Upcoming Events ({upcoming.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {upcoming.map((rsvp) => (
                    <EventCard
                      key={rsvp.id}
                      rsvp={rsvp}
                      onCancel={handleCancelRsvp}
                      formatDate={formatEventDate}
                      getStatus={getEventStatus}
                    />
                  ))}
                </div>
              </div>
            )}

            {past.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Past Events ({past.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {past.map((rsvp) => (
                    <EventCard
                      key={rsvp.id}
                      rsvp={rsvp}
                      onCancel={handleCancelRsvp}
                      formatDate={formatEventDate}
                      getStatus={getEventStatus}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function EventCard({ rsvp, onCancel, formatDate, getStatus }) {
  const { event } = rsvp;
  const eventStatus = getStatus(event.startDate, event.endDate);

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start mb-2">
          <CardTitle className="text-lg">{event.title}</CardTitle>
          <Badge className={`${eventStatus.color} text-white`}>
            {eventStatus.label}
          </Badge>
        </div>
        <CardDescription className="line-clamp-2">
          {event.description || 'No description'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <Calendar className="w-4 h-4 mt-0.5 text-gray-500" />
            <span className="text-gray-700 dark:text-gray-300">
              {formatDate(event.startDate, event.endDate)}
            </span>
          </div>

          {event.location && (
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 mt-0.5 text-gray-500" />
              <span className="text-gray-700 dark:text-gray-300">
                {event.location}
              </span>
            </div>
          )}

          {event.category && (
            <div className="flex items-start gap-2">
              <Tag className="w-4 h-4 mt-0.5 text-gray-500" />
              <span className="text-gray-700 dark:text-gray-300">
                {event.category}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-500" />
            <span className="text-gray-700 dark:text-gray-300">
              {event.attendeeCount}{' '}
              {event.capacity ? `/ ${event.capacity}` : ''} attending
            </span>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Link href={`/events/${event.id}`} className="flex-1">
            <Button variant="outline" className="w-full">
              View Details
            </Button>
          </Link>
          {eventStatus.status !== 'past' && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onCancel(event.id)}>
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
