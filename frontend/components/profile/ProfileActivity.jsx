import Link from 'next/link';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function ProfileActivity({ profile }) {
  if (profile.role === 'student') {
    return (
      <Card className="bg-slate-950/70 border-slate-800/70 backdrop-blur-xl shadow-2xl shadow-blue-900/10 rounded-2xl pt-6">
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
                        {new Date(rsvp.event.startDate).toLocaleDateString(
                          'en-US',
                          {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          }
                        )}
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
    );
  }

  if (profile.role === 'organizer') {
    return (
      <Card className="bg-slate-950/70 border-slate-800/70 backdrop-blur-xl shadow-2xl shadow-blue-900/10 rounded-2xl pt-6">
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
                        {new Date(event.startDate).toLocaleDateString(
                          'en-US',
                          {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          }
                        )}
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-sm text-slate-400">
                          👥 {event.attendeeCount} attendee
                          {event.attendeeCount !== 1 ? 's' : ''}
                        </span>
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-full ${
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
    );
  }

  return null;
}
