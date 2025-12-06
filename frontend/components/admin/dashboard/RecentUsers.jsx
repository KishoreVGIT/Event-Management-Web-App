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
    <Card className={'pt-6'}>
      <CardHeader>
        <CardTitle>Recent Users</CardTitle>
        <CardDescription>Latest 10 registered users</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentUsers.map((user) => (
            <div
              key={user.id}
              className="flex justify-between items-start p-3 bg-gray-50 dark:bg-gray-800 rounded">
              <div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {user.name}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {user.email}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs capitalize px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded">
                  {user.role}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
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
