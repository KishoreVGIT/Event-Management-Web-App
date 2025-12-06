import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function StatsOverview({ stats }) {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card className="bg-slate-950/70 border-slate-800/70 backdrop-blur-xl pt-6">
        <CardHeader>
          <CardTitle className="text-2xl text-slate-50">{stats.totals.users}</CardTitle>
          <CardDescription className="text-slate-400">Total Users</CardDescription>
        </CardHeader>
      </Card>
      <Card className="bg-slate-950/70 border-slate-800/70 backdrop-blur-xl pt-6">
        <CardHeader>
          <CardTitle className="text-2xl text-slate-50">{stats.totals.events}</CardTitle>
          <CardDescription className="text-slate-400">Total Events</CardDescription>
        </CardHeader>
      </Card>
      <Card className="bg-slate-950/70 border-slate-800/70 backdrop-blur-xl pt-6">
        <CardHeader>
          <CardTitle className="text-2xl text-slate-50">{stats.totals.rsvps}</CardTitle>
          <CardDescription className="text-slate-400">Total RSVPs</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
