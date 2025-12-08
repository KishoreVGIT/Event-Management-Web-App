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
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function OrganizerDashboard() {
  const router = useRouter();
  const { user, loading: authLoading, getToken } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postponeDialogOpen, setPostponeDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [attendeesModalOpen, setAttendeesModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/signin');
      } else if (user.role !== 'organizer' && user.role !== 'admin') {
        toast.error('You must be an organizer to access this page');
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
    toast.success(
      `Event postponed successfully! ${result.emailsSent} attendees notified.`
    );
    fetchMyEvents();
  };

  const handleCancelSuccess = (result) => {
    toast.success(
      `Event cancelled successfully! ${result.emailsSent} attendees notified.`
    );
    fetchMyEvents();
  };

  const handleViewAttendees = (event) => {
    setSelectedEvent(event);
    setAttendeesModalOpen(true);
  };

  const handleDelete = (eventId, eventTitle, eventStatus) => {
    if (eventStatus !== 'cancelled') {
      toast.error('Please cancel the event first before deleting it.');
      return;
    }
    setEventToDelete({ id: eventId, title: eventTitle });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!eventToDelete) return;

    try {
      const token = getToken();
      const response = await fetch(
        `${API_URL}/api/events/${eventToDelete.id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setEvents(events.filter((e) => e.id !== eventToDelete.id));
        toast.success('Event deleted successfully');
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to delete event');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    } finally {
      setDeleteDialogOpen(false);
      setEventToDelete(null);
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

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent className="bg-slate-950 border-slate-800 text-slate-50">
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription className="text-slate-400">
                This action cannot be undone. This will permanently delete the event
                &quot;{eventToDelete?.title}&quot; and remove all associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-slate-800 bg-slate-900/50 text-slate-300 hover:bg-slate-800 hover:text-white">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-600 hover:bg-red-700 text-white border-none"
                onClick={confirmDelete}>
                Delete Event
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
}
