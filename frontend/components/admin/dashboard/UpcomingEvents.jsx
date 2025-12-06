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
    <Card className={'pt-6'}>
      <CardHeader>
        <CardTitle>Upcoming Events</CardTitle>
        <CardDescription>Next 10 active events</CardDescription>
      </CardHeader>
      <CardContent>
        {upcomingEvents.length > 0 ? (
          <div className="space-y-3">
            {upcomingEvents.map((event) => (
              <div
                key={event.id}
                className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
                <div className="font-medium text-gray-900 dark:text-white">
                  {event.title}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  By {event.organizerName}
                </div>
                <div className="flex justify-between items-center mt-2">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(event.startDate)}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    👥 {event.attendeeCount} attendee
                    {event.attendeeCount !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center py-8 text-gray-600 dark:text-gray-400">
            No upcoming events
          </p>
        )}
      </CardContent>
    </Card>
  );
}
