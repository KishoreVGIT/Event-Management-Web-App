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
import { AdminHeader } from '@/components/admin/AdminHeader';

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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-full border-4 border-slate-800 border-t-blue-500 animate-spin" />
          <p className="text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <p className="text-red-400">Failed to load stats</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
      <AdminHeader title="Dashboard" />
      
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-5 pointer-events-none" />

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-0 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            Dashboard Overview
          </h2>
          <p className="text-slate-400">
            Monitor system performance and user activity
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

