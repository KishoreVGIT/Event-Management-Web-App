'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { API_URL } from '@/lib/constants';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { EventsTable } from '@/components/admin/EventsTable';

export default function AdminEventsPage() {
  const router = useRouter();
  const { user, getToken, loading: authLoading } = useAuth();
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/signin');
      } else if (user.role !== 'admin') {
        alert('Admin access required');
        router.push('/');
      } else {
        fetchEvents();
      }
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = events.filter(
        (e) =>
          e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          e.organizer.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredEvents(filtered);
    } else {
      setFilteredEvents(events);
    }
  }, [searchTerm, events]);

  const fetchEvents = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/api/admin/events`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setEvents(data);
        setFilteredEvents(data);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId, eventTitle) => {
    if (
      !confirm(
        `Are you sure you want to delete "${eventTitle}"? This action cannot be undone and will remove all associated RSVPs.`
      )
    ) {
      return;
    }

    try {
      const token = getToken();
      const response = await fetch(
        `${API_URL}/api/admin/events/${eventId}`,
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

  const formatDate = (dateString) => {
    if (!dateString) return 'Date TBA';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getEventStatus = (startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : null;

    if (end && now > end) {
      return { label: 'Past', color: 'bg-gray-500' };
    } else if (now >= start && (!end || now <= end)) {
      return { label: 'Ongoing', color: 'bg-green-500' };
    } else {
      return { label: 'Upcoming', color: 'bg-blue-500' };
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-full border-4 border-slate-800 border-t-blue-500 animate-spin" />
          <p className="text-slate-400">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
      <AdminHeader title="Event Management" />
      
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-5 pointer-events-none" />

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            Event Management
          </h2>
          <p className="text-slate-400">
            Monitor and manage platform events
          </p>
        </div>

        <EventsTable
          events={filteredEvents}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          formatDate={formatDate}
          getEventStatus={getEventStatus}
          handleDeleteEvent={handleDeleteEvent}
        />
      </main>
    </div>
  );
}

