'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import { API_URL } from '@/lib/constants';
import { EventForm } from '@/components/organizer/EventForm';

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading: authLoading, getToken } = useAuth();

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingEvent, setFetchingEvent] = useState(true);
  const [initialData, setInitialData] = useState(null);

  const eventId = useMemo(() => {
    const id = params?.id;
    return Array.isArray(id) ? id[0] : id;
  }, [params]);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      toast.error('Please sign in to edit events.');
      router.push('/signin');
      return;
    }

    if (user.role !== 'organizer' && user.role !== 'admin') {
      toast.error('You must be an organizer to edit events.');
      router.push('/events');
      return;
    }

    if (eventId) {
      fetchEvent();
    } else {
      setFetchingEvent(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user, eventId]);

  const fetchEvent = async () => {
    setFetchingEvent(true);
    try {
      const response = await fetch(`${API_URL}/api/events/${eventId}`, {
        cache: 'no-store',
      });

      if (!response.ok) {
        toast.error('Event not found.');
        router.push('/organizer/dashboard');
        return;
      }

      const data = await response.json();

      if (
        user.role !== 'admin' &&
        data.userId?.toString() !== user.id?.toString()
      ) {
        toast.error('You can only edit your own events.');
        router.push('/organizer/dashboard');
        return;
      }

      const formattedData = {
        title: data.title || '',
        description: data.description || '',
        location: data.location || '',
        capacity: typeof data.capacity === 'number' ? data.capacity : '',
        category: data.category || '',
        imageUrl: data.imageUrl || '',
        startDate: data.startDate ? new Date(data.startDate).toISOString() : '',
        endDate: data.endDate ? new Date(data.endDate).toISOString() : '',
        // Note: passing timeSlots if they exist would be needed if we support editing them
        // For now, EventForm handles generating them if enabled in UI
      };

      setInitialData(formattedData);
    } catch (err) {
      console.error('Error fetching event:', err);
      toast.error('Failed to load event. Please try again.');
      router.push('/organizer/dashboard');
    } finally {
      setFetchingEvent(false);
    }
  };

  const onSubmit = async (formData) => {
    setError('');
    setLoading(true);

    try {
      const token = getToken();
      if (!token) {
        toast.error('Authentication error. Please sign in again.');
        setLoading(false);
        router.push('/signin');
        return;
      }

      const response = await fetch(`${API_URL}/api/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(result.error || 'Failed to update event');
        return;
      }

      toast.success('Event updated successfully.');
      router.push('/organizer/dashboard');
    } catch (err) {
      console.error('Error updating event:', err);
      setError('Failed to update event');
      toast.error('Failed to update event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || fetchingEvent) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 flex items-center justify-center">
        <div className="fixed inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-10" />
        <div className="flex flex-col items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-full border-4 border-slate-700 border-t-blue-500 animate-spin" />
          <p className="text-sm font-medium text-slate-300">
            Loading event...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
      {/* Subtle grid background */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-10" />

      {/* Top nav */}
      <nav className="bg-slate-950/80 border-b border-slate-800/70 backdrop-blur-xl shadow-2xl shadow-blue-900/10 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-xl sm:text-2xl font-semibold text-slate-50">
              Edit event
            </h1>
            <Link href="/organizer/dashboard">
              <Button className="bg-slate-800/80 text-slate-200 hover:bg-slate-800 hover:text-slate-50 border-slate-700 rounded-full text-sm">
                Back to dashboard
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main */}
      <main className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="bg-slate-950/85 border-slate-800/80 backdrop-blur-2xl shadow-2xl shadow-blue-900/20 rounded-2xl pt-6">
          <CardHeader className="border-b border-slate-800/70 pb-4">
            <CardTitle className="text-slate-50 text-lg">
              Event details
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {error && (
              <div className="mb-6 p-3 text-xs sm:text-sm text-red-300 bg-red-500/10 border border-red-500/40 rounded-xl">
                {error}
              </div>
            )}
            {initialData && (
              <EventForm
                defaultValues={initialData}
                onSubmit={onSubmit}
                loading={loading}
                submitLabel="Update event"
                cancelHref="/organizer/dashboard"
              />
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
