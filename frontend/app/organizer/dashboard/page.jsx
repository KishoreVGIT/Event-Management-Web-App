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
import { PostponeEventDialog } from '@/components/postpone-event-dialog';
import { CancelEventDialog } from '@/components/cancel-event-dialog';
import { AttendeesModal } from '@/components/attendees-modal';
import { API_URL } from '@/lib/constants';

export default function OrganizerDashboard() {
  const router = useRouter();
  const { user, signout, loading: authLoading, getToken } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postponeDialogOpen, setPostponeDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [attendeesModalOpen, setAttendeesModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

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
        `${API_URL}/api/events/organizer/my-events`,
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

  const handlePostpone = (event) => {
    setSelectedEvent(event);
    setPostponeDialogOpen(true);
  };

  const handleCancelEvent = (event) => {
    setSelectedEvent(event);
    setCancelDialogOpen(true);
  };

  const handlePostponeSuccess = (result) => {
    alert(
      `Event postponed successfully! ${result.emailsSent} attendees notified.`
    );
    fetchMyEvents(); // Refresh events
  };

  const handleCancelSuccess = (result) => {
    alert(
      `Event cancelled successfully! ${result.emailsSent} attendees notified.`
    );
    fetchMyEvents(); // Refresh events
  };

  const handleViewAttendees = (event) => {
    setSelectedEvent(event);
    setAttendeesModalOpen(true);
  };

  const handleDelete = async (eventId, eventTitle, eventStatus) => {
    if (eventStatus !== 'cancelled') {
      alert('Please cancel the event first before deleting it.');
      return;
    }

    if (
      !confirm(
        `Are you sure you want to permanently delete "${eventTitle}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      const token = getToken();
      const response = await fetch(
        `${API_URL}/api/events/${eventId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setEvents(events.filter((e) => e.id !== eventId));
        alert('Event deleted successfully');
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

    if (end) {
      const startDay = new Date(start);
      startDay.setHours(0, 0, 0, 0);
      const endDay = new Date(end);
      endDay.setHours(0, 0, 0, 0);

      if (endDay > startDay) {
        return `${start.toLocaleDateString(
          'en-US',
          formatOptions
        )} ${start.toLocaleTimeString(
          'en-US',
          timeOptions
        )} - ${end.toLocaleDateString(
          'en-US',
          formatOptions
        )} ${end.toLocaleTimeString('en-US', timeOptions)}`;
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

  if (authLoading || (user && user.role === 'organizer' && loading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-full border-4 border-slate-700 border-t-blue-500 animate-spin" />
          <p className="text-sm font-medium text-slate-300">
            Loading dashboard...
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
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-50 mb-2">
                Organizer Dashboard
              </h1>
              <p className="text-slate-400">
                Manage your events and track attendees
              </p>
            </div>
            <Link href="/organizer/events/new">
              <Button className="bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-lg shadow-blue-500/30 transition-all hover:scale-105">
                Create New Event
              </Button>
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="flex flex-col items-center gap-4">
              <div className="w-14 h-14 rounded-full border-4 border-slate-700 border-t-blue-500 animate-spin" />
              <p className="text-sm font-medium text-slate-300">
                Loading your events...
              </p>
            </div>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-slate-900/60 border border-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-blue-900/40">
              <svg
                className="w-9 h-9 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-50 mb-2">
              No events yet
            </h3>
            <p className="text-slate-400 mb-6">
              You haven&apos;t created any events yet.
            </p>
            <Link href="/organizer/events/new">
              <Button className="bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-lg shadow-blue-500/30 transition-all hover:scale-105">
                Create Your First Event
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {events.map((event) => (
              <Card
                key={event.id}
                className="group hover:shadow-2xl hover:shadow-blue-900/20 transition-all duration-300 overflow-hidden bg-slate-950/70 border-slate-800/70 backdrop-blur-xl rounded-2xl">
                {event.imageUrl && (
                  <div className="w-full h-48 overflow-hidden">
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1">
                      <CardTitle className="text-slate-50 line-clamp-1">
                        {event.title}
                      </CardTitle>
                      <CardDescription className="text-slate-400 mt-1">
                        {formatEventDate(
                          event.startDate,
                          event.endDate
                        )}
                      </CardDescription>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <button
                        onClick={() => handleViewAttendees(event)}
                        className="px-3 py-1 bg-blue-500/10 border border-blue-500/30 text-blue-300 rounded-full text-sm font-medium whitespace-nowrap hover:bg-blue-500/20 hover:border-blue-500/50 transition-colors cursor-pointer">
                        {event.attendeeCount} RSVPs
                      </button>
                      {event.status && event.status !== 'active' && (
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                            event.status === 'cancelled'
                              ? 'bg-red-500/10 border border-red-500/30 text-red-300'
                              : event.status === 'postponed'
                              ? 'bg-yellow-500/10 border border-yellow-500/30 text-yellow-300'
                              : 'bg-slate-500/10 border border-slate-500/30 text-slate-300'
                          }`}>
                          {event.status === 'cancelled'
                            ? 'Cancelled'
                            : event.status === 'postponed'
                            ? 'Rescheduled'
                            : event.status}
                        </span>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {event.description && (
                      <p className="text-sm text-slate-400 line-clamp-2">
                        {event.description}
                      </p>
                    )}

                    {event.attendees &&
                      event.attendees.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold mb-2 text-slate-300">
                            Attendees:
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {event.attendees
                              .slice(0, 5)
                              .map((attendee) => (
                                <div
                                  key={attendee.id}
                                  className="flex items-center space-x-1 text-xs bg-slate-900/70 border border-slate-800/50 px-2 py-1 rounded-lg text-slate-300">
                                  <span>{attendee.user.name}</span>
                                </div>
                              ))}
                            {event.attendees.length > 5 && (
                              <span className="text-xs text-slate-500 px-2 py-1">
                                +{event.attendees.length - 5} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                    <div className="flex flex-col gap-2 pt-2">
                      <div className="flex gap-2">
                        <Link
                          href={`/events/${event.id}`}
                          className="flex-1">
                          <Button
                            variant="outline"
                            className="w-full border-slate-700 text-slate-300 bg-slate-950/70 hover:bg-slate-900 hover:border-slate-600 hover:text-slate-100 rounded-full"
                            size="sm">
                            View
                          </Button>
                        </Link>
                        {event.status !== 'cancelled' && (
                          <Link
                            href={`/organizer/events/edit/${event.id}`}
                            className="flex-1">
                            <Button
                              variant="outline"
                              className="w-full border-slate-700 text-slate-300 bg-slate-950/70 hover:bg-slate-900 hover:border-slate-600 hover:text-slate-100 rounded-full"
                              size="sm">
                              Edit
                            </Button>
                          </Link>
                        )}
                      </div>

                      {event.status !== 'cancelled' && (
                        <div className="flex gap-2">
                          <Button
                            className="flex-1 bg-yellow-500 rounded-full text-white hover:bg-yellow-500/80"
                            size="sm"
                            onClick={() => handlePostpone(event)}>
                            Postpone
                          </Button>
                          <Button
                            className="flex-1 bg-red-500 rounded-full hover:bg-red-500/80"
                            size="sm"
                            onClick={() => handleCancelEvent(event)}>
                            Cancel Event
                          </Button>
                        </div>
                      )}

                      {event.status === 'cancelled' && (
                        <Button
                          variant="outline"
                          className="w-full border-red-500/40 text-red-400 hover:bg-red-500/10 hover:text-red-300 hover:border-red-500/60 rounded-full"
                          size="sm"
                          onClick={() =>
                            handleDelete(
                              event.id,
                              event.title,
                              event.status
                            )
                          }>
                          Delete Permanently
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Postpone Dialog */}
      {selectedEvent && (
        <PostponeEventDialog
          event={selectedEvent}
          open={postponeDialogOpen}
          onOpenChange={setPostponeDialogOpen}
          onSuccess={handlePostponeSuccess}
        />
      )}

      {/* Cancel Dialog */}
      {selectedEvent && (
        <CancelEventDialog
          event={selectedEvent}
          open={cancelDialogOpen}
          onOpenChange={setCancelDialogOpen}
          onSuccess={handleCancelSuccess}
        />
      )}

      {/* Attendees Modal */}
      {selectedEvent && (
        <AttendeesModal
          event={selectedEvent}
          attendees={selectedEvent.attendees}
          open={attendeesModalOpen}
          onOpenChange={setAttendeesModalOpen}
          getToken={getToken}
        />
      )}
    </div>
  );
}
