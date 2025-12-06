import { Calendar } from 'lucide-react';
import { EventCard } from './EventCard';

export function EventsGrid({
  loading,
  filteredEvents,
  events,
  searchQuery,
  filterStatus,
  user,
  rsvpStatus,
  rsvpLoading,
  onRsvp,
  onCancelRsvp,
  onClearFilters,
  getEventStatus,
  formatEventDate,
}) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-14 h-14 rounded-full border-4 border-slate-700 border-t-blue-500 animate-spin mb-4" />
        <p className="text-sm font-medium text-slate-300">
          Loading events...
        </p>
      </div>
    );
  }

  if (filteredEvents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-20 h-20 bg-slate-900/60 border border-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-blue-900/40">
          <Calendar className="w-9 h-9 text-slate-400" />
        </div>
        <h3 className="text-xl font-semibold text-slate-50 mb-2">
          {searchQuery || filterStatus !== 'all'
            ? 'No events found'
            : 'No events available'}
        </h3>
        <p className="text-sm text-slate-400 mb-6">
          {searchQuery || filterStatus !== 'all'
            ? 'Try adjusting your search or filters'
            : 'Check back later for upcoming events'}
        </p>
        {(searchQuery || filterStatus !== 'all') && (
          <button
            onClick={onClearFilters}
            className="px-5 py-2.5 rounded-full text-sm font-medium bg-slate-950/70 text-slate-300 border border-slate-800/70 hover:bg-slate-900 hover:border-slate-700 hover:text-slate-100 transition-colors">
            Clear filters
          </button>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((event) => {
          const status = getEventStatus(event.startDate, event.endDate);
          return (
            <EventCard
              key={event.id}
              event={event}
              status={status}
              user={user}
              rsvpStatus={rsvpStatus[event.id]}
              rsvpLoading={rsvpLoading[event.id]}
              onRsvp={onRsvp}
              onCancelRsvp={onCancelRsvp}
              formatEventDate={formatEventDate}
            />
          );
        })}
      </div>

      {/* Results Summary */}
      <div className="mt-8 text-center">
        <p className="text-xs text-slate-400">
          Showing {filteredEvents.length} of {events.length} events
        </p>
      </div>
    </>
  );
}
