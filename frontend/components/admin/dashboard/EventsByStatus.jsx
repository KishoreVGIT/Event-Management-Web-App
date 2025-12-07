import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function EventsByStatus({ eventsByStatus }) {
  if (!eventsByStatus) return null;

  return (
    <Card className="bg-slate-950/70 border-slate-800/70 backdrop-blur-xl pt-6">
      <CardHeader>
        <CardTitle className="text-slate-50">Events by Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {eventsByStatus.map((item) => (
            <div
              key={item.status}
              className="flex justify-between items-center p-3 bg-slate-900/50 border border-slate-800 rounded-lg backdrop-blur-sm">
              <span className="capitalize font-medium text-slate-200">{item.status}</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                item.status === 'upcoming' ? 'bg-blue-500/20 text-blue-300' :
                item.status === 'ongoing' ? 'bg-emerald-500/20 text-emerald-300' :
                item.status === 'past' ? 'bg-slate-500/20 text-slate-300' :
                'bg-red-500/20 text-red-300'
              }`}>
                {item.count}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
