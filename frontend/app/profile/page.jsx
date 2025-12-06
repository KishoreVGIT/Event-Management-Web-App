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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function ProfilePage() {
  const router = useRouter();
  const { user, getToken, signout, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/signin');
      return;
    }
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/api/profile/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setName(data.name);
        setOrganizationName(data.organization_name || '');
      } else {
        toast.error('Failed to load profile');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);

    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/api/profile/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          ...(profile.role === 'organizer' && { organizationName })
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setEditing(false);
        toast.success('Profile updated successfully');

        // Update the auth context
        updateUser({
          ...user,
          name: data.name,
          organizationName: data.organization_name
        });
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const handleSignOut = () => {
    signout();
    router.push('/signin');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 flex items-center justify-center">
        <div className="fixed inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-10" />
        <p className="text-slate-400 relative z-10">Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 flex items-center justify-center">
        <div className="fixed inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-10" />
        <p className="text-slate-400 relative z-10">Profile not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-10" />
      <nav className="bg-slate-950/70 border-b border-slate-800/70 backdrop-blur-xl shadow-2xl shadow-blue-900/10 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/events">
                <h1 className="text-2xl font-bold text-slate-50 cursor-pointer">
                  Campus Connect
                </h1>
              </Link>
            </div>
            <div className="flex items-center space-x-3">
              <Link href="/events">
                <Button className="bg-slate-800/70 text-slate-300 hover:bg-slate-800 hover:text-slate-100 border-slate-700 rounded-full">
                  Events
                </Button>
              </Link>
              {user?.role === 'organizer' && (
                <Link href="/organizer/dashboard">
                  <Button className="bg-slate-800/70 text-slate-300 hover:bg-slate-800 hover:text-slate-100 border-slate-700 rounded-full">
                    Dashboard
                  </Button>
                </Link>
              )}
              {user?.role === 'admin' && (
                <Link href="/admin/dashboard">
                  <Button className="bg-slate-800/70 text-slate-300 hover:bg-slate-800 hover:text-slate-100 border-slate-700 rounded-full">
                    Admin
                  </Button>
                </Link>
              )}
              <Button
                onClick={handleSignOut}
                className="bg-red-600/20 text-red-400 hover:bg-red-600/30 border-red-500/30 rounded-full">
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-50 mb-2">
            My Profile
          </h2>
          <p className="text-slate-400">
            Manage your account information
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Information */}
          <div className="lg:col-span-1">
            <Card className="bg-slate-950/70 border-slate-800/70 backdrop-blur-xl shadow-2xl shadow-blue-900/10 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-slate-50">Profile Information</CardTitle>
                <CardDescription className="text-slate-400">Your account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {editing ? (
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div>
                      <Label htmlFor="name" className="text-slate-300">Name</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        minLength={2}
                        className="h-11 bg-slate-900/70 border-slate-800/70 text-slate-100 placeholder:text-slate-500 rounded-xl focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                    {profile.role === 'organizer' && (
                      <div>
                        <Label htmlFor="organizationName" className="text-slate-300">
                          Organization Name <span className="text-slate-500 font-normal">(Optional)</span>
                        </Label>
                        <Input
                          id="organizationName"
                          value={organizationName}
                          onChange={(e) => setOrganizationName(e.target.value)}
                          placeholder="e.g., Computer Science Club"
                          className="h-11 bg-slate-900/70 border-slate-800/70 text-slate-100 placeholder:text-slate-500 rounded-xl focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
                        />
                        <p className="text-xs text-slate-400 mt-1">
                          This name will be displayed as the event organizer instead of your personal name
                        </p>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        disabled={updating}
                        className="bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-lg shadow-blue-500/20">
                        {updating ? 'Saving...' : 'Save'}
                      </Button>
                      <Button
                        type="button"
                        onClick={() => {
                          setEditing(false);
                          setName(profile.name);
                          setOrganizationName(profile.organization_name || '');
                        }}
                        disabled={updating}
                        className="bg-slate-800/70 text-slate-300 hover:bg-slate-800 border-slate-700 rounded-full">
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div>
                      <p className="text-sm font-medium text-slate-400">
                        Name
                      </p>
                      <p className="text-lg text-slate-50 mt-1">
                        {profile.name}
                      </p>
                    </div>
                    {profile.role === 'organizer' && (
                      <div>
                        <p className="text-sm font-medium text-slate-400">
                          Organization Name
                        </p>
                        <p className="text-lg text-slate-50 mt-1">
                          {profile.organization_name || <span className="text-slate-500 italic">Not set</span>}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-slate-400">
                        Email
                      </p>
                      <p className="text-lg text-slate-50 mt-1">
                        {profile.email}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-400">
                        Role
                      </p>
                      <p className="text-lg text-slate-50 mt-1 capitalize">
                        {profile.role}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-400">
                        Member Since
                      </p>
                      <p className="text-lg text-slate-50 mt-1">
                        {formatDate(profile.created_at)}
                      </p>
                    </div>
                    <Button
                      onClick={() => setEditing(true)}
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-lg shadow-blue-500/20">
                      Edit Profile
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Student RSVPs or Organizer Events */}
          <div className="lg:col-span-2">
            {profile.role === 'student' && (
              <Card className="bg-slate-950/70 border-slate-800/70 backdrop-blur-xl shadow-2xl shadow-blue-900/10 rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-slate-50">My RSVPs</CardTitle>
                  <CardDescription className="text-slate-400">
                    Events you've registered for ({profile.rsvps?.length || 0})
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {profile.rsvps && profile.rsvps.length > 0 ? (
                    <div className="space-y-4">
                      {profile.rsvps.map((rsvp) => (
                        <div
                          key={rsvp.id}
                          className="border border-slate-800/70 rounded-xl p-4 hover:shadow-lg hover:shadow-blue-900/10 transition-all bg-slate-900/30">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-slate-50">
                                {rsvp.event.title}
                              </h3>
                              <p className="text-sm text-slate-400 mt-1">
                                Organized by {rsvp.event.organizerName}
                              </p>
                              <p className="text-sm text-slate-400 mt-2">
                                {new Date(rsvp.event.startDate).toLocaleDateString('en-US', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                              {rsvp.event.location && (
                                <p className="text-sm text-slate-400">
                                  📍 {rsvp.event.location}
                                </p>
                              )}
                              {rsvp.event.status !== 'active' && (
                                <span className="inline-block mt-2 px-3 py-1 text-xs font-semibold rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                                  {rsvp.event.status}
                                </span>
                              )}
                            </div>
                            <Link href={`/events/${rsvp.event.id}`}>
                              <Button className="bg-slate-800/70 text-slate-300 hover:bg-slate-800 border-slate-700 rounded-full">
                                View
                              </Button>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-slate-400 mb-4">
                        You haven't RSVP'd to any events yet
                      </p>
                      <Link href="/events">
                        <Button className="bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-lg shadow-blue-500/20">
                          Browse Events
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {profile.role === 'organizer' && (
              <Card className="bg-slate-950/70 border-slate-800/70 backdrop-blur-xl shadow-2xl shadow-blue-900/10 rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-slate-50">My Events</CardTitle>
                  <CardDescription className="text-slate-400">
                    Events you've created ({profile.events?.length || 0})
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {profile.events && profile.events.length > 0 ? (
                    <div className="space-y-4">
                      {profile.events.map((event) => (
                        <div
                          key={event.id}
                          className="border border-slate-800/70 rounded-xl p-4 hover:shadow-lg hover:shadow-blue-900/10 transition-all bg-slate-900/30">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-slate-50">
                                {event.title}
                              </h3>
                              <p className="text-sm text-slate-400 mt-1">
                                {new Date(event.startDate).toLocaleDateString('en-US', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                              <div className="flex items-center gap-4 mt-2">
                                <span className="text-sm text-slate-400">
                                  👥 {event.attendeeCount} attendee{event.attendeeCount !== 1 ? 's' : ''}
                                </span>
                                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                  event.status === 'active'
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                    : event.status === 'cancelled'
                                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                    : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                                }`}>
                                  {event.status}
                                </span>
                              </div>
                            </div>
                            <Link href={`/organizer/events/edit/${event.id}`}>
                              <Button className="bg-slate-800/70 text-slate-300 hover:bg-slate-800 border-slate-700 rounded-full">
                                Manage
                              </Button>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-slate-400 mb-4">
                        You haven't created any events yet
                      </p>
                      <Link href="/organizer/events/new">
                        <Button className="bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-lg shadow-blue-500/20">
                          Create Event
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
