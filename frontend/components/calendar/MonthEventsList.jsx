import Link from 'next/link';
import { List, Calendar as CalendarIcon } from 'lucide-react';

export function MonthEventsList({
  events,
  currentDate,
  monthName,
}) {
  const filteredEvents = events
    .filter((event) => {
      if (!event.startDate) return false;
      const eventDate = new Date(event.startDate);
      return (
        eventDate.getMonth() === currentDate.getMonth() &&
        eventDate.getFullYear() === currentDate.getFullYear()
      );
    })
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

  return (
    <div className="mt-8 pt-8 border-t border-slate-800/70">
      <h3 className="text-lg font-semibold mb-4 text-slate-50 flex items-center gap-2">
        <List className="w-5 h-5 text-blue-400" />
        All Events in {monthName}
      </h3>
      <div className="space-y-3">
        {filteredEvents.map((event) => (
          <Link key={event.id} href={`/events/${event.id}`}>
            <div className="p-4 border border-slate-800/50 rounded-xl hover:bg-slate-900/50 hover:border-slate-700 transition-all cursor-pointer group">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-50 group-hover:text-blue-400 transition-colors">
                    {event.title}
                  </h4>
                  <p className="text-sm text-slate-400 mt-1">
                    {new Date(event.startDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                  {event.location && (
                    <p className="text-sm text-slate-500 mt-1">
                      {event.location}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  {event.category && (
                    <span className="px-3 py-1 text-xs font-medium bg-blue-500/10 border border-blue-500/30 text-blue-300 rounded-full">
                      {event.category}
                    </span>
                  )}
                  <span className="text-sm text-slate-400">
                    {event.attendeeCount}{' '}
                    {event.capacity ? `/ ${event.capacity}` : ''} attending
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-900/60 border border-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <CalendarIcon className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-400">
              No events scheduled for this month
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
