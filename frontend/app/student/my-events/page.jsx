'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { API_URL } from '@/lib/constants';
import { RsvpCard } from '@/components/student/RsvpCard';
import { Calendar } from 'lucide-react';

export default function MyEventsPage() {
  const router = useRouter();
  const { user, getToken, loading: authLoading } = useAuth();
  const [rsvps, setRsvps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push('/signin');
      return;
    }

    fetchMyRsvps();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

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
        return `${start.toLocaleDateString(
          'en-US',
          formatOptions
        )} - ${end.toLocaleDateString('en-US', formatOptions)}`;
      } else {
        return `${start.toLocaleDateString(
          'en-US',
          formatOptions
        )} ${start.toLocaleTimeString(
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

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  const { upcoming, ongoing, past } = groupEventsByStatus(rsvps);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
      {/* Background Pattern */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-10 pointer-events-none" />

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-50 mb-2">
              My Events
            </h2>
            <p className="text-slate-400">
              View and manage your event RSVPs
            </p>
          </div>
          <div className="flex gap-3">
             <Link href="/events">
                <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">
                  Browse Events
                </Button>
              </Link>
             <Link href="/student/dashboard">
                <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">
                  Dashboard
                </Button>
              </Link>
          </div>
        </div>

        {rsvps.length === 0 ? (
          <Card className="bg-slate-950/70 border-slate-800/70 backdrop-blur-xl">
            <CardContent className="py-16 text-center">
              <div className="w-16 h-16 bg-slate-900/80 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-800">
                <Calendar className="w-8 h-8 text-slate-500" />
              </div>
              <h4 className="text-slate-200 font-semibold mb-2">No RSVPs yet</h4>
              <p className="text-slate-400 max-w-sm mx-auto mb-6">
                You haven&apos;t RSVP&apos;d to any events yet. Check out the events catalog to find activities to join!
              </p>
              <Link href="/events">
                <Button className="bg-blue-600 hover:bg-blue-500 text-white rounded-full px-6">
                  Browse Events
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-12">
            {ongoing.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-slate-50 flex items-center gap-2 mb-6">
                  <span className="w-2 h-8 bg-emerald-500 rounded-full inline-block"></span>
                  Ongoing Events ({ongoing.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {ongoing.map((rsvp) => (
                    <RsvpCard
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
                 <h3 className="text-xl font-bold text-slate-50 flex items-center gap-2 mb-6">
                  <span className="w-2 h-8 bg-blue-500 rounded-full inline-block"></span>
                  Upcoming Events ({upcoming.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {upcoming.map((rsvp) => (
                    <RsvpCard
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
                 <h3 className="text-xl font-bold text-slate-50 flex items-center gap-2 mb-6">
                  <span className="w-2 h-8 bg-slate-500 rounded-full inline-block"></span>
                  Past Events ({past.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {past.map((rsvp) => (
                    <RsvpCard
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
