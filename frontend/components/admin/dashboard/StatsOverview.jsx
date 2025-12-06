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
      <Card className={'pt-6'}>
        <CardHeader>
          <CardTitle className="text-2xl">{stats.totals.users}</CardTitle>
          <CardDescription>Total Users</CardDescription>
        </CardHeader>
      </Card>
      <Card className={'pt-6'}>
        <CardHeader>
          <CardTitle className="text-2xl">{stats.totals.events}</CardTitle>
          <CardDescription>Total Events</CardDescription>
        </CardHeader>
      </Card>
      <Card className={'pt-6'}>
        <CardHeader>
          <CardTitle className="text-2xl">{stats.totals.rsvps}</CardTitle>
          <CardDescription>Total RSVPs</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
