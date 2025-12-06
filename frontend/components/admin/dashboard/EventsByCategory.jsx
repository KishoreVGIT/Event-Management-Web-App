import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function EventsByCategory({ eventsByCategory }) {
  if (!eventsByCategory || eventsByCategory.length === 0) return null;

  return (
    <div className="mb-8">
      <Card className={'pt-6'}>
        <CardHeader>
          <CardTitle>Events by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {eventsByCategory.map((item) => (
              <div
                key={item.category}
                className="p-3 bg-gray-50 dark:bg-gray-800 rounded text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {item.count}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {item.category}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
