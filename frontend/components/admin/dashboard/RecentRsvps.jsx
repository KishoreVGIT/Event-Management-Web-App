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
      <Card className="bg-slate-950/70 border-slate-800/70 backdrop-blur-xl pt-6">
        <CardHeader>
          <CardTitle className="text-slate-50">Recent RSVPs</CardTitle>
          <CardDescription className="text-slate-400">Latest 10 event registrations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recentRsvps.map((rsvp) => (
              <div
                key={rsvp.id}
                className="flex justify-between items-center p-3 bg-slate-900/50 border border-slate-800 rounded-lg hover:bg-slate-800/30 transition-colors">
                <div>
                  <span className="font-medium text-slate-200">
                    {rsvp.userName}
                  </span>
                  <span className="text-slate-500 mx-1">
                    registered for
                  </span>
                  <span className="font-medium text-blue-400">
                    {rsvp.eventTitle}
                  </span>
                </div>
                <div className="text-xs text-slate-500 ml-4">
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
