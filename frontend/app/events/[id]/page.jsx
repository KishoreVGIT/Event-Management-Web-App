'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { AddToCalendar } from '@/components/add-to-calendar';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function EventDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user, getToken } = useAuth();
  const [event, setEvent] = useState(null);
  const [hasRsvp, setHasRsvp] = useState(false);
  const [loading, setLoading] = useState(true);
  const [rsvpLoading, setRsvpLoading] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchEvent();
      if (user) {
        checkRsvpStatus();
      }
    }
  }, [params.id, user]);

  const fetchEvent = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/events/${params.id}`
      );
      if (response.ok) {
        const data = await response.json();
        setEvent(data);
      } else {
        console.error('Event not found');
      }
    } catch (error) {
      console.error('Error fetching event:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkRsvpStatus = async () => {
    try {
      const token = getToken();
      const response = await fetch(
        `${API_URL}/api/rsvp/check/${params.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      setHasRsvp(data.hasRsvp);
    } catch (error) {
      console.error('Error checking RSVP:', error);
    }
  };

  const handleRsvp = async () => {
    if (!user) {
      router.push('/signin');
      return;
    }

    setRsvpLoading(true);
    try {
      const token = getToken();
      const response = await fetch(
        `${API_URL}/api/rsvp/${params.id}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setHasRsvp(true);
        fetchEvent();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to RSVP');
      }
    } catch (error) {
      console.error('Error RSVPing:', error);
      alert('Failed to RSVP');
    } finally {
      setRsvpLoading(false);
    }
  };

  const handleCancelRsvp = async () => {
    setRsvpLoading(true);
    try {
      const token = getToken();
      const response = await fetch(
        `${API_URL}/api/rsvp/${params.id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setHasRsvp(false);
        fetchEvent();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to cancel RSVP');
      }
    } catch (error) {
      console.error('Error cancelling RSVP:', error);
      alert('Failed to cancel RSVP');
    } finally {
      setRsvpLoading(false);
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
        return (
          <>
            <div className="font-semibold">Starts:</div>
            <div className="mb-2">
              {start.toLocaleDateString('en-US', formatOptions)} at{' '}
              {start.toLocaleTimeString('en-US', timeOptions)}
            </div>
            <div className="font-semibold">Ends:</div>
            <div>
              {end.toLocaleDateString('en-US', formatOptions)} at{' '}
              {end.toLocaleTimeString('en-US', timeOptions)}
            </div>
          </>
        );
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Event not found
          </p>
          <Link href="/events">
            <Button>Back to Events</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/events">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white cursor-pointer">
                  Campus Connect
                </h1>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/events">
                <Button variant="outline">Back to Events</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          {event.imageUrl && (
            <div className="w-full h-80 overflow-hidden rounded-t-lg">
              <img
                src={event.imageUrl}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <CardHeader>
            <CardTitle className="text-3xl">{event.title}</CardTitle>
            <CardDescription>
              Organized by {event.user.name}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">
                Date & Time
              </h3>
              <div className="text-gray-700 dark:text-gray-300">
                {formatEventDate(event.startDate, event.endDate)}
              </div>
            </div>

            {event.description && (
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Description
                </h3>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {event.description}
                </p>
              </div>
            )}

            {event.location && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Location</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  {event.location}
                </p>
              </div>
            )}

            {event.category && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Category</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  {event.category}
                </p>
              </div>
            )}

            <div>
              <h3 className="text-lg font-semibold mb-2">
                Attendees
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {event.attendeeCount}{' '}
                {event.capacity ? `/ ${event.capacity}` : ''}{' '}
                {event.attendeeCount === 1 ? 'person' : 'people'}{' '}
                attending
                {event.capacity && event.attendeeCount >= event.capacity && (
                  <span className="ml-2 text-red-600 font-semibold">
                    (Full)
                  </span>
                )}
              </p>

              {event.attendees && event.attendees.length > 0 && (
                <div className="space-y-2">
                  {event.attendees.map((attendee) => (
                    <div
                      key={attendee.id}
                      className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                        {attendee.user.name.charAt(0)}
                      </div>
                      <span className="text-sm">
                        {attendee.user.name}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-3">

              {user ? (
                hasRsvp ? (
                  <Button
                    variant="outline"
                    onClick={handleCancelRsvp}
                    disabled={rsvpLoading}
                    className="w-full sm:w-auto">
                    {rsvpLoading ? 'Cancelling...' : 'Cancel RSVP'}
                  </Button>
                ) : event.capacity && event.attendeeCount >= event.capacity ? (
                  <Button
                    disabled
                    className="w-full sm:w-auto">
                    Event Full
                  </Button>
                ) : (
                  <Button
                    onClick={handleRsvp}
                    disabled={rsvpLoading}
                    className="w-full sm:w-auto">
                    {rsvpLoading ? 'RSVPing...' : 'RSVP to Event'}
                  </Button>
                )
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Sign in to RSVP to this event
                  </p>
                  <Link href="/signin">
                    <Button className="w-full sm:w-auto">
                      Sign In
                    </Button>
                  </Link>
                </div>
              )}
              <AddToCalendar event={event} />
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
