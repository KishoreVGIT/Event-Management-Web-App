import Link from 'next/link';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Calendar, Users, UserCircle } from 'lucide-react';

export function EventCard({
  event,
  status,
  user,
  rsvpStatus,
  rsvpLoading,
  onRsvp,
  onCancelRsvp,
  formatEventDate,
}) {
  const statusStyles = {
    upcoming: 'bg-blue-500/90 text-white ring-2 ring-blue-400/60',
    ongoing:
      'bg-emerald-500/90 text-white ring-2 ring-emerald-400/60',
    past: 'bg-zinc-500/90 text-white ring-2 ring-zinc-400/60',
  };

  return (
    <Card className="group hover:shadow-2xl hover:shadow-blue-900/20 transition-all duration-300 relative overflow-hidden bg-slate-950/70 border-slate-800/70 backdrop-blur-xl rounded-2xl">
      {/* Image Section */}
      <div className="relative w-full h-48 overflow-hidden">
        {event.imageUrl ? (
          <Image
            src={event.imageUrl}
            alt={event.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-700 via-indigo-600 to-slate-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent"></div>

        {/* Status Badge */}
        <div className="absolute top-3 right-3 z-10">
          <span
            className={`px-3 py-1.5 text-xs font-semibold rounded-full backdrop-blur-md shadow-lg flex items-center gap-1.5 ${statusStyles[status]}`}>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-white/80" />
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>
      </div>

      <CardHeader className="pb-3 pt-4">
        <CardTitle className="text-lg font-semibold text-slate-50 line-clamp-2 leading-snug">
          {event.title}
        </CardTitle>
        <div className="flex items-center gap-2 text-xs text-slate-400 mt-2">
          <UserCircle className="w-3.5 h-3.5" />
          <span>
            by{' '}
            <span className="text-slate-300 font-medium">
              {event.user.organizationName || event.user.name}
            </span>
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Date */}
        <div className="flex items-start gap-2 text-xs text-slate-300">
          <Calendar className="w-4 h-4 mt-0.5 text-slate-400 flex-shrink-0" />
          <div className="flex-1">
            <span className="line-clamp-2">
              {formatEventDate(event.startDate, event.endDate)}
            </span>
            {event.timeSlots && event.timeSlots.length > 0 && (
              <div className="mt-1 flex items-center gap-1">
                <span className="inline-block w-1 h-1 rounded-full bg-blue-400"></span>
                <span className="text-[10px] text-blue-400 font-medium">
                  Custom times for each day
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {event.description && (
          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {event.description}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-medium text-slate-300">
              {event.attendeeCount}{' '}
              {event.attendeeCount === 1 ? 'attendee' : 'attendees'}
            </span>
          </div>

          <div className="flex gap-2">
            {user &&
              user.role === 'student' &&
              (rsvpStatus ? (
                <button
                  onClick={() => onCancelRsvp(event.id)}
                  disabled={rsvpLoading}
                  className="px-3 py-1.5 text-xs font-medium rounded-full border border-red-500/40 text-red-400 hover:bg-red-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                  {rsvpLoading ? 'Cancelling...' : 'Cancel'}
                </button>
              ) : (
                <button
                  onClick={() => onRsvp(event.id)}
                  disabled={rsvpLoading}
                  className="px-3 py-1.5 text-xs font-medium rounded-full bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                  {rsvpLoading ? 'RSVPing...' : 'RSVP'}
                </button>
              ))}
            <Link href={`/events/${event.id}`}>
              <button className="px-3 py-1.5 text-xs font-medium rounded-full border border-slate-700 text-slate-300 hover:bg-slate-900 hover:border-slate-600 hover:text-slate-100 transition-colors">
                View
              </button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
