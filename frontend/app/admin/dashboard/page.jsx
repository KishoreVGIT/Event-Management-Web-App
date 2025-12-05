'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, getToken, signout } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/signin');
      return;
    }
    if (user.role !== 'admin') {
      toast.error('Access denied');
      router.push('/events');
      return;
    }
    fetchStats();
  }, [user]);

  const fetchStats = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/api/admin/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        toast.error('Failed to load dashboard stats');
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    signout();
    router.push('/signin');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Failed to load stats</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/events">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white cursor-pointer">
                  Campus Connect
                </h1>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/events">
                <Button variant="outline">Events</Button>
              </Link>
              <Link href="/profile">
                <Button variant="outline">Profile</Button>
              </Link>
              <Button variant="outline" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Admin Dashboard
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            System statistics and overview
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                {stats.totals.users}
              </CardTitle>
              <CardDescription>Total Users</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                {stats.totals.events}
              </CardTitle>
              <CardDescription>Total Events</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                {stats.totals.rsvps}
              </CardTitle>
              <CardDescription>Total RSVPs</CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Users by Role */}
          <Card>
            <CardHeader>
              <CardTitle>Users by Role</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {stats.usersByRole.map((item) => (
                  <div
                    key={item.role}
                    className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <span className="capitalize font-medium">{item.role}</span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Events by Status */}
          <Card>
            <CardHeader>
              <CardTitle>Events by Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {stats.eventsByStatus.map((item) => (
                  <div
                    key={item.status}
                    className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <span className="capitalize font-medium">{item.status}</span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Events by Category */}
        {stats.eventsByCategory.length > 0 && (
          <div className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Events by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {stats.eventsByCategory.map((item) => (
                    <div
                      key={item.category}
                      className="p-3 bg-gray-50 dark:bg-gray-800 rounded text-center">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {item.count}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {item.category}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Users */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Users</CardTitle>
              <CardDescription>Latest 10 registered users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.recentUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex justify-between items-start p-3 bg-gray-50 dark:bg-gray-800 rounded">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {user.name}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {user.email}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs capitalize px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded">
                        {user.role}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {formatDate(user.createdAt)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
              <CardDescription>Next 10 active events</CardDescription>
            </CardHeader>
            <CardContent>
              {stats.upcomingEvents.length > 0 ? (
                <div className="space-y-3">
                  {stats.upcomingEvents.map((event) => (
                    <div
                      key={event.id}
                      className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {event.title}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        By {event.organizerName}
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(event.startDate)}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          👥 {event.attendeeCount} attendee{event.attendeeCount !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-8 text-gray-600 dark:text-gray-400">
                  No upcoming events
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent RSVPs */}
        {stats.recentRsvps.length > 0 && (
          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent RSVPs</CardTitle>
                <CardDescription>Latest 10 event registrations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stats.recentRsvps.map((rsvp) => (
                    <div
                      key={rsvp.id}
                      className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                      <div>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {rsvp.userName}
                        </span>
                        <span className="text-gray-600 dark:text-gray-400">
                          {' '}registered for{' '}
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {rsvp.eventTitle}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(rsvp.rsvpDate)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
