'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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

export default function NewEventPage() {
  const router = useRouter();
  const { user, loading: authLoading, getToken } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/signin');
      } else if (user.role !== 'organizer' && user.role !== 'admin') {
        toast.error('You must be an organizer to create events');
        router.push('/events');
      }
    }
  }, [user, authLoading]);

  const onSubmit = async (data) => {
    setError('');
    setLoading(true);

    try {
      const token = getToken();
      // data already includes timeSlots if applicable from EventForm
      const response = await fetch(`${API_URL}/api/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('Event created successfully!');
        router.push('/organizer/dashboard');
      } else {
        setError(result.error || 'Failed to create event');
      }
    } catch (err) {
      console.error('Error creating event:', err);
      setError('Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-full border-4 border-slate-800 border-t-blue-500 animate-spin" />
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-5 pointer-events-none" />
      
      <nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                Create New Event
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/organizer/dashboard">
                <Button variant="ghost" className="text-slate-400 hover:text-white hover:bg-slate-800">
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Card className="bg-slate-950/70 border-slate-800/70 backdrop-blur-xl shadow-2xl">
          <CardHeader className="border-b border-slate-800/70 pb-6">
            <CardTitle className="text-2xl text-slate-50">Event Details</CardTitle>
            <p className="text-slate-400">Fill in the details to create your event</p>
          </CardHeader>
          <CardContent className="pt-6">
            {error && (
              <div className="mb-6 p-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl">
                {error}
              </div>
            )}
            <EventForm
              onSubmit={onSubmit}
              loading={loading}
              submitLabel="Create Event"
            />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
