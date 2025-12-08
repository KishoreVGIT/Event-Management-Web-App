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
import { toast } from 'sonner';

export default function MyEventsPage() {
  const router = useRouter();
  const { user, getToken, loading: authLoading } = useAuth();
  const [rsvps, setRsvps] = useState([]);
  const [loading, setLoading] = useState(true);

  // RSVP Cancellation State
  const [cancelEventId, setCancelEventId] = useState(null);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

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
        toast.error('Failed to fetch your RSVPs');
      }
    } catch (error) {
      console.error('Error fetching RSVPs:', error);
      toast.error('Failed to load your RSVPs');
    } finally {
      setLoading(false);
    }
  };

  const confirmCancelRsvp = (eventId) => {
    setCancelEventId(eventId);
    setIsCancelDialogOpen(true);
  };

  const handleCancelRsvp = async () => {
    if (!cancelEventId) return;

    setCancelling(true);
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/api/rsvp/${cancelEventId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setRsvps(rsvps.filter((rsvp) => rsvp.eventId !== cancelEventId));
        toast.success('RSVP cancelled successfully');
        setIsCancelDialogOpen(false);
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to cancel RSVP');
      }
    } catch (error) {
      console.error('Error cancelling RSVP:', error);
      toast.error('Failed to cancel RSVP');
    } finally {
      setCancelling(false);
      setCancelEventId(null);
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
                <Button >
                  Browse Events
                </Button>
              </Link>
             <Link href="/student/dashboard">
                <Button>
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
                      onCancel={confirmCancelRsvp}
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
                      onCancel={confirmCancelRsvp}
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
                      onCancel={confirmCancelRsvp}
                      formatDate={formatEventDate}
                      getStatus={getEventStatus}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
          <AlertDialogContent className="bg-slate-950 border-slate-800 text-slate-100">
            <AlertDialogHeader>
              <AlertDialogTitle>Cancel RSVP?</AlertDialogTitle>
              <AlertDialogDescription className="text-slate-400">
                Are you sure you want to cancel your RSVP for this event? Your spot may be given to someone else.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel 
                className="text-black"
                onClick={() => setIsCancelDialogOpen(false)}
              >
                Keep RSVP
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleCancelRsvp}
                className="bg-red-600 hover:bg-red-700 text-white border-0"
                disabled={cancelling}
              >
                {cancelling ? 'Cancelling...' : 'Yes, Cancel RSVP'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
}
