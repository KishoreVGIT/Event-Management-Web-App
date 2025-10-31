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
import { useAuth } from '@/lib/auth-context';

export default function OrganizerDashboard() {
  const router = useRouter();
  const { user, signout, loading: authLoading, getToken } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/signin');
      } else if (user.role !== 'organizer' && user.role !== 'admin') {
        alert('You must be an organizer to access this page');
        router.push('/events');
      } else {
        fetchMyEvents();
      }
    }
  }, [user, authLoading]);

  const fetchMyEvents = async () => {
    try {
      const token = getToken();
      const response = await fetch(
        'http://localhost:4000/api/events/organizer/my-events',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

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

  const handleDelete = async (eventId) => {
    if (!confirm('Are you sure you want to delete this event?')) {
      return;
    }

    try {
      const token = getToken();
      const response = await fetch(
        `http://localhost:4000/api/events/${eventId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setEvents(events.filter((e) => e.id !== eventId));
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete event');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event');
    }
  };

  const formatEventDate = (startDate, endDate) => {
    if (!startDate) return 'Date TBA';

    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : null;

    const formatOptions = {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };

    const timeOptions = {
      hour: '2-digit',
      minute: '2-digit',
    };

    // Check if it's a multi-day event
    if (end) {
      const startDay = new Date(start);
      startDay.setHours(0, 0, 0, 0);
      const endDay = new Date(end);
      endDay.setHours(0, 0, 0, 0);

      if (endDay > startDay) {
        // Multi-day event - compact format
        return `${start.toLocaleDateString('en-US', formatOptions)} ${start.toLocaleTimeString('en-US', timeOptions)} - ${end.toLocaleDateString('en-US', formatOptions)} ${end.toLocaleTimeString('en-US', timeOptions)}`;
      } else {
        // Same day event with end time
        return `${start.toLocaleDateString('en-US', formatOptions)}, ${start.toLocaleTimeString('en-US', timeOptions)} - ${end.toLocaleTimeString('en-US', timeOptions)}`;
      }
    }

    // Only start time
    return `${start.toLocaleDateString('en-US', formatOptions)} at ${start.toLocaleTimeString('en-US', timeOptions)}`;
  };

  const handleSignOut = () => {
    signout();
    router.push('/signin');
  };

  if (authLoading || (user && user.role === 'organizer' && loading)) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation Bar */}
      <nav className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Organizer Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {user?.name}
              </span>
              <Link href="/events">
                <Button variant="outline">View All Events</Button>
              </Link>
              <Button variant="outline" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              My Events
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your events and track attendees
            </p>
          </div>
          <Link href="/organizer/events/new">
            <Button>Create New Event</Button>
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              Loading your events...
            </p>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              You haven&apos;t created any events yet.
            </p>
            <Link href="/organizer/events/new">
              <Button>Create Your First Event</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {events.map((event) => (
              <Card
                key={event.id}
                className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{event.title}</CardTitle>
                      <CardDescription>
                        {formatEventDate(event.startDate, event.endDate)}
                      </CardDescription>
                    </div>
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded-full text-sm font-medium">
                      {event.attendeeCount} RSVPs
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {event.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {event.description}
                      </p>
                    )}

                    {event.attendees &&
                      event.attendees.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold mb-2">
                            Attendees:
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {event.attendees
                              .slice(0, 5)
                              .map((attendee) => (
                                <div
                                  key={attendee.id}
                                  className="flex items-center space-x-1 text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                  <span>{attendee.user.name}</span>
                                </div>
                              ))}
                            {event.attendees.length > 5 && (
                              <span className="text-xs text-gray-500 px-2 py-1">
                                +{event.attendees.length - 5} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                    <div className="flex space-x-2 pt-2">
                      <Link
                        href={`/organizer/events/edit/${event.id}`}
                        className="flex-1">
                        <Button
                          variant="outline"
                          className="w-full"
                          size="sm">
                          Edit
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        className="flex-1"
                        size="sm"
                        onClick={() => handleDelete(event.id)}>
                        Delete
                      </Button>
                      <Link
                        href={`/events/${event.id}`}
                        className="flex-1">
                        <Button
                          variant="outline"
                          className="w-full"
                          size="sm">
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
