'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { AddToCalendar } from '@/components/add-to-calendar';
import { API_URL } from '@/lib/constants';
import {
  Calendar,
  MapPin,
  Users,
  Tag,
  ArrowLeft,
  UserCircle,
} from 'lucide-react';
import { toast } from 'sonner';

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId, user]);

  const fetchEvent = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/events/${eventId}`,
        {
          cache: 'no-store',
        }
      );

      if (!response.ok) {
        setEvent(null);
        return;
      }

      const data = await response.json();
      setEvent(data);
    } catch (error) {
      console.error('Error fetching event:', error);
      toast.error('Unable to load event. Please try again.');
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

      if (!response.ok) return;

      const data = await response.json();
      setHasRsvp(Boolean(data?.hasRsvp));
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
      if (!token) {
        toast.error('Authentication error. Please sign in again.');
        setRsvpLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/api/rsvp/${eventId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        toast.error(data.error || 'Failed to RSVP');
        return;
      }

      setHasRsvp(true);
      await fetchEvent();
      toast.success('RSVP successful!');
    } catch (error) {
      console.error('Error RSVPing:', error);
      toast.error('Failed to RSVP. Please try again.');
    } finally {
      setRsvpLoading(false);
    }
  };

  const handleCancelRsvp = async () => {
    setRsvpLoading(true);
    try {
      const token = getToken();
      if (!token) {
        toast.error('Authentication error. Please sign in again.');
        setRsvpLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/api/rsvp/${eventId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        toast.error(data.error || 'Failed to cancel RSVP');
        return;
      }

      setHasRsvp(false);
      await fetchEvent();
      toast.success('RSVP cancelled');
    } catch (error) {
      console.error('Error cancelling RSVP:', error);
      toast.error('Failed to cancel RSVP');
    } finally {
      setRsvpLoading(false);
    }
  };

  const formatEventDate = (startDate, endDate) => {
    if (!startDate) return 'Date TBA';

    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : null;

    const dateOptions = {
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
      const sameDay = start.toDateString() === end.toDateString();

      if (sameDay) {
        return `${start.toLocaleDateString(
          'en-US',
          dateOptions
        )} · ${start.toLocaleTimeString(
          'en-US',
          timeOptions
        )} – ${end.toLocaleTimeString('en-US', timeOptions)}`;
      }

      return (
        <>
          <div className="font-semibold text-sm mb-1">Starts</div>
          <div className="mb-2 text-sm">
            {start.toLocaleDateString('en-US', dateOptions)} ·{' '}
            {start.toLocaleTimeString('en-US', timeOptions)}
          </div>
          <div className="font-semibold text-sm mb-1">Ends</div>
          <div className="text-sm">
            {end.toLocaleDateString('en-US', dateOptions)} ·{' '}
            {end.toLocaleTimeString('en-US', timeOptions)}
          </div>
        </>
      );
    }

    return `${start.toLocaleDateString(
      'en-US',
      dateOptions
    )} · ${start.toLocaleTimeString('en-US', timeOptions)}`;
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

  const status = event
    ? getEventStatus(event.startDate, event.endDate)
    : 'upcoming';

  const statusStyles = {
    upcoming: 'bg-blue-500/90 text-white ring-2 ring-blue-400/60',
    ongoing:
      'bg-emerald-500/90 text-white ring-2 ring-emerald-400/60',
    past: 'bg-zinc-500/90 text-white ring-2 ring-zinc-400/60',
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-full border-4 border-slate-700 border-t-blue-500 animate-spin" />
          <p className="text-sm font-medium text-slate-300">
            Loading event details…
          </p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 px-4">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="w-20 h-20 bg-slate-900/60 border border-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-2 shadow-xl shadow-blue-900/40">
            <Calendar className="w-9 h-9 text-slate-400" />
          </div>
          <h2 className="text-2xl font-semibold text-slate-50">
            Event not found
          </h2>
          <p className="text-sm text-slate-400">
            This event doesn&apos;t exist anymore or has been removed
            by its organizer.
          </p>
          <Link href="/events">
            <Button className="mt-2 bg-blue-600 hover:bg-blue-700 text-sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to events
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const organizerName =
    event.user?.organizationName || event.user?.name || 'Organizer';
  const attendeeCount = event.attendeeCount ?? 0;
  const capacity = event.capacity ?? null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 text-slate-50">
      {/* Hero */}
      <div className="relative w-full">
        <div className="relative h-[280px] sm:h-[340px] lg:h-[420px] overflow-hidden">
          {/* Background image / gradient */}
          {event.imageUrl ? (
            <Image
              src={event.imageUrl}
              alt={event.title}
              fill
              priority
              className="object-cover scale-105 blur-[0.5px]"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-700 via-indigo-600 to-slate-900" />
          )}

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/90 to-slate-900/10" />

          {/* Content */}
          <div className="relative max-w-6xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-end pb-8">
            <div className="flex flex-col gap-4 w-full">
              <div className="flex items-center justify-between gap-4">
                {/* Back button */}
                <Link href="/events">
                  <div className="flex gap-1 items-center px-3 py-1 border rounded-full border-slate-700 bg-slate-950/60 text-slate-100 hover:bg-slate-900 hover:border-slate-600 hover:text-white">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </div>
                </Link>

                {/* Status badge */}
                <span
                  className={`px-4 py-1.5 text-xs sm:text-sm font-semibold rounded-full backdrop-blur-md shadow-lg flex items-center gap-2 ${statusStyles[status]}`}>
                  <span className="inline-block w-2 h-2 rounded-full bg-white/80" />
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
              </div>

              <div className="space-y-3 max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/70 border border-slate-700/60 text-xs font-medium text-slate-300">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    {formatEventDate(event.startDate, event.endDate)}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-slate-50">
                  {event.title}
                </h1>

                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300">
                  <div className="inline-flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-slate-900/70 border border-slate-700 flex items-center justify-center">
                      <UserCircle className="w-4 h-4 text-slate-300" />
                    </div>
                    <span>
                      Organized by{' '}
                      <span className="font-medium text-slate-100">
                        {organizerName}
                      </span>
                    </span>
                  </div>

                  {event.location && (
                    <div className="inline-flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-300" />
                      <span className="truncate max-w-xs">
                        {event.location}
                      </span>
                    </div>
                  )}

                  {event.category && (
                    <div className="inline-flex items-center gap-2">
                      <Tag className="w-4 h-4 text-slate-300" />
                      <span>{event.category}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)] gap-8 lg:gap-10">
          {/* Left column */}
          <section className="space-y-6">
            <Card className="bg-slate-950/70 border-slate-800/70 shadow-2xl shadow-slate-950/60 backdrop-blur-xl rounded-2xl pt-6">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-slate-50">
                  About this event
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 text-sm text-slate-200">
                {event.description ? (
                  <p className="leading-relaxed whitespace-pre-wrap">
                    {event.description}
                  </p>
                ) : (
                  <p className="text-slate-400 italic">
                    No description provided for this event.
                  </p>
                )}

                {/* Attendees */}
                {event.attendees && event.attendees.length > 0 && (
                  <div className="pt-5 border-t border-slate-800/80">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-slate-300" />
                        <h3 className="text-sm font-semibold text-slate-50">
                          Attendees
                        </h3>
                      </div>
                      <span className="text-xs text-slate-400">
                        {event.attendees.length}{' '}
                        {event.attendees.length === 1
                          ? 'person attending'
                          : 'people attending'}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {event.attendees.map((attendee) => {
                        const name = attendee?.user?.name || 'Guest';
                        const initial =
                          name?.charAt(0)?.toUpperCase() || '?';

                        return (
                          <div
                            key={attendee.id}
                            className="flex items-center gap-3 p-3 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-colors">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-xs font-semibold text-white">
                              {initial}
                            </div>
                            <span className="text-sm font-medium text-slate-100 truncate">
                              {name}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          {/* Right column – sticky sidebar */}
          <aside className="space-y-5 lg:space-y-6 lg:sticky lg:top-24 self-start">
            {/* Event details */}
            <Card className="bg-slate-950/70 border-slate-800/70 backdrop-blur-xl shadow-xl rounded-2xl pt-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-slate-50">
                  Event details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-slate-200">
                {/* Date & Time */}
                <div className="flex gap-3">
                  <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/30 flex-shrink-0">
                    <Calendar className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="space-y-1 flex-1">
                    <h4 className="font-medium text-slate-100">
                      Date &amp; time
                    </h4>
                    {event.timeSlots && event.timeSlots.length > 0 ? (
                      <div className="space-y-2">
                        <p className="text-xs text-slate-400">
                          Multi-day event with custom times:
                        </p>
                        {event.timeSlots.map((slot, index) => (
                          <div
                            key={index}
                            className="text-xs sm:text-sm text-slate-300 p-2 rounded-lg bg-slate-900/50 border border-slate-800">
                            <div className="font-medium text-slate-200">
                              {new Date(slot.date).toLocaleDateString(
                                'en-US',
                                {
                                  weekday: 'short',
                                  month: 'short',
                                  day: 'numeric',
                                }
                              )}
                            </div>
                            <div className="text-slate-400 mt-0.5">
                              {slot.startTime} - {slot.endTime}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs sm:text-sm text-slate-300">
                        {formatEventDate(
                          event.startDate,
                          event.endDate
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Location */}
                {event.location && (
                  <div className="flex gap-3">
                    <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex-shrink-0">
                      <MapPin className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-medium text-slate-100">
                        Location
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-300">
                        {event.location}
                      </p>
                    </div>
                  </div>
                )}

                {/* Category */}
                {event.category && (
                  <div className="flex gap-3">
                    <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/30 flex-shrink-0">
                      <Tag className="w-4 h-4 text-fuchsia-400" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-medium text-slate-100">
                        Category
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-300">
                        {event.category}
                      </p>
                    </div>
                  </div>
                )}

                {/* Capacity */}
                <div className="flex gap-3">
                  <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/30 flex-shrink-0">
                    <Users className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-medium text-slate-100">
                      Attendance
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-300">
                      {capacity
                        ? `${attendeeCount} / ${capacity} ${
                            attendeeCount === 1 ? 'person' : 'people'
                          }`
                        : `${attendeeCount} ${
                            attendeeCount === 1
                              ? 'person attending'
                              : 'people attending'
                          }`}
                      {capacity && attendeeCount >= capacity && (
                        <span className="ml-2 text-xs font-semibold text-red-400">
                          (Full)
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card className="bg-slate-950/70 border-slate-800/70 backdrop-blur-xl shadow-xl rounded-2xl">
              <CardContent className="py-5 space-y-4">
                {user && user.role === 'student' ? (
                  hasRsvp ? (
                    <Button
                      variant="outline"
                      onClick={handleCancelRsvp}
                      disabled={rsvpLoading}
                      className="w-full h-11 rounded-full border-red-500/40 text-red-400 hover:bg-red-500/10 hover:text-red-300">
                      {rsvpLoading ? 'Cancelling…' : 'Cancel RSVP'}
                    </Button>
                  ) : capacity && attendeeCount >= capacity ? (
                    <Button
                      disabled
                      className="w-full h-11 rounded-full bg-slate-800 text-slate-400 cursor-not-allowed">
                      Event full
                    </Button>
                  ) : (
                    <Button
                      onClick={handleRsvp}
                      disabled={rsvpLoading}
                      className="w-full h-11 rounded-full bg-blue-600 hover:bg-blue-500">
                      {rsvpLoading ? 'RSVPing…' : 'RSVP to event'}
                    </Button>
                  )
                ) : user ? (
                  <div className="rounded-2xl border border-blue-500/30 bg-blue-500/5 px-4 py-3 text-center text-xs text-blue-200">
                    Only students can RSVP to events.
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs text-center text-slate-400">
                      Sign in to RSVP to this event.
                    </p>
                    <Link href="/signin">
                      <Button className="w-full h-11 rounded-full bg-blue-600 hover:bg-blue-500">
                        Sign in to RSVP
                      </Button>
                    </Link>
                  </div>
                )}

                <div className="pt-1">
                  <AddToCalendar event={event} />
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>
    </div>
  );
}
