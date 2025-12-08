'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import { EventsHeader } from '@/components/events/EventsHeader';
import { EventsSearch } from '@/components/events/EventsSearch';
import { EventsFilters } from '@/components/events/EventsFilters';
import { EventsGrid } from '@/components/events/EventsGrid';
import { API_URL } from '@/lib/constants';

export default function EventsPage() {
  const { user, getToken } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [rsvpStatus, setRsvpStatus] = useState({});
  const [rsvpLoading, setRsvpLoading] = useState({});

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (user && events.length > 0) {
      checkRsvpStatus();
    }
  }, [user, events]);

  const fetchEvents = async () => {
    try {
      const response = await fetch(`${API_URL}/api/events`);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setEvents(data);
        } else {
          console.error('Events data is not an array:', data);
          setEvents([]);
        }
      } else {
        console.error('Failed to fetch events:', response.statusText);
        setEvents([]);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const checkRsvpStatus = async () => {
    if (!user) return;

    const token = getToken();
    if (!token) return;

    const statusChecks = events.map(async (event) => {
      try {
        const response = await fetch(
          `${API_URL}/api/rsvp/check/${event.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          return { eventId: event.id, hasRsvp: data.hasRsvp };
        }
      } catch (error) {
        console.error(
          `Error checking RSVP for event ${event.id}:`,
          error
        );
      }
      return { eventId: event.id, hasRsvp: false };
    });

    const results = await Promise.all(statusChecks);
    const statusMap = {};
    results.forEach((result) => {
      statusMap[result.eventId] = result.hasRsvp;
    });
    setRsvpStatus(statusMap);
  };

  const handleRsvp = async (eventId) => {
    if (!user) {
      toast.error('Please sign in to RSVP');
      return;
    }

    const token = getToken();
    if (!token) {
      toast.error('Please sign in to RSVP');
      return;
    }

    setRsvpLoading((prev) => ({ ...prev, [eventId]: true }));

    try {
      const response = await fetch(`${API_URL}/api/rsvp/${eventId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('RSVP successful!');
        setRsvpStatus((prev) => ({ ...prev, [eventId]: true }));
        fetchEvents();
      } else {
        toast.error(data.error || 'Failed to RSVP');
      }
    } catch (error) {
      console.error('Error RSVPing:', error);
      toast.error('Failed to RSVP. Please try again.');
    } finally {
      setRsvpLoading((prev) => ({ ...prev, [eventId]: false }));
    }
  };

  const handleCancelRsvp = async (eventId) => {
    const token = getToken();
    if (!token) return;

    setRsvpLoading((prev) => ({ ...prev, [eventId]: true }));

    try {
      const response = await fetch(`${API_URL}/api/rsvp/${eventId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success('RSVP cancelled');
        setRsvpStatus((prev) => ({ ...prev, [eventId]: false }));
        fetchEvents();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to cancel RSVP');
      }
    } catch (error) {
      console.error('Error cancelling RSVP:', error);
      toast.error('Failed to cancel RSVP');
    } finally {
      setRsvpLoading((prev) => ({ ...prev, [eventId]: false }));
    }
  };

  const formatEventDate = (startDate, endDate) => {
    if (!startDate) return 'Date TBA';

    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : null;

    const dateOptions = {
      weekday: 'short', // Mon, Tue...
      month: 'short', // Dec
      day: 'numeric', // 8
    };

    const timeOptions = {
      hour: 'numeric',
      minute: '2-digit',
    };

    // No end date → single point in time
    if (!end) {
      return `${start.toLocaleDateString(
        'en-US',
        dateOptions
      )} · ${start.toLocaleTimeString('en-US', timeOptions)}`;
    }

    const sameDay = start.toDateString() === end.toDateString();

    // Single-day event → "Mon, Dec 8 · 6:00 PM – 9:00 PM"
    if (sameDay) {
      return `${start.toLocaleDateString(
        'en-US',
        dateOptions
      )} · ${start.toLocaleTimeString(
        'en-US',
        timeOptions
      )} – ${end.toLocaleTimeString('en-US', timeOptions)}`;
    }

    // Multi-day event → "Mon, Dec 8 – Thu, Dec 11 · 6:00 PM – 9:00 PM each day"
    const dateRange = `${start.toLocaleDateString(
      'en-US',
      dateOptions
    )} – ${end.toLocaleDateString('en-US', dateOptions)}`;

    const timeRange = `${start.toLocaleTimeString(
      'en-US',
      timeOptions
    )} – ${end.toLocaleTimeString('en-US', timeOptions)}`;

    return `${dateRange} · ${timeRange} each day`;
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

  const filteredEvents = useMemo(() => {
    let filtered = events;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(query) ||
          event.description?.toLowerCase().includes(query) ||
          (event.user.organizationName || event.user.name)
            .toLowerCase()
            .includes(query)
      );
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(
        (event) =>
          getEventStatus(event.startDate, event.endDate) ===
          filterStatus
      );
    }

    return filtered;
  }, [events, searchQuery, filterStatus]);

  const eventStats = useMemo(() => {
    const stats = {
      all: events.length,
      upcoming: 0,
      ongoing: 0,
      past: 0,
    };

    events.forEach((event) => {
      const status = getEventStatus(event.startDate, event.endDate);
      stats[status]++;
    });

    return stats;
  }, [events]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setFilterStatus('all');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-0 py-8 lg:py-12">
        <EventsHeader />

        {/* Search and Filter Section */}
        <div className="mb-10 space-y-5">
          <EventsSearch
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
          <EventsFilters
            filterStatus={filterStatus}
            onFilterChange={setFilterStatus}
            eventStats={eventStats}
          />
        </div>

        <EventsGrid
          loading={loading}
          filteredEvents={filteredEvents}
          events={events}
          searchQuery={searchQuery}
          filterStatus={filterStatus}
          user={user}
          rsvpStatus={rsvpStatus}
          rsvpLoading={rsvpLoading}
          onRsvp={handleRsvp}
          onCancelRsvp={handleCancelRsvp}
          onClearFilters={handleClearFilters}
          getEventStatus={getEventStatus}
          formatEventDate={formatEventDate}
        />
      </div>
    </div>
  );
}
