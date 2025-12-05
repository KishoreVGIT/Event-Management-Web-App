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
        body: JSON.stringify({ name }),
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setEditing(false);
        toast.success('Profile updated successfully');

        // Update the auth context
        updateUser({ ...user, name: data.name });
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Profile not found</p>
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
              {user?.role === 'organizer' && (
                <Link href="/organizer/dashboard">
                  <Button variant="outline">Dashboard</Button>
                </Link>
              )}
              {user?.role === 'admin' && (
                <Link href="/admin/dashboard">
                  <Button variant="outline">Admin</Button>
                </Link>
              )}
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
            My Profile
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your account information
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Information */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Your account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {editing ? (
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        minLength={2}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" disabled={updating}>
                        {updating ? 'Saving...' : 'Save'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setEditing(false);
                          setName(profile.name);
                        }}
                        disabled={updating}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Name
                      </p>
                      <p className="text-lg text-gray-900 dark:text-white">
                        {profile.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Email
                      </p>
                      <p className="text-lg text-gray-900 dark:text-white">
                        {profile.email}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Role
                      </p>
                      <p className="text-lg text-gray-900 dark:text-white capitalize">
                        {profile.role}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Member Since
                      </p>
                      <p className="text-lg text-gray-900 dark:text-white">
                        {formatDate(profile.created_at)}
                      </p>
                    </div>
                    <Button onClick={() => setEditing(true)} className="w-full">
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
              <Card>
                <CardHeader>
                  <CardTitle>My RSVPs</CardTitle>
                  <CardDescription>
                    Events you've registered for ({profile.rsvps?.length || 0})
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {profile.rsvps && profile.rsvps.length > 0 ? (
                    <div className="space-y-4">
                      {profile.rsvps.map((rsvp) => (
                        <div
                          key={rsvp.id}
                          className="border dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {rsvp.event.title}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Organized by {rsvp.event.organizerName}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
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
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  📍 {rsvp.event.location}
                                </p>
                              )}
                              {rsvp.event.status !== 'active' && (
                                <span className="inline-block mt-2 px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                  {rsvp.event.status}
                                </span>
                              )}
                            </div>
                            <Link href={`/events/${rsvp.event.id}`}>
                              <Button size="sm" variant="outline">
                                View
                              </Button>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        You haven't RSVP'd to any events yet
                      </p>
                      <Link href="/events">
                        <Button>Browse Events</Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {profile.role === 'organizer' && (
              <Card>
                <CardHeader>
                  <CardTitle>My Events</CardTitle>
                  <CardDescription>
                    Events you've created ({profile.events?.length || 0})
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {profile.events && profile.events.length > 0 ? (
                    <div className="space-y-4">
                      {profile.events.map((event) => (
                        <div
                          key={event.id}
                          className="border dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {event.title}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
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
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  👥 {event.attendeeCount} attendee{event.attendeeCount !== 1 ? 's' : ''}
                                </span>
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                  event.status === 'active'
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                    : event.status === 'cancelled'
                                    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                                }`}>
                                  {event.status}
                                </span>
                              </div>
                            </div>
                            <Link href={`/organizer/events/edit/${event.id}`}>
                              <Button size="sm" variant="outline">
                                Manage
                              </Button>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        You haven't created any events yet
                      </p>
                      <Link href="/organizer/events/new">
                        <Button>Create Event</Button>
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
