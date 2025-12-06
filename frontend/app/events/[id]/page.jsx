'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { API_URL } from '@/lib/constants';
import { toast } from 'sonner';
import { EventHero } from '@/components/event-detail/EventHero';
import { EventDescription } from '@/components/event-detail/EventDescription';
import { EventSidebar } from '@/components/event-detail/EventSidebar';
import { EventNotFound } from '@/components/event-detail/EventNotFound';

export default function EventDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user, getToken } = useAuth();

  const [event, setEvent] = useState(null);
  const [hasRsvp, setHasRsvp] = useState(false);
  const [loading, setLoading] = useState(true);
  const [rsvpLoading, setRsvpLoading] = useState(false);

  const eventId = useMemo(() => {
    const id = params?.id;
    return Array.isArray(id) ? id[0] : id;
  }, [params]);

  useEffect(() => {
    if (!eventId) return;

    const fetchData = async () => {
      setLoading(true);
      await Promise.all([
        fetchEvent(),
        user ? checkRsvpStatus() : Promise.resolve(),
      ]);
      setLoading(false);
    };

    fetchData();
  }, [eventId, user]);

  const fetchEvent = async () => {
    try {
      const response = await fetch(`${API_URL}/api/events/${eventId}`);
      if (response.ok) {
        const data = await response.json();
        setEvent(data);
      } else {
        setEvent(null);
      }
    } catch (error) {
      console.error('Error fetching event:', error);
      setEvent(null);
    }
  };

  const checkRsvpStatus = async () => {
    try {
      const token = getToken();
      if (!token) return;

      const response = await fetch(
        `${API_URL}/api/rsvp/check/${eventId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setHasRsvp(data.hasRsvp);
      }
    } catch (error) {
      console.error('Error checking RSVP status:', error);
    }
  };

  const handleRsvp = async () => {
    if (!user) {
      router.push('/signin');
      return;
    }

    if (user.role !== 'student') {
      toast.error('Only students can RSVP to events');
      return;
    }

    setRsvpLoading(true);
    try {
      const token = getToken();
      const response = await fetch(
        `${API_URL}/api/rsvp/${eventId}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        setHasRsvp(true);
        // Refresh event data to update attendee count
        fetchEvent();
        toast.success('You have successfully RSVPed to this event!');
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to RSVP');
      }
    } catch (error) {
      console.error('Error RSVPing:', error);
      toast.error('Failed to RSVP. Please try again.');
    } finally {
      setRsvpLoading(false);
    }
  };

  const handleCancelRsvp = async () => {
    if (!confirm('Are you sure you want to cancel your RSVP?')) return;

    setRsvpLoading(true);
    try {
      const token = getToken();
      const response = await fetch(
        `${API_URL}/api/rsvp/${eventId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setHasRsvp(false);
        // Refresh event data
        fetchEvent();
        toast.info('Your RSVP has been cancelled.');
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to cancel RSVP');
      }
    } catch (error) {
      console.error('Error cancelling RSVP:', error);
      toast.error('Failed to cancel RSVP');
    } finally {
      setRsvpLoading(false);
    }
  };

  const getEventStatus = (startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : null;

    if (end && now > end) {
      return 'past';
    } else if (now >= start && (!end || now <= end)) {
      return 'ongoing';
    } else {
      return 'upcoming';
    }
  };

  const formatEventDate = (startDate, endDate) => {
    if (!startDate) return 'Date TBA';

    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : null;

    const dateOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    const timeOptions = { hour: '2-digit', minute: '2-digit' };

    if (end) {
      // Check if same day
      if (start.toDateString() === end.toDateString()) {
        return `${start.toLocaleDateString(
          'en-US',
          dateOptions
        )} • ${start.toLocaleTimeString(
          'en-US',
          timeOptions
        )} - ${end.toLocaleTimeString('en-US', timeOptions)}`;
      } else {
        return `${start.toLocaleDateString(
          'en-US',
          dateOptions
        )}, ${start.toLocaleTimeString(
          'en-US',
          timeOptions
        )} - ${end.toLocaleDateString(
          'en-US',
          dateOptions
        )}, ${end.toLocaleTimeString('en-US', timeOptions)}`;
      }
    }

    return `${start.toLocaleDateString(
      'en-US',
      dateOptions
    )} • ${start.toLocaleTimeString('en-US', timeOptions)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-full border-4 border-slate-700 border-t-blue-500 animate-spin" />
          <p className="text-sm font-medium text-slate-300">
            Loading event...
          </p>
        </div>
      </div>
    );
  }

  if (!event) {
    return <EventNotFound />;
  }

  const status = getEventStatus(
    event.startDate,
    event.endDate
  );
  const organizerName =
    event.organizer?.organizationName ||
    event.organizer?.name ||
    'Unknown Organizer';
  const attendeeCount = event.attendees?.length || 0;
  const capacity = event.capacity;

  return (
    <div className="min-h-screen bg-slate-950 pb-20">
      <EventHero
        event={event}
        status={status}
        organizerName={organizerName}
        formatEventDate={formatEventDate}
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <EventDescription event={event} />
          </div>

          <div className="lg:col-span-1">
            <EventSidebar
              event={event}
              user={user}
              hasRsvp={hasRsvp}
              rsvpLoading={rsvpLoading}
              attendeeCount={attendeeCount}
              capacity={capacity}
              formatEventDate={formatEventDate}
              onRsvp={handleRsvp}
              onCancelRsvp={handleCancelRsvp}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
