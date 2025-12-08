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
import { Clock } from 'lucide-react';
import { API_URL } from '@/lib/constants';
import { DashboardStats } from '@/components/student/DashboardStats';
import { DashboardEventCard } from '@/components/student/DashboardEventCard';

export default function StudentDashboardPage() {
  const router = useRouter();
  const { user, getToken, loading: authLoading } = useAuth();
  const [rsvps, setRsvps] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push('/signin');
      return;
    }

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  const fetchData = async () => {
    try {
      const token = getToken();

      // Fetch user's RSVPs
      const rsvpResponse = await fetch(`${API_URL}/api/rsvp/my-rsvps`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (rsvpResponse.ok) {
        const rsvpData = await rsvpResponse.json();
        setRsvps(rsvpData);
      }

      // Fetch all events for recommendations
      const eventsResponse = await fetch(`${API_URL}/api/events`);
      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json();
        setAllEvents(eventsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
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

  const formatEventDate = (startDate) => {
    if (!startDate) return 'Date TBA';
    const date = new Date(startDate);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const upcomingRsvps = rsvps
    .filter(
      (rsvp) =>
        getEventStatus(rsvp.event.startDate, rsvp.event.endDate) === 'upcoming'
    )
    .slice(0, 3);

  const recommendedEvents = allEvents
    .filter((event) => {
      // Filter out events user has already RSVP'd to
      const hasRsvp = rsvps.some((rsvp) => rsvp.eventId === event.id);
      const status = getEventStatus(event.startDate, event.endDate);
      const isFull = event.capacity && event.attendeeCount >= event.capacity;
      return !hasRsvp && status === 'upcoming' && !isFull;
    })
    .slice(0, 6);

  const stats = {
    totalRsvps: rsvps.length,
    upcomingEvents: rsvps.filter(
      (rsvp) =>
        getEventStatus(rsvp.event.startDate, rsvp.event.endDate) === 'upcoming'
    ).length,
    pastEvents: rsvps.filter(
      (rsvp) =>
        getEventStatus(rsvp.event.startDate, rsvp.event.endDate) === 'past'
    ).length,
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
      {/* Background Pattern */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-10 pointer-events-none" />

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-50 mb-2">
              Student Dashboard
            </h2>
            <p className="text-slate-400">
              Welcome back, <span className="text-slate-200 font-medium">{user?.name}</span>!
            </p>
          </div>
          <div className="flex gap-3">
             <Link href="/events">
                <Button>
                  Browse Events
                </Button>
              </Link>
             <Link href="/student/my-events">
                <Button>
                  My Events
                </Button>
              </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <DashboardStats stats={stats} />

        {/* Upcoming Events */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-slate-50 flex items-center gap-2">
              <span className="w-2 h-8 bg-blue-500 rounded-full inline-block"></span>
              Your Upcoming Events
            </h3>
            <Link href="/student/my-events">
              <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10">
                View All
              </Button>
            </Link>
          </div>

          {upcomingRsvps.length === 0 ? (
            <Card className="bg-slate-950/70 border-slate-800/70 backdrop-blur-xl pt-6">
              <CardContent className="py-16 text-center">
                <div className="w-16 h-16 bg-slate-900/80 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-800">
                  <Clock className="w-8 h-8 text-slate-500" />
                </div>
                <h4 className="text-slate-200 font-semibold mb-2">No upcoming events</h4>
                <p className="text-slate-400 max-w-sm mx-auto mb-6">
                  You haven&apos;t RSVP&apos;d to any upcoming events yet. Browse the catalog to find something interesting!
                </p>
                <Link href="/events">
                  <Button className="bg-blue-600 hover:bg-blue-500 text-white rounded-full px-6">
                    Browse Events
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {upcomingRsvps.map((rsvp) => (
                <DashboardEventCard
                  key={rsvp.id}
                  event={rsvp.event}
                  formatDate={formatEventDate}
                />
              ))}
            </div>
          )}
        </div>

        {/* Recommended Events */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-slate-50 flex items-center gap-2">
              <span className="w-2 h-8 bg-purple-500 rounded-full inline-block"></span>
              Recommended Events
            </h3>
            <Link href="/events">
              <Button variant="ghost" size="sm" className="text-purple-400 hover:text-purple-300 hover:bg-purple-400/10">
                Browse All
              </Button>
            </Link>
          </div>

          {recommendedEvents.length === 0 ? (
            <Card className="bg-slate-950/70 border-slate-800/70 backdrop-blur-xl pt-6">
              <CardContent className="py-12 text-center text-slate-400">
                No recommended events at this time.
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedEvents.map((event) => (
                <DashboardEventCard
                  key={event.id}
                  event={event}
                  formatDate={formatEventDate}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
