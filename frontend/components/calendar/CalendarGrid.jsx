import Link from 'next/link';

export function CalendarGrid({
  days,
  getEventsForDay,
  currentDate,
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="grid grid-cols-7 gap-2">
      {/* Day headers */}
      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
        <div
          key={day}
          className="p-2 text-center font-semibold text-slate-400 text-sm">
          {day}
        </div>
      ))}

      {/* Calendar days */}
      {days.map((day, index) => {
        if (day === null) {
          return (
            <div key={`empty-${index}`} className="p-2 min-h-[120px]" />
          );
        }

        const dayEvents = getEventsForDay(day);
        const currentDateObj = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          day
        );
        currentDateObj.setHours(0, 0, 0, 0);
        const isToday = currentDateObj.getTime() === today.getTime();

        return (
          <div
            key={day}
            className={`p-2 min-h-[120px] border rounded-xl transition-all ${
              isToday
                ? 'bg-blue-500/10 border-blue-500/30 shadow-lg shadow-blue-900/20'
                : 'bg-slate-900/30 border-slate-800/50 hover:border-slate-700'
            }`}>
            <div
              className={`text-sm font-semibold mb-2 ${
                isToday ? 'text-blue-400' : 'text-slate-300'
              }`}>
              {day}
            </div>
            <div className="space-y-1">
              {dayEvents.slice(0, 3).map((event) => (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="block">
                  <div className="text-xs p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors truncate shadow-sm">
                    {event.title}
                  </div>
                </Link>
              ))}
              {dayEvents.length > 3 && (
                <div className="text-xs text-slate-400 pl-1">
                  +{dayEvents.length - 3} more
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
