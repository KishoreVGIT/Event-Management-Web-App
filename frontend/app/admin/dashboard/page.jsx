'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import { API_URL } from '@/lib/constants';
import { StatsOverview } from '@/components/admin/dashboard/StatsOverview';
import { UsersByRole } from '@/components/admin/dashboard/UsersByRole';
import { EventsByStatus } from '@/components/admin/dashboard/EventsByStatus';
import { EventsByCategory } from '@/components/admin/dashboard/EventsByCategory';
import { RecentUsers } from '@/components/admin/dashboard/RecentUsers';
import { UpcomingEvents } from '@/components/admin/dashboard/UpcomingEvents';
import { RecentRsvps } from '@/components/admin/dashboard/RecentRsvps';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading, getToken } = useAuth();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return; // wait for auth to initialize

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

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

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">
          Loading dashboard...
        </p>
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-0 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Admin Dashboard
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            System statistics and overview
          </p>
        </div>

        <StatsOverview stats={stats} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <UsersByRole usersByRole={stats.usersByRole} />
          <EventsByStatus eventsByStatus={stats.eventsByStatus} />
        </div>

        <EventsByCategory eventsByCategory={stats.eventsByCategory} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentUsers recentUsers={stats.recentUsers} />
          <UpcomingEvents upcomingEvents={stats.upcomingEvents} />
        </div>

        <RecentRsvps recentRsvps={stats.recentRsvps} />
      </main>
    </div>
  );
}

