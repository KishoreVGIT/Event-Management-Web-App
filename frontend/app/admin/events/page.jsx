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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminHeader title="Campus Connect - Event Management" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

