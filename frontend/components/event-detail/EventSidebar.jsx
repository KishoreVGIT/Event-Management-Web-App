import Link from 'next/link';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Tag, Users } from 'lucide-react';
import { AddToCalendar } from '@/components/add-to-calendar';

export function EventSidebar({
  event,
  user,
  hasRsvp,
  rsvpLoading,
  attendeeCount,
  capacity,
  formatEventDate,
  onRsvp,
  onCancelRsvp,
}) {
  return (
    <aside className="space-y-5 lg:space-y-6 lg:sticky lg:top-24 self-start">
      {/* Event details */}
      <Card className="bg-slate-950/70 border-slate-800/70 backdrop-blur-xl shadow-xl rounded-2xl pt-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-slate-50">
            Event details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-slate-200">
          {/* Date & Time */}
          <div className="flex gap-3">
            <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/30 flex-shrink-0">
              <Calendar className="w-4 h-4 text-blue-400" />
            </div>
            <div className="space-y-1 flex-1">
              <h4 className="font-medium text-slate-100">Date &amp; time</h4>
              {event.timeSlots && event.timeSlots.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs text-slate-400">
                    Multi-day event with custom times:
                  </p>
                  {event.timeSlots.map((slot, index) => (
                    <div
                      key={index}
                      className="text-xs sm:text-sm text-slate-300 p-2 rounded-lg bg-slate-900/50 border border-slate-800">
                      <div className="font-medium text-slate-200">
                        {new Date(slot.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                      <div className="text-slate-400 mt-0.5">
                        {slot.startTime} - {slot.endTime}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs sm:text-sm text-slate-300">
                  {formatEventDate(event.startDate, event.endDate)}
                </div>
              )}
            </div>
          </div>

          {/* Location */}
          {event.location && (
            <div className="flex gap-3">
              <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex-shrink-0">
                <MapPin className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="space-y-1">
                <h4 className="font-medium text-slate-100">Location</h4>
                <p className="text-xs sm:text-sm text-slate-300">
                  {event.location}
                </p>
              </div>
            </div>
          )}

          {/* Category */}
          {event.category && (
            <div className="flex gap-3">
              <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/30 flex-shrink-0">
                <Tag className="w-4 h-4 text-fuchsia-400" />
              </div>
              <div className="space-y-1">
                <h4 className="font-medium text-slate-100">Category</h4>
                <p className="text-xs sm:text-sm text-slate-300">
                  {event.category}
                </p>
              </div>
            </div>
          )}

          {/* Capacity */}
          <div className="flex gap-3">
            <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/30 flex-shrink-0">
              <Users className="w-4 h-4 text-amber-400" />
            </div>
            <div className="space-y-1">
              <h4 className="font-medium text-slate-100">Attendance</h4>
              <p className="text-xs sm:text-sm text-slate-300">
                {capacity
                  ? `${attendeeCount} / ${capacity} ${
                      attendeeCount === 1 ? 'person' : 'people'
                    }`
                  : `${attendeeCount} ${
                      attendeeCount === 1
                        ? 'person attending'
                        : 'people attending'
                    }`}
                {capacity && attendeeCount >= capacity && (
                  <span className="ml-2 text-xs font-semibold text-red-400">
                    (Full)
                  </span>
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card className="bg-slate-950/70 border-slate-800/70 backdrop-blur-xl shadow-xl rounded-2xl">
        <CardContent className="py-5 space-y-4">
          {user && user.role === 'student' ? (
            hasRsvp ? (
              <Button
                variant="outline"
                onClick={onCancelRsvp}
                disabled={rsvpLoading}
                data-testid="cancel-rsvp-button"
                className="w-full h-11 rounded-full border-red-500/40 bg-red-500 hover:bg-red-500/10 text-white hover:text-red-300">
                {rsvpLoading ? 'Cancelling…' : 'Cancel RSVP'}
              </Button>
            ) : capacity && attendeeCount >= capacity ? (
              <Button
                disabled
                className="w-full h-11 rounded-full bg-slate-800 text-slate-400 cursor-not-allowed">
                Event full
              </Button>
            ) : (
              <Button
                onClick={onRsvp}
                disabled={rsvpLoading}
                data-testid="rsvp-button"
                className="w-full h-11 rounded-full bg-blue-600 hover:bg-blue-500">
                {rsvpLoading ? 'RSVPing…' : 'RSVP to event'}
              </Button>
            )
          ) : user ? (
            <div className="rounded-2xl border border-blue-500/30 bg-blue-500/5 px-4 py-3 text-center text-xs text-blue-200">
              Only students can RSVP to events.
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-center text-slate-400">
                Sign in to RSVP to this event.
              </p>
              <Link href="/signin">
                <Button className="w-full h-11 rounded-full bg-blue-600 hover:bg-blue-500">
                  Sign in to RSVP
                </Button>
              </Link>
            </div>
          )}

          {user && (
            <div className="pt-1">
              <AddToCalendar event={event} />
            </div>
          )}
        </CardContent>
      </Card>
    </aside>
  );
}
