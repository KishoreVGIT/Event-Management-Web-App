import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function EventsByStatus({ eventsByStatus }) {
  if (!eventsByStatus) return null;

  return (
    <Card className={'pt-6'}>
      <CardHeader>
        <CardTitle>Events by Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {eventsByStatus.map((item) => (
            <div
              key={item.status}
              className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
              <span className="capitalize font-medium">{item.status}</span>
              <span className="text-gray-600 dark:text-gray-400">
                {item.count}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
