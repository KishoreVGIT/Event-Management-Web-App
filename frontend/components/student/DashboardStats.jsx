import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';

export function DashboardStats({ stats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card className="bg-slate-950/70 border-slate-800/70 backdrop-blur-xl shadow-lg shadow-blue-900/10 pt-6">
        <CardHeader className="pb-3 border-b border-slate-800/70">
          <CardTitle className="text-sm font-medium text-slate-400">
            Total RSVPs
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="text-3xl font-bold text-slate-50">{stats.totalRsvps}</div>
        </CardContent>
      </Card>

      <Card className="bg-slate-950/70 border-slate-800/70 backdrop-blur-xl shadow-lg shadow-blue-900/10 pt-6">
        <CardHeader className="pb-3 border-b border-slate-800/70">
          <CardTitle className="text-sm font-medium text-slate-400">
            Upcoming Events
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="text-3xl font-bold text-blue-400">
            {stats.upcomingEvents}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-950/70 border-slate-800/70 backdrop-blur-xl shadow-lg shadow-blue-900/10 pt-6">
        <CardHeader className="pb-3 border-b border-slate-800/70">
          <CardTitle className="text-sm font-medium text-slate-400">
            Past Events
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="text-3xl font-bold text-slate-500">
            {stats.pastEvents}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
