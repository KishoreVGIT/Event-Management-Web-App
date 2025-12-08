import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Users } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export function EventDescription({ event }) {
  const { user } = useAuth();
  return (
    <section className="space-y-6">
      <Card className="bg-slate-950/70 border-slate-800/70 shadow-2xl shadow-slate-950/60 backdrop-blur-xl rounded-2xl pt-6">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-slate-50">
            About this event
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-sm text-slate-200">
          {event.description ? (
            <p className="leading-relaxed whitespace-pre-wrap">
              {event.description}
            </p>
          ) : (
            <p className="text-slate-400 italic">
              No description provided for this event.
            </p>
          )}

          {/* Event Schedule for Multi-day events with different times */}
          {event.timeSlots && event.timeSlots.length > 0 && (
            <div className="pt-5 border-t border-slate-800/80">
              <h3 className="text-sm font-semibold text-slate-50 mb-3">Event Schedule</h3>
              <div className="space-y-2">
                {event.timeSlots.map((slot, index) => {
                   // Ensure format is YYYY-MM-DD for consistency
                   // If slot.date is invalid or missing, handle gracefully
                   if (!slot.date) return null;
                   
                   let dateStr = slot.date;
                   // If it's a full ISO string (e.g. from DB/JSON), extract just the date part
                   if (typeof dateStr === 'string' && dateStr.includes('T')) {
                     dateStr = dateStr.split('T')[0];
                   }
                   
                   const dateObj = new Date(`${dateStr}T00:00:00`);
                   if (isNaN(dateObj.getTime())) return null;

                   return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-900/50 border border-slate-800/80"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col items-center justify-center w-10 h-10 rounded-lg bg-slate-800/80 text-slate-200">
                          <span className="text-[10px] uppercase font-bold text-slate-400">
                            {dateObj.toLocaleDateString('en-US', { weekday: 'short' })}
                          </span>
                          <span className="text-sm font-bold">
                            {dateObj.getDate()}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-slate-200">
                          {dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      <div className="text-sm text-slate-300 font-mono bg-slate-950/50 px-3 py-1.5 rounded-lg border border-slate-800">
                        {new Date(`2000-01-01T${slot.startTime}`).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                        {' - '}
                        {new Date(`2000-01-01T${slot.endTime}`).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Attendees - Only visible to admin or event organizer */}
          {(user?.role === 'admin' ||
            (user && event.organizer && user.id === event.organizer.id)) &&
            event.attendees &&
            event.attendees.length > 0 && (
              <div className="pt-5 border-t border-slate-800/80">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-300" />
                    <h3 className="text-sm font-semibold text-slate-50">
                      Attendees
                    </h3>
                  </div>
                  <span className="text-xs text-slate-400">
                    {event.attendees.length}{' '}
                    {event.attendees.length === 1
                      ? 'person attending'
                      : 'people attending'}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {event.attendees.map((attendee) => {
                    const name = attendee?.user?.name || 'Guest';
                    const initial = name?.charAt(0)?.toUpperCase() || '?';

                    return (
                      <div
                        key={attendee.id}
                        className="flex items-center gap-3 p-3 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-colors">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-xs font-semibold text-white">
                          {initial}
                        </div>
                        <span className="text-sm font-medium text-slate-100 truncate">
                          {name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
        </CardContent>
      </Card>
    </section>
  );
}
