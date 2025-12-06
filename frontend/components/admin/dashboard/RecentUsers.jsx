import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function RecentUsers({ recentUsers }) {
  if (!recentUsers) return null;

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
        <CardTitle className="text-slate-50">Recent Users</CardTitle>
        <CardDescription className="text-slate-400">Latest 10 registered users</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentUsers.map((user) => (
            <div
              key={user.id}
              className="flex justify-between items-start p-3 bg-slate-900/50 border border-slate-800 rounded-lg hover:border-slate-700 transition-colors">
              <div>
                <div className="font-medium text-slate-200">
                  {user.name}
                </div>
                <div className="text-sm text-slate-400">
                  {user.email}
                </div>
              </div>
              <div className="text-right space-y-1">
                <div className={`text-xs capitalize px-2 py-0.5 rounded inline-block ${
                  user.role === 'admin' ? 'bg-purple-500/20 text-purple-300' :
                  user.role === 'organizer' ? 'bg-amber-500/20 text-amber-300' :
                  'bg-blue-500/20 text-blue-300'
                }`}>
                  {user.role}
                </div>
                <div className="text-xs text-slate-500">
                  {formatDate(user.createdAt)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
