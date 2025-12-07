import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function UpcomingEvents({ upcomingEvents }) {
  if (!upcomingEvents) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card className="bg-slate-950/70 border-slate-800/70 backdrop-blur-xl h-full pt-6">
      <CardHeader>
        <CardTitle className="text-slate-50">Upcoming Events</CardTitle>
        <CardDescription className="text-slate-400">Next 10 active events</CardDescription>
      </CardHeader>
      <CardContent>
        {upcomingEvents.length > 0 ? (
          <div className="space-y-3">
            {upcomingEvents.map((event) => (
              <div
                key={event.id}
                className="p-3 bg-slate-900/50 border border-slate-800 rounded-lg hover:border-slate-700 transition-colors">
                <div className="font-medium text-slate-200">
                  {event.title}
                </div>
                <div className="text-sm text-slate-400 mt-0.5">
                  By {event.organizerName}
                </div>
                <div className="flex justify-between items-center mt-2.5 pt-2 border-t border-slate-800">
                  <div className="text-xs text-slate-500">
                    {formatDate(event.startDate)}
                  </div>
                  <div className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                    👥 {event.attendeeCount} attendee
                    {event.attendeeCount !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center py-8 text-slate-500">
            No upcoming events
          </p>
        )}
      </CardContent>
    </Card>
  );
}
