import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function RecentRsvps({ recentRsvps }) {
  if (!recentRsvps || recentRsvps.length === 0) return null;

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
    <div className="mt-6">
      <Card className={'pt-6'}>
        <CardHeader>
          <CardTitle>Recent RSVPs</CardTitle>
          <CardDescription>Latest 10 event registrations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recentRsvps.map((rsvp) => (
              <div
                key={rsvp.id}
                className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                <div>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {rsvp.userName}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">
                    {' '}
                    registered for{' '}
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {rsvp.eventTitle}
                  </span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDate(rsvp.rsvpDate)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
