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
