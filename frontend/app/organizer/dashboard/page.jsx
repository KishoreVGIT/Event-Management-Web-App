'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { PostponeEventDialog } from '@/components/postpone-event-dialog';
import { CancelEventDialog } from '@/components/cancel-event-dialog';
import { AttendeesModal } from '@/components/attendees-modal';
import { API_URL } from '@/lib/constants';
import { DashboardHeader } from '@/components/organizer/dashboard/DashboardHeader';
import { EmptyState } from '@/components/organizer/dashboard/EmptyState';
import { EventsList } from '@/components/organizer/dashboard/EventsList';

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

  if (authLoading || (user && user.role === 'organizer' && loading)) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <p className="text-slate-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
      {/* Background Pattern */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-10 pointer-events-none" />

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <DashboardHeader user={user} />

        {events.length === 0 ? (
          <EmptyState />
        ) : (
          <EventsList
            events={events}
            onViewAttendees={handleViewAttendees}
            onPostpone={handlePostpone}
            onCancel={handleCancelEvent}
            onDelete={handleDelete}
          />
        )}

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
      </main>
    </div>
  );
}
